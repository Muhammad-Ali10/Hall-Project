import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import { FiSave } from 'react-icons/fi';

const ManagePricing = () => {
  const [hall, setHall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadHall();
  }, []);

  const loadHall = async () => {
    try {
      const response = await api.get('/halls/my/hall');
      setHall(response.data.data);
      formik.setValues({
        price: response.data.data.price || '',
        capacity: response.data.data.capacity || '',
      });
    } catch (error) {
      toast.error('Failed to load hall data');
    } finally {
      setLoading(false);
    }
  };

  const validationSchema = Yup.object({
    price: Yup.number().min(0, 'Price must be positive'),
    capacity: Yup.number().min(1, 'Capacity must be at least 1'),
  });

  const formik = useFormik({
    initialValues: {
      price: '',
      capacity: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSaving(true);
        await api.put('/halls/my/hall', {
          price: values.price ? parseFloat(values.price) : undefined,
          capacity: values.capacity ? parseInt(values.capacity) : undefined,
        });
        toast.success('Pricing updated successfully');
        loadHall();
      } catch (error) {
        toast.error('Failed to update pricing');
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Pricing & Capacity</h1>

      <form onSubmit={formik.handleSubmit} className="bg-white rounded-xl shadow-md p-6 max-w-2xl">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
            <input
              type="number"
              name="price"
              value={formik.values.price}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter price per event"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
            {formik.touched.price && formik.errors.price && (
              <p className="text-red-600 text-sm mt-1">{formik.errors.price}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (people)</label>
            <input
              type="number"
              name="capacity"
              value={formik.values.capacity}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter maximum capacity"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
            {formik.touched.capacity && formik.errors.capacity && (
              <p className="text-red-600 text-sm mt-1">{formik.errors.capacity}</p>
            )}
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
        </div>
      </form>
    </div>
  );
};

export default ManagePricing;

