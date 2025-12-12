import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import { FiPlus, FiSave, FiX } from 'react-icons/fi';

const ManagePackages = () => {
  const [serviceProvider, setServiceProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [packageForm, setPackageForm] = useState({
    name: '',
    description: '',
    price: '',
    features: '',
  });

  useEffect(() => {
    loadServiceProvider();
  }, []);

  const loadServiceProvider = async () => {
    try {
      const response = await api.get('/service-providers/my');
      setServiceProvider(response.data.data);
    } catch (error) {
      toast.error('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPackage = async (e) => {
    e.preventDefault();
    try {
      const newPackage = {
        ...packageForm,
        price: parseFloat(packageForm.price),
        features: packageForm.features.split(',').map((f) => f.trim()).filter(Boolean),
      };
      await api.put('/service-providers/my', {
        packages: [...(serviceProvider.packages || []), newPackage],
      });
      toast.success('Package added successfully');
      setShowAddForm(false);
      setPackageForm({ name: '', description: '', price: '', features: '' });
      loadServiceProvider();
    } catch (error) {
      toast.error('Failed to add package');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Manage Packages</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 font-semibold"
        >
          <FiPlus size={20} />
          <span>Add Package</span>
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Package</h2>
          <form onSubmit={handleAddPackage} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
                <input
                  type="text"
                  value={packageForm.name}
                  onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={packageForm.price}
                  onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={packageForm.description}
                onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Features (comma separated)</label>
              <input
                type="text"
                value={packageForm.features}
                onChange={(e) => setPackageForm({ ...packageForm, features: e.target.value })}
                placeholder="e.g., Photography, Videography, Editing"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 font-semibold"
              >
                <FiSave size={18} />
                <span>Save Package</span>
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {serviceProvider?.packages?.map((pkg, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{pkg.name}</h3>
            <p className="text-2xl font-bold text-orange-600 mb-2">₹{pkg.price?.toLocaleString()}</p>
            {pkg.description && <p className="text-gray-600 mb-4">{pkg.description}</p>}
            {pkg.features && pkg.features.length > 0 && (
              <ul className="space-y-1">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-center">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManagePackages;

