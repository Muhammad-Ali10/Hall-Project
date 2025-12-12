const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { sendOTP, verifyOTP } = require('../services/otpService');
const { getCoordinatesFromAddress } = require('../utils/geolocation');
const Hall = require('../models/Hall');

// Customer OTP Login - Send OTP
exports.sendCustomerOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    console.log(`\n🔔 OTP Request received for phone: ${phone}`);

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    let user = await User.findOne({ phone, role: 'customer' });

    if (!user) {
      console.log(`👤 Creating new user for phone: ${phone}`);
      user = new User({
        phone,
        role: 'customer',
        isVerified: false,
      });
    } else {
      console.log(`👤 Found existing user for phone: ${phone}`);
    }

    const otpData = await sendOTP(phone);
    user.otp = otpData;
    await user.save();

    console.log(`✅ OTP saved to database for user: ${user._id}\n`);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      phone,
      // In development, include OTP in response for testing (remove in production)
      ...(process.env.NODE_ENV === 'development' && { 
        debugOTP: otpData.code,
        note: 'OTP shown only in development mode'
      }),
    });
  } catch (error) {
    console.error('❌ Error in sendCustomerOTP:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send OTP',
    });
  }
};

// Customer OTP Login - Verify OTP
exports.verifyCustomerOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    const user = await User.findOne({ phone, role: 'customer' });

    if (!user || !user.otp) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found. Please request a new OTP',
      });
    }

    if (!verifyOTP(user.otp, otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        phone: user.phone,
        role: user.role,
        profile: user.profile,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify OTP',
    });
  }
};

