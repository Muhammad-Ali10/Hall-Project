import { useState, useEffect, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { hallRegister } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(6, 'Must be at least 6 characters').required('Required'),
  hallName: Yup.string().required('Required'),
  phone: Yup.string()
    .test('phone-format', 'Invalid phone number (10 digits starting with 3-9)', function(value) {
      if (!value) return false;
      const cleaned = value.replace(/^(\+92|0)/, '');
      return /^[3-9]\d{9}$/.test(cleaned);
    })
    .required('Required'),
  ownerName: Yup.string().required('Required'),
  ownerPhone: Yup.string()
    .test('phone-format', 'Invalid phone number (10 digits starting with 3-9)', function(value) {
      if (!value) return false;
      const cleaned = value.replace(/^(\+92|0)/, '');
      return /^[3-9]\d{9}$/.test(cleaned);
    })
    .required('Required'),
  address: Yup.object({
    fullAddress: Yup.string().required('Full address is required'),
    city: Yup.string().required('City is required'),
    state: Yup.string().required('State is required'),
    pincode: Yup.string().required('Pincode is required'),
    street: Yup.string(),
  }),
  price: Yup.number().min(0, 'Price must be positive').required('Price is required'),
  capacity: Yup.number().min(1, 'Capacity must be at least 1').required('Capacity is required'),
  description: Yup.string().min(20, 'Description must be at least 20 characters').required('Description is required'),
  privacyPolicyAccepted: Yup.boolean().oneOf([true], 'Must accept privacy policy'),
});

