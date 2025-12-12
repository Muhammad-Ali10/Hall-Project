import { useState, useEffect } from 'react';
import StatCard from '../../../components/dashboard/StatCard';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import { FiBriefcase, FiStar, FiEdit3 } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const ServiceProviderOverview = () => {
  const [serviceProvider, setServiceProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await api.get('/service-providers/my');
      setServiceProvider(response.data.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!serviceProvider) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 text-center">
        <p className="text-gray-500 text-lg mb-4">No service provider profile found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{serviceProvider.businessName}</h1>
            <p className="text-gray-600 mb-4 capitalize">{serviceProvider.category}</p>
            <div className="flex items-center space-x-6">
              <div>
                <p className="text-sm text-gray-500">Rating</p>
                <p className="font-semibold text-gray-900">
                  {serviceProvider.rating?.average?.toFixed(1) || '0.0'} ⭐
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                    serviceProvider.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {serviceProvider.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          <Link
            to="/dashboard/service-provider/edit"
            className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 font-semibold"
          >
            <FiEdit3 size={18} />
            <span>Edit</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Portfolio Items"
          value={serviceProvider.portfolio?.length || 0}
          icon={FiBriefcase}
          color="blue"
        />
        <StatCard
          title="Rating"
          value={serviceProvider.rating?.average?.toFixed(1) || '0.0'}
          icon={FiStar}
          color="orange"
        />
        <StatCard
          title="Packages"
          value={serviceProvider.packages?.length || 0}
          icon={FiDollarSign}
          color="green"
        />
      </div>
    </div>
  );
};

export default ServiceProviderOverview;

