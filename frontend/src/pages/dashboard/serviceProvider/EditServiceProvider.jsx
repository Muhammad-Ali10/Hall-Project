import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import { FiSave } from 'react-icons/fi';

const EditServiceProvider = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadServiceProvider();
  }, []);

  const loadServiceProvider = async () => {
    try {
      const response = await api.get('/service-providers/my');
      const sp = response.data.data;
      formik.setValues({
        businessName: sp.businessName || '',
        category: sp.category || '',
        description: sp.description || '',
        phone: sp.phone || '',
        email: sp.email || '',
        address: sp.address || '',
        city: sp.city || '',
      });
    } catch (error) {
      toast.error('Failed to load service provider data');
    } finally {
      setLoading(false);
    }
  };

  const validationSchema = Yup.object({
    businessName: Yup.string().required('Business name is required'),
    category: Yup.string().required('Category is required'),
    phone: Yup.string().required('Phone is required'),
  });

  const formik = useFormik({
    initialValues: {
      businessName: '',
      category: '',
      description: '',
      phone: '',
      email: '',
      address: '',
      city: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSaving(true);
        await api.put('/service-providers/my', values);
        toast.success('Service provider updated successfully');
      } catch (error) {
        toast.error('Failed to update service provider');
      } finally {
        setSaving(false);
      }
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const categories = ['decoration', 'catering', 'photography', 'makeup', 'travel', 'other'];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Edit Service Provider Details</h1>

      <form onSubmit={formik.handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
            <input
              type="text"
              name="businessName"
              value={formik.values.businessName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
            {formik.touched.businessName && formik.errors.businessName && (
              <p className="text-red-600 text-sm mt-1">{formik.errors.businessName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              name="category"
              value={formik.values.category}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
            <input
              type="text"
              name="phone"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              name="city"
              value={formik.values.city}
              onChange={formik.handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              name="address"
              value={formik.values.address}
              onChange={formik.handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formik.values.description}
            onChange={formik.handleChange}
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 font-semibold disabled:opacity-50"
          >
            <FiSave size={20} />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditServiceProvider;