const HallRegister = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const addressInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  const [selectedImages, setSelectedImages] = useState([]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      hallName: '',
      phone: '',
      ownerName: '',
      ownerPhone: '',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: '',
        fullAddress: '',
      },
      price: '',
      capacity: '',
      description: '',
      gst: '',
      privacyPolicyAccepted: false,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setLoading(true);
      try {
        console.log('Form submitted with values:', values);
        
        // Validate images
        if (selectedImages.length === 0) {
          toast.error('Please upload at least one hall image');
          setSubmitting(false);
          return;
        }

        // Normalize phone numbers before submission (remove leading 0 or +92)
        const normalizedValues = {
          email: values.email,
          password: values.password,
          hallName: values.hallName,
          phone: values.phone ? values.phone.replace(/^(\+92|0)/, '') : '',
          ownerName: values.ownerName,
          ownerPhone: values.ownerPhone ? values.ownerPhone.replace(/^(\+92|0)/, '') : '',
          address: {
            fullAddress: values.address.fullAddress,
            city: values.address.city,
            state: values.address.state,
            pincode: values.address.pincode,
            ...(values.address.street && { street: values.address.street }),
          },
          price: parseFloat(values.price),
          capacity: parseInt(values.capacity),
          description: values.description,
          ...(values.gst && { gst: values.gst }),
          privacyPolicyAccepted: values.privacyPolicyAccepted === true || values.privacyPolicyAccepted === 'true',
        };

        // Create FormData for file upload
        const formData = new FormData();
        Object.keys(normalizedValues).forEach((key) => {
          if (key === 'address') {
            formData.append('address', JSON.stringify(normalizedValues[key]));
          } else {
            formData.append(key, normalizedValues[key]);
          }
        });
        
        // Append images
        selectedImages.forEach((file) => {
          formData.append('photos', file);
        });
        
        console.log('Submitting form with images:', selectedImages.length);
        
        const result = await dispatch(hallRegister(formData)).unwrap();
        console.log('Registration result:', result);
        
        toast.success('Registration successful! Waiting for admin approval.');
        navigate('/login');
      } catch (error) {
        console.error('Registration error:', error);
        // Extract error message from different possible error formats
        let errorMessage = 'Registration failed. Please try again.';
        if (error?.message) {
          errorMessage = error.message;
        } else if (error?.error) {
          errorMessage = error.error;
        } else if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
          errorMessage = error.response.data.errors.map(e => e.msg || e.message).join(', ');
        }
        toast.error(errorMessage);
      } finally {
        setLoading(false);
        setSubmitting(false);
      }
    },
  });

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places && addressInputRef.current) {
      if (autocompleteRef.current) {
        // Already initialized
        return;
      }

      const autocomplete = new window.google.maps.places.Autocomplete(
        addressInputRef.current,
        {
          types: ['address'],
          componentRestrictions: { country: 'pk' }, // Restrict to Pakistan
        }
      );

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        
        if (!place.geometry) {
          toast.error('No details available for the selected address');
          return;
        }

        // Extract address components
        let street = '';
        let city = '';
        let state = '';
        let pincode = '';
        let fullAddress = place.formatted_address || '';

        place.address_components.forEach((component) => {
          const types = component.types;
          
          if (types.includes('street_number') || types.includes('route')) {
            street = component.long_name;
          }
          if (types.includes('locality') || types.includes('administrative_area_level_2')) {
            city = component.long_name;
          }
          if (types.includes('administrative_area_level_1')) {
            state = component.long_name;
          }
          if (types.includes('postal_code')) {
            pincode = component.long_name;
          }
        });

        // Update form values
        formik.setFieldValue('address.fullAddress', fullAddress);
        if (city) formik.setFieldValue('address.city', city);
        if (state) formik.setFieldValue('address.state', state);
        if (pincode) formik.setFieldValue('address.pincode', pincode);
        if (street) formik.setFieldValue('address.street', street);

        toast.success('Address autofilled from Google Maps');
      });

      autocompleteRef.current = autocomplete;
    }
  }, [formik]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Hall Owner Registration</h2>
        <form onSubmit={formik.handleSubmit}>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                {...formik.getFieldProps('email')}
                className="w-full px-4 py-2 border rounded-lg"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-sm">{formik.errors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Password *</label>
              <input
                type="password"
                {...formik.getFieldProps('password')}
                className="w-full px-4 py-2 border rounded-lg"
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-sm">{formik.errors.password}</p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Hall Name *</label>
            <input
              type="text"
              {...formik.getFieldProps('hallName')}
              className="w-full px-4 py-2 border rounded-lg"
            />
            {formik.touched.hallName && formik.errors.hallName && (
              <p className="text-red-500 text-sm">{formik.errors.hallName}</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2">Hall Phone *</label>
              <input
                type="tel"
                {...formik.getFieldProps('phone')}
                className="w-full px-4 py-2 border rounded-lg"
              />
              {formik.touched.phone && formik.errors.phone && (
                <p className="text-red-500 text-sm">{formik.errors.phone}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Owner Name *</label>
              <input
                type="text"
                {...formik.getFieldProps('ownerName')}
                className="w-full px-4 py-2 border rounded-lg"
              />
              {formik.touched.ownerName && formik.errors.ownerName && (
                <p className="text-red-500 text-sm">{formik.errors.ownerName}</p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Owner Phone *</label>
            <input
              type="tel"
              {...formik.getFieldProps('ownerPhone')}
              className="w-full px-4 py-2 border rounded-lg"
            />
            {formik.touched.ownerPhone && formik.errors.ownerPhone && (
              <p className="text-red-500 text-sm">{formik.errors.ownerPhone}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Full Address *</label>
            <input
              ref={addressInputRef}
              type="text"
              name="address.fullAddress"
              value={formik.values.address.fullAddress || ''}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Start typing your address or use Google Maps autocomplete"
              className="w-full px-4 py-2 border rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 Tip: Start typing your address and select from Google Maps suggestions for accurate location
            </p>
            {formik.touched.address?.fullAddress && formik.errors.address?.fullAddress && (
              <p className="text-red-500 text-sm">{formik.errors.address.fullAddress}</p>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2">City *</label>
              <input
                type="text"
                name="address.city"
                value={formik.values.address.city || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-4 py-2 border rounded-lg"
              />
              {formik.touched.address?.city && formik.errors.address?.city && (
                <p className="text-red-500 text-sm">{formik.errors.address.city}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 mb-2">State *</label>
              <input
                type="text"
                name="address.state"
                value={formik.values.address.state || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-4 py-2 border rounded-lg"
              />
              {formik.touched.address?.state && formik.errors.address?.state && (
                <p className="text-red-500 text-sm">{formik.errors.address.state}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Pincode *</label>
              <input
                type="text"
                name="address.pincode"
                value={formik.values.address.pincode || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-4 py-2 border rounded-lg"
              />
              {formik.touched.address?.pincode && formik.errors.address?.pincode && (
                <p className="text-red-500 text-sm">{formik.errors.address.pincode}</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2">Price (₹) *</label>
              <input
                type="number"
                {...formik.getFieldProps('price')}
                placeholder="Enter price per event"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              {formik.touched.price && formik.errors.price && (
                <p className="text-red-500 text-sm">{formik.errors.price}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Seating Capacity *</label>
              <input
                type="number"
                {...formik.getFieldProps('capacity')}
                placeholder="Enter maximum capacity"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              {formik.touched.capacity && formik.errors.capacity && (
                <p className="text-red-500 text-sm">{formik.errors.capacity}</p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Description *</label>
            <textarea
              {...formik.getFieldProps('description')}
              placeholder="Describe your hall, facilities, and what makes it special..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              rows="4"
            />
            {formik.touched.description && formik.errors.description && (
              <p className="text-red-500 text-sm">{formik.errors.description}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Minimum 20 characters required</p>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Hall Images *</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files);
                setSelectedImages(files);
              }}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-xs text-gray-500 mt-1">Upload multiple images of your hall (at least 1 required)</p>
            {selectedImages.length > 0 && (
              <div className="mt-2 grid grid-cols-4 gap-2">
                {selectedImages.map((file, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-20 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedImages(selectedImages.filter((_, i) => i !== idx))}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">GST Number (Optional)</label>
            <input
              type="text"
              {...formik.getFieldProps('gst')}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formik.values.privacyPolicyAccepted}
                onChange={formik.handleChange}
                name="privacyPolicyAccepted"
                className="mr-2"
              />
              <span className="text-sm">I accept the privacy policy *</span>
            </label>
            {formik.touched.privacyPolicyAccepted && formik.errors.privacyPolicyAccepted && (
              <p className="text-red-500 text-sm">{formik.errors.privacyPolicyAccepted}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || formik.isSubmitting}
            className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 font-semibold shadow-lg"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
          
          {/* Debug: Show validation errors */}
          {Object.keys(formik.errors).length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-sm font-semibold text-red-600 mb-2">Validation Errors:</p>
              <ul className="text-xs text-red-600 list-disc list-inside">
                {Object.entries(formik.errors).map(([key, error]) => (
                  <li key={key}>{key}: {String(error)}</li>
                ))}
              </ul>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default HallRegister;