// Hall Owner Registration
exports.registerHall = async (req, res) => {
  try {
    let {
      email,
      password,
      hallName,
      phone,
      ownerName,
      ownerPhone,
      address,
      gst,
      description,
      privacyPolicyAccepted,
      price,
      capacity,
    } = req.body;

    // Parse address if it's a JSON string (from FormData)
    if (typeof address === 'string') {
      try {
        address = JSON.parse(address);
      } catch (e) {
        // If parsing fails, try to construct from individual fields
        address = {
          fullAddress: req.body['address.fullAddress'] || req.body.address || '',
          city: req.body['address.city'] || '',
          state: req.body['address.state'] || '',
          pincode: req.body['address.pincode'] || '',
          street: req.body['address.street'] || '',
        };
      }
    }
    
    // Ensure address is an object
    if (!address || typeof address !== 'object') {
      address = {
        fullAddress: req.body['address.fullAddress'] || '',
        city: req.body['address.city'] || '',
        state: req.body['address.state'] || '',
        pincode: req.body['address.pincode'] || '',
        street: req.body['address.street'] || '',
      };
    }

    // Normalize phone numbers: remove leading 0 or +92
    if (phone) {
      phone = phone.replace(/^(\+92|0)/, '');
    }
    if (ownerPhone) {
      ownerPhone = ownerPhone.replace(/^(\+92|0)/, '');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Get coordinates from address - REQUIRED for location-based search
    let coordinates = null;
    let locationData = null;
    if (address) {
      try {
        // Check if Google Maps API key is configured
        if (!process.env.GOOGLE_MAPS_API_KEY) {
          console.warn('⚠️ GOOGLE_MAPS_API_KEY not configured. Skipping geocoding.');
        } else {
          // Build a complete address string from all address fields for better geocoding
          let addressString = '';
          if (address.fullAddress) {
            addressString = address.fullAddress;
          } else {
            // Construct address from individual fields
            const addressParts = [];
            if (address.street) addressParts.push(address.street);
            if (address.city) addressParts.push(address.city);
            if (address.state) addressParts.push(address.state);
            if (address.pincode) addressParts.push(address.pincode);
            addressString = addressParts.join(', ');
          }
          
          // Add city, state, and pincode if not already in fullAddress for better geocoding accuracy
          if (addressString && address.city && !addressString.toLowerCase().includes(address.city.toLowerCase())) {
            addressString += `, ${address.city}`;
          }
          if (addressString && address.state && !addressString.toLowerCase().includes(address.state.toLowerCase())) {
            addressString += `, ${address.state}`;
          }
          if (addressString && address.pincode && !addressString.includes(address.pincode)) {
            addressString += ` ${address.pincode}`;
          }
          
          if (!addressString || addressString.trim() === '') {
            console.warn('⚠️ No address provided for geocoding');
          } else {
            console.log(`🔍 Geocoding address: ${addressString}`);
            const geocodeResult = await getCoordinatesFromAddress(addressString);
            if (geocodeResult && 
                geocodeResult.lat && 
                geocodeResult.lng && 
                !isNaN(geocodeResult.lat) && 
                !isNaN(geocodeResult.lng) &&
                geocodeResult.lat !== 0 &&
                geocodeResult.lng !== 0) {
              coordinates = [parseFloat(geocodeResult.lng), parseFloat(geocodeResult.lat)];
              
              // Store enhanced location data
              locationData = {
                type: 'Point',
                coordinates: coordinates,
                latitude: geocodeResult.lat,
                longitude: geocodeResult.lng,
              };
              
              // Update address with geocoded details if available
              if (geocodeResult.formattedAddress) {
                address.formattedAddress = geocodeResult.formattedAddress;
              }
              if (geocodeResult.city && !address.city) {
                address.city = geocodeResult.city;
              }
              if (geocodeResult.state && !address.state) {
                address.state = geocodeResult.state;
              }
              if (geocodeResult.region && !address.region) {
                address.region = geocodeResult.region;
              }
              if (geocodeResult.postalCode && !address.pincode) {
                address.pincode = geocodeResult.postalCode;
                address.postalCode = geocodeResult.postalCode;
              }
              if (geocodeResult.country && !address.country) {
                address.country = geocodeResult.country;
              }
              
              console.log(`✅ Geocoded new hall: ${hallName} - ${address.fullAddress} -> [${geocodeResult.lng}, ${geocodeResult.lat}]`);
            } else {
              console.warn('⚠️ Invalid coordinates returned from geocoding');
              coordinates = null;
              locationData = null;
            }
          }
        }
      } catch (error) {
        console.error('❌ Geocoding error during registration:', error.message);
        // Still create hall but without coordinates - will be geocoded later
        coordinates = null;
      }
    } else {
      console.warn('⚠️ No address provided for hall registration');
    }

    // Create user
    const user = new User({
      email,
      password,
      role: 'hall',
      hallApprovalStatus: 'pending',
      profile: {
        name: ownerName,
      },
    });
    await user.save();

    // Handle uploaded photos
    const photos = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        photos.push({
          url: file.url || file.cloudinary?.url || file.path,
          publicId: file.publicId || file.cloudinary?.publicId || file.filename,
        });
      });
    }

    // Create hall
    const hallData = {
      owner: user._id,
      name: hallName,
      phone,
      ownerName,
      ownerPhone,
      address: {
        ...address,
        fullAddress: address.fullAddress,
      },
      description: description || '',
      price: price ? parseFloat(price) : undefined,
      capacity: capacity ? parseInt(capacity) : undefined,
      photos: photos,
      gst: gst || undefined,
      isActive: false,
    };

    // Only add location if coordinates were successfully obtained
    // IMPORTANT: Don't set location at all if coordinates are missing/invalid
    // MongoDB 2dsphere index requires coordinates to be present if location exists
    if (locationData && 
        locationData.coordinates && 
        Array.isArray(locationData.coordinates) && 
        locationData.coordinates.length === 2 && 
        locationData.coordinates[0] !== 0 && 
        locationData.coordinates[1] !== 0 &&
        !isNaN(locationData.coordinates[0]) &&
        !isNaN(locationData.coordinates[1])) {
      hallData.location = locationData;
    }
    // If coordinates are missing, don't set location field at all
    // This prevents MongoDB from trying to index an incomplete location object

    const hall = new Hall(hallData);
    await hall.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful. Waiting for admin approval',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        hallApprovalStatus: user.hallApprovalStatus,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed',
    });
  }
};

