import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiCheck, FiLock, FiUnlock } from 'react-icons/fi';

const ServiceProviderReview = () => {
  const { serviceProviderId } = useParams();
  const navigate = useNavigate();
  const [serviceProvider, setServiceProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServiceProviderDetails();
  }, [serviceProviderId]);

  const loadServiceProviderDetails = async () => {
    try {
      const response = await api.get(`/admin/service-providers/${serviceProviderId}/review`);
      setServiceProvider(response.data.data);
    } catch (error) {
      toast.error('Failed to load service provider details');
      navigate('/dashboard/admin/service-providers');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action) => {
    try {
      await api.put(`/admin/service-providers/${serviceProviderId}/approval`, { action });
      toast.success(`Service provider ${action}d successfully`);
      loadServiceProviderDetails();
    } catch (error) {
      toast.error(`Failed to ${action} service provider`);
    }
  };

  if (loading || !serviceProvider) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/dashboard/admin/service-providers')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <FiArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Service Provider Review</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{serviceProvider.businessName}</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-semibold text-gray-900 capitalize">{serviceProvider.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-semibold text-gray-900">{serviceProvider.user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-semibold text-gray-900">{serviceProvider.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-semibold text-gray-900">{serviceProvider.address || 'N/A'}</p>
              </div>
              {serviceProvider.description && (
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-gray-700">{serviceProvider.description}</p>
                </div>
              )}
            </div>
          </div>

          {serviceProvider.portfolio && serviceProvider.portfolio.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio</h3>
              <div className="grid grid-cols-3 gap-4">
                {serviceProvider.portfolio.map((item, index) => (
                  <div key={index}>
                    {item.type === 'image' ? (
                      <img src={item.url} alt={`Portfolio ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                    ) : (
                      <video src={item.url} controls className="w-full h-32 object-cover rounded-lg" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
            <span
              className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                serviceProvider.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {serviceProvider.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              {!serviceProvider.isActive && (
                <button
                  onClick={() => handleAction('approve')}
                  className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 font-semibold"
                >
                  <FiCheck size={20} />
                  <span>Approve</span>
                </button>
              )}
              <button
                onClick={() => handleAction(serviceProvider.isActive ? 'block' : 'unblock')}
                className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-semibold ${
                  serviceProvider.isActive
                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {serviceProvider.isActive ? <FiLock size={20} /> : <FiUnlock size={20} />}
                <span>{serviceProvider.isActive ? 'Block' : 'Unblock'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceProviderReview;

