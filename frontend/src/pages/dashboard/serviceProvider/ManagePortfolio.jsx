import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import { FiUpload, FiX, FiImage, FiVideo } from 'react-icons/fi';

const ManagePortfolio = () => {
  const [serviceProvider, setServiceProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadServiceProvider();
  }, []);

  const loadServiceProvider = async () => {
    try {
      const response = await api.get('/service-providers/my');
      setServiceProvider(response.data.data);
    } catch (error) {
      toast.error('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e, type) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      setUploading(true);
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('portfolio', file);
        formData.append('type', type);
      });

      await api.post('/service-providers/my/portfolio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Portfolio items uploaded successfully');
      loadServiceProvider();
    } catch (error) {
      toast.error('Failed to upload portfolio items');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`/service-providers/my/portfolio/${itemId}`);
      toast.success('Item deleted successfully');
      loadServiceProvider();
    } catch (error) {
      toast.error('Failed to delete item');
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
      <h1 className="text-3xl font-bold text-gray-900">Manage Portfolio</h1>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Portfolio ({serviceProvider?.portfolio?.length || 0})
          </h2>
          <div className="flex space-x-2">
            <label className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 cursor-pointer">
              <FiImage className="inline mr-2" />
              Upload Images
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleUpload(e, 'image')}
                className="hidden"
                disabled={uploading}
              />
            </label>
            <label className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 cursor-pointer">
              <FiVideo className="inline mr-2" />
              Upload Videos
              <input
                type="file"
                accept="video/*"
                multiple
                onChange={(e) => handleUpload(e, 'video')}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {serviceProvider?.portfolio && serviceProvider.portfolio.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {serviceProvider.portfolio.map((item, index) => (
              <div key={item._id || index} className="relative group">
                {item.type === 'image' ? (
                  <img src={item.url} alt={`Portfolio ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                ) : (
                  <video src={item.url} className="w-full h-32 object-cover rounded-lg" />
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center">
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="opacity-0 group-hover:opacity-100 bg-red-600 text-white p-2 rounded hover:bg-red-700"
                  >
                    <FiX size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No portfolio items yet</p>
        )}
      </div>
    </div>
  );
};

export default ManagePortfolio;