// Hall Owner Login
exports.loginHall = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, role: 'hall' }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        hallApprovalStatus: user.hallApprovalStatus,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed',
    });
  }
};

// Service Provider Registration
exports.registerServiceProvider = async (req, res) => {
  try {
    const { email, password, businessName, category, phone, description, address, city, plNumber } = req.body;
    let bankDetailsObj = null;
    
    if (req.body.bankDetails) {
      try {
        bankDetailsObj = typeof req.body.bankDetails === 'string' 
          ? JSON.parse(req.body.bankDetails) 
          : req.body.bankDetails;
      } catch (e) {
        bankDetailsObj = null;
      }
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    const user = new User({
      email,
      password,
      role: 'serviceProvider',
      isVerified: true,
      profile: {
        name: businessName,
      },
    });
    await user.save();

    // Handle ID proof file
    let idProofData = null;
    if (req.file) {
      idProofData = {
        url: req.file.url || req.file.cloudinary?.url || req.file.path,
        publicId: req.file.publicId || req.file.cloudinary?.publicId || req.file.filename,
        type: 'other',
      };
    }

    const ServiceProvider = require('../models/ServiceProvider');
    const serviceProvider = new ServiceProvider({
      user: user._id,
      businessName,
      category,
      phone,
      description,
      address,
      city,
      idProof: idProofData,
      plNumber,
      bankDetails: bankDetailsObj,
    });
    await serviceProvider.save();

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed',
    });
  }
};

// Service Provider Login
exports.loginServiceProvider = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, role: 'serviceProvider' }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed',
    });
  }
};

// Admin Login
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET is not configured in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error. Please contact administrator.',
      });
    }

    const user = await User.findOne({ email, role: 'admin' }).select('+password');
    if (!user) {
      console.log('❌ Admin login failed: User not found with email:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if user has password (in case admin was created without password)
    if (!user.password) {
      console.error('❌ Admin user found but has no password:', email);
      return res.status(500).json({
        success: false,
        message: 'Admin account configuration error. Please contact administrator.',
      });
    }

    console.log('🔍 Admin login attempt:', {
      email,
      hasPassword: !!user.password,
      passwordLength: user.password?.length,
    });

    const isPasswordValid = await user.comparePassword(password);
    console.log('🔐 Password comparison result:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Admin login failed: Invalid password for email:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

// Get Current User
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get user',
    });
  }
};

// Password Reset - Request OTP
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email, phone } = req.body;
    const { sendOTP } = require('../services/otpService');
    const { sendOTPEmail } = require('../services/emailService');

    // Find user by email or phone
    let user;
    if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
    } else if (phone) {
      user = await User.findOne({ phone });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Email or phone number is required',
      });
    }

    if (!user) {
      // Don't reveal if user exists for security
      return res.json({
        success: true,
        message: 'If the account exists, an OTP has been sent',
      });
    }

    // Generate and send OTP
    const otpData = await sendOTP(phone || email);
    
    // If email provided, also send email OTP
    if (email && user.email) {
      await sendOTPEmail(email, otpData.code, 'password reset');
    }

    // Store OTP in user document
    user.passwordResetOTP = otpData;
    await user.save();

    return res.json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        method: email ? 'email' : 'phone',
        identifier: email || phone,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send OTP',
    });
  }
};

// Password Reset - Verify OTP and Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, phone, otp, newPassword } = req.body;
    const { verifyOTP } = require('../services/otpService');

    // Validate input
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Find user
    let user;
    if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
    } else if (phone) {
      user = await User.findOne({ phone });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Email or phone number is required',
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify OTP
    const storedOTP = user.passwordResetOTP;
    if (!verifyOTP(storedOTP, otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    // Update password
    user.password = newPassword;
    user.passwordResetOTP = undefined;
    await user.save();

    return res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to reset password',
    });
  }
};
