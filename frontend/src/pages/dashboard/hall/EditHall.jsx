import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import { FiSave } from 'react-icons/fi';

const EditHall = () => {
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
      // Set initial values
      formik.setValues({
        name: response.data.data.name || '',
        description: response.data.data.description || '',
        phone: response.data.data.phone || '',
        ownerName: response.data.data.ownerName || '',
        ownerPhone: response.data.data.ownerPhone || '',
        address: {
          street: response.data.data.address?.street || '',
          city: response.data.data.address?.city || '',
          state: response.data.data.address?.state || '',
          pincode: response.data.data.address?.pincode || '',
          fullAddress: response.data.data.address?.fullAddress || '',
        },
        eventTypes: response.data.data.eventTypes || [],
        amenities: response.data.data.amenities?.join(', ') || '',
        policies: {
          cancellation: response.data.data.policies?.cancellation || '',
          refund: response.data.data.policies?.refund || '',
          terms: response.data.data.policies?.terms || '',
        },
        gst: response.data.data.gst || '',
      });
    } catch (error) {
      toast.error('Failed to load hall data');
    } finally {
      setLoading(false);
    }
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Hall name is required'),
    phone: Yup.string().required('Phone is required'),
    ownerName: Yup.string().required('Owner name is required'),
    'address.city': Yup.string().required('City is required'),
    'address.fullAddress': Yup.string().required('Full address is required'),
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
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
      eventTypes: [],
      amenities: '',
      policies: {
        cancellation: '',
        refund: '',
        terms: '',
      },
      gst: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSaving(true);
        const updateData = {
          ...values,
          amenities: values.amenities.split(',').map((a) => a.trim()).filter(Boolean),
        };
        await api.put('/halls/my/hall', updateData);
        toast.success('Hall updated successfully');
      } catch (error) {
        toast.error('Failed to update hall');
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

  const eventTypesOptions = ['wedding', 'corporate', 'birthday', 'conference', 'exhibition', 'other'];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Edit Hall Details</h1>

      <form onSubmit={formik.handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hall Name *</label>
              <input
                type="text"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-red-600 text-sm mt-1">{formik.errors.name}</p>
              )}
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
              {formik.touched.phone && formik.errors.phone && (
                <p className="text-red-600 text-sm mt-1">{formik.errors.phone}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name *</label>
              <input
                type="text"
                name="ownerName"
                value={formik.values.ownerName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner Phone</label>
              <input
                type="text"
                name="ownerPhone"
                value={formik.values.ownerPhone}
                onChange={formik.handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Address</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Address *</label>
              <input
                type="text"
                name="address.fullAddress"
                value={formik.values.address.fullAddress}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input
                  type="text"
                  name="address.city"
                  value={formik.values.address.city}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  name="address.state"
                  value={formik.values.address.state}
                  onChange={formik.handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                <input
                  type="text"
                  name="address.pincode"
                  value={formik.values.address.pincode}
                  onChange={formik.handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Event Types */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Types</h2>
          <div className="flex flex-wrap gap-2">
            {eventTypesOptions.map((type) => (
              <label key={type} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formik.values.eventTypes.includes(type)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      formik.setFieldValue('eventTypes', [...formik.values.eventTypes, type]);
                    } else {
                      formik.setFieldValue(
                        'eventTypes',
                        formik.values.eventTypes.filter((t) => t !== type)
                      );
                    }
                  }}
                  className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700 capitalize">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amenities (comma separated)</label>
          <input
            type="text"
            name="amenities"
            value={formik.values.amenities}
            onChange={formik.handleChange}
            placeholder="e.g., Parking, AC, WiFi, Catering"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Policies */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Policies</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cancellation Policy</label>
              <textarea
                name="policies.cancellation"
                value={formik.values.policies.cancellation}
                onChange={formik.handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Refund Policy</label>
              <textarea
                name="policies.refund"
                value={formik.values.policies.refund}
                onChange={formik.handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
              <textarea
                name="policies.terms"
                value={formik.values.policies.terms}
                onChange={formik.handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* GST */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
          <input
            type="text"
            name="gst"
            value={formik.values.gst}
            onChange={formik.handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Submit */}
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

export default EditHall;

