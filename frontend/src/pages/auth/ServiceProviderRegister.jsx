import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { serviceProviderRegister } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(6, 'Must be at least 6 characters').required('Required'),
  businessName: Yup.string().required('Required'),
  category: Yup.string().required('Required'),
  phone: Yup.string().matches(/^[6-9]\d{9}$/, 'Invalid phone number').required('Required'),
});

const ServiceProviderRegister = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [idProofFile, setIdProofFile] = useState(null);
  const [plNumber, setPlNumber] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    ifsc: '',
    bankName: '',
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      businessName: '',
      category: '',
      phone: '',
      description: '',
      address: '',
      city: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const formData = new FormData();
        Object.keys(values).forEach((key) => {
          formData.append(key, values[key]);
        });
        if (idProofFile) {
          formData.append('idProof', idProofFile);
        }
        if (plNumber) {
          formData.append('plNumber', plNumber);
        }
        if (bankDetails.accountNumber) {
          formData.append('bankDetails', JSON.stringify(bankDetails));
        }
        
        await dispatch(serviceProviderRegister(formData)).unwrap();
        toast.success('Registration successful!');
        navigate('/dashboard/service-provider');
      } catch (error) {
        toast.error(error.message || 'Registration failed');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-8 border-2 border-orange-100">
        <h2 className="text-3xl font-bold text-center mb-6 text-orange-600">Service Provider Registration</h2>
        <form onSubmit={formik.handleSubmit}>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2 font-semibold">Email *</label>
              <input
                type="email"
                {...formik.getFieldProps('email')}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-sm">{formik.errors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 mb-2 font-semibold">Password *</label>
              <input
                type="password"
                {...formik.getFieldProps('password')}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-sm">{formik.errors.password}</p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-semibold">Business Name *</label>
            <input
              type="text"
              {...formik.getFieldProps('businessName')}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
            />
            {formik.touched.businessName && formik.errors.businessName && (
              <p className="text-red-500 text-sm">{formik.errors.businessName}</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2 font-semibold">Category *</label>
              <select
                {...formik.getFieldProps('category')}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
              >
                <option value="">Select category</option>
                <option value="decoration">Decoration</option>
                <option value="catering">Catering</option>
                <option value="photography">Photography</option>
                <option value="makeup">Makeup</option>
                <option value="travel">Travel</option>
                <option value="other">Other</option>
              </select>
              {formik.touched.category && formik.errors.category && (
                <p className="text-red-500 text-sm">{formik.errors.category}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 mb-2 font-semibold">Phone *</label>
              <input
                type="tel"
                {...formik.getFieldProps('phone')}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
              />
              {formik.touched.phone && formik.errors.phone && (
                <p className="text-red-500 text-sm">{formik.errors.phone}</p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-semibold">Description</label>
            <textarea
              {...formik.getFieldProps('description')}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
              rows="3"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2 font-semibold">Address</label>
              <input
                type="text"
                {...formik.getFieldProps('address')}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2 font-semibold">City</label>
              <input
                type="text"
                {...formik.getFieldProps('city')}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-semibold">ID Proof (PDF/Image) *</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setIdProofFile(e.target.files[0])}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-semibold">PL Number (Optional)</label>
            <input
              type="text"
              value={plNumber}
              onChange={(e) => setPlNumber(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-semibold">Bank Details (Optional)</label>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Account Number</label>
                <input
                  type="text"
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">IFSC</label>
                <input
                  type="text"
                  value={bankDetails.ifsc}
                  onChange={(e) => setBankDetails({ ...bankDetails, ifsc: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={bankDetails.bankName}
                  onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50 font-semibold shadow-lg"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ServiceProviderRegister;
