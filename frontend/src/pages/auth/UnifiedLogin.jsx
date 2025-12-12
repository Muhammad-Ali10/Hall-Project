import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { sendOTP, verifyOTP, hallLogin, serviceProviderLogin, adminLogin } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';

const UnifiedLogin = () => {
  const [loginType, setLoginType] = useState('customer'); // 'customer', 'email'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpStep, setOtpStep] = useState('phone'); // 'phone' or 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    // Validate phone number using libphonenumber-js
    if (!phone) {
      toast.error('Please enter a phone number');
      return;
    }

    // Validate phone number format
    if (!isValidPhoneNumber(phone)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    // Parse and format phone number for backend (E.164 format)
    let phoneToSend;
    try {
      const phoneNumber = parsePhoneNumber(phone);
      phoneToSend = phoneNumber.format('E.164'); // Format: +919945118010
      console.log('Validated phone:', phoneToSend);
    } catch (error) {
      toast.error('Invalid phone number format');
      return;
    }
    
    setLoading(true);
    try {
      // Send phone number in E.164 format to backend
      await dispatch(sendOTP(phoneToSend)).unwrap();
      toast.success('OTP sent to your phone');
      setOtpStep('otp');
    } catch (error) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter 6-digit OTP');
      return;
    }
    
    // Format phone to E.164 for verification
    let phoneToVerify = phone;
    try {
      if (phone && isValidPhoneNumber(phone)) {
        const phoneNumber = parsePhoneNumber(phone);
        phoneToVerify = phoneNumber.format('E.164');
      }
    } catch (error) {
      console.error('Error formatting phone for verification:', error);
    }
    
    setLoading(true);
    try {
      const result = await dispatch(verifyOTP({ phone: phoneToVerify, otp })).unwrap();
      toast.success('Login successful');
      navigate('/dashboard/customer');
    } catch (error) {
      toast.error(error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    console.log('Form submitted - handleEmailLogin called');
    console.log('Email:', email);
    console.log('Password:', password ? '***' : 'empty');
    
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    
    setLoading(true);
    console.log('Loading set to true, starting login attempts...');
    
    try {
      console.log('Attempting login with email:', email);
      
      // Try hall login first
      try {
        const result = await dispatch(hallLogin({ email, password })).unwrap();
        console.log('Hall login successful:', result);
        toast.success('Login successful');
        navigate('/dashboard/hall');
        return;
      } catch (hallError) {
        console.log('Hall login failed, trying service provider:', hallError.message);
        
        // Try service provider login
        try {
          const result = await dispatch(serviceProviderLogin({ email, password })).unwrap();
          console.log('Service provider login successful:', result);
          toast.success('Login successful');
          navigate('/dashboard/service-provider');
          return;
        } catch (spError) {
          console.log('Service provider login failed, trying admin:', spError.message);
          
          // Try admin login
          try {
            const result = await dispatch(adminLogin({ email, password })).unwrap();
            console.log('Admin login successful:', result);
            toast.success('Login successful');
            navigate('/dashboard/admin');
            return;
          } catch (adminError) {
            console.error('Admin login failed:', adminError);
            // All login attempts failed
            throw adminError;
          }
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error?.response?.data);
      
      // Extract error message from different possible formats
      let errorMessage = 'Invalid credentials. Please check your email and password.';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.error) {
        errorMessage = error.error;
      } else if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        errorMessage = error.response.data.errors.map(e => e.msg || e.message).join(', ');
      }
      
      // Always show error toast for login failures
      console.log('Showing error toast:', errorMessage);
      toast.error(errorMessage, {
        duration: 5000,
        position: 'top-center',
        style: {
          background: '#ef4444',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
          fontSize: '16px',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border-2 border-orange-100">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-600 mb-2">HallBooking</h1>
          <p className="text-gray-600">Welcome back! Please login to continue</p>
        </div>

        {/* Login Type Toggle */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => {
              setLoginType('customer');
              setOtpStep('phone');
              setPhone('');
              setOtp('');
            }}
            className={`flex-1 py-2 rounded-md font-semibold transition ${
              loginType === 'customer'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-gray-600 hover:text-orange-600'
            }`}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginType('email');
              setEmail('');
              setPassword('');
            }}
            className={`flex-1 py-2 rounded-md font-semibold transition ${
              loginType === 'email'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-gray-600 hover:text-orange-600'
            }`}
          >
            Hall/Provider/Admin
          </button>
        </div>

        {/* Customer OTP Login */}
        {loginType === 'customer' && (
          <>
            {otpStep === 'phone' ? (
              <form onSubmit={handleSendOTP}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">Phone Number</label>
                  <div className="relative">
                    <PhoneInput
                      international
                      defaultCountry="IN"
                      value={phone}
                      onChange={(value) => {
                        setPhone(value || '');
                      }}
                      countrySelectProps={{ unicodeFlags: true }}
                      className="phone-input-custom"
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Select your country and enter your phone number
                  </p>
                  {phone && !isValidPhoneNumber(phone) && (
                    <p className="text-xs text-red-500 mt-1">
                      Please enter a valid phone number
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading || !phone || !isValidPhoneNumber(phone)}
                  className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 transition text-center text-2xl tracking-widest"
                    required
                    maxLength={6}
                  />
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    OTP sent to {phone ? (() => {
                      try {
                        if (isValidPhoneNumber(phone)) {
                          const phoneNumber = parsePhoneNumber(phone);
                          return phoneNumber.formatInternational();
                        }
                        return phone;
                      } catch {
                        return phone;
                      }
                    })() : 'your phone'}
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50 transition shadow-lg mb-2"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOtpStep('phone');
                    setOtp('');
                  }}
                  className="w-full text-orange-600 py-2 font-semibold hover:text-orange-700"
                >
                  Change Phone Number
                </button>
              </form>
            )}
          </>
        )}

        {/* Email/Password Login */}
        {loginType === 'email' && (
          <form onSubmit={handleEmailLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 transition"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 transition"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg mb-4"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <div className="text-center space-y-2">
              <Link to="/hall/register" className="block text-orange-600 hover:text-orange-700 font-semibold">
                Register as Hall Owner
              </Link>
              <Link to="/service-provider/register" className="block text-orange-600 hover:text-orange-700 font-semibold">
                Register as Service Provider
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UnifiedLogin;

