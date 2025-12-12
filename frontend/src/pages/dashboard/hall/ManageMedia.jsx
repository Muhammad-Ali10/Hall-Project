import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import { FiUpload, FiX, FiImage, FiVideo, FiArrowUp, FiArrowDown } from 'react-icons/fi';

const ManageMedia = () => {
  const [hall, setHall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadHall();
  }, []);

  const loadHall = async () => {
    try {
      const response = await api.get('/halls/my/hall');
      setHall(response.data.data);
    } catch (error) {
      toast.error('Failed to load hall data');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      setUploading(true);
      const formData = new FormData();
      files.forEach((file) => formData.append('photos', file));

      await api.post('/halls/my/hall/photos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Photos uploaded successfully');
      loadHall();
    } catch (error) {
      toast.error('Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      setUploading(true);
      const formData = new FormData();
      files.forEach((file) => formData.append('videos', file));

      await api.post('/halls/my/hall/videos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Videos uploaded successfully');
      loadHall();
    } catch (error) {
      toast.error('Failed to upload videos');
    } finally {
      setUploading(false);
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('banner', file);

      await api.post('/halls/my/hall/banner', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Banner uploaded successfully');
      loadHall();
    } catch (error) {
      toast.error('Failed to upload banner');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;
    try {
      await api.delete(`/halls/my/hall/photos/${photoId}`);
      toast.success('Photo deleted successfully');
      loadHall();
    } catch (error) {
      toast.error('Failed to delete photo');
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    try {
      await api.delete(`/halls/my/hall/videos/${videoId}`);
      toast.success('Video deleted successfully');
      loadHall();
    } catch (error) {
      toast.error('Failed to delete video');
    }
  };

  const handleReorderPhotos = async (photoIds) => {
    try {
      await api.put('/halls/my/hall/photos/reorder', { photoIds });
      toast.success('Photos reordered successfully');
      loadHall();
    } catch (error) {
      toast.error('Failed to reorder photos');
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
      <h1 className="text-3xl font-bold text-gray-900">Manage Media</h1>

      {/* Banner */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Banner Image</h2>
        {hall.banner?.url ? (
          <div className="relative">
            <img src={hall.banner.url} alt="Banner" className="w-full h-64 object-cover rounded-lg" />
            <label className="absolute bottom-4 right-4 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 cursor-pointer">
              <FiUpload className="inline mr-2" />
              Replace
              <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
            </label>
          </div>
        ) : (
          <label className="block w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-orange-500">
            <div className="text-center">
              <FiImage size={48} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600">Upload Banner Image</p>
              <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
            </div>
          </label>
        )}
      </div>

      {/* Photos */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Photos ({hall.photos?.length || 0})</h2>
          <label className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 cursor-pointer">
            <FiUpload className="inline mr-2" />
            Upload Photos
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
        {hall.photos && hall.photos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {hall.photos.map((photo, index) => (
              <div key={photo._id || index} className="relative group">
                <img src={photo.url} alt={`Photo ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                  <button
                    onClick={() => handleDeletePhoto(photo._id)}
                    className="opacity-0 group-hover:opacity-100 bg-red-600 text-white p-2 rounded hover:bg-red-700"
                  >
                    <FiX size={18} />
                  </button>
                </div>
                <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No photos uploaded yet</p>
        )}
      </div>

      {/* Videos */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Videos ({hall.videos?.length || 0})</h2>
          <label className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 cursor-pointer">
            <FiUpload className="inline mr-2" />
            Upload Videos
            <input
              type="file"
              accept="video/*"
              multiple
              onChange={handleVideoUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
        {hall.videos && hall.videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hall.videos.map((video, index) => (
              <div key={video._id || index} className="relative">
                <video src={video.url} controls className="w-full rounded-lg" />
                <button
                  onClick={() => handleDeleteVideo(video._id)}
                  className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded hover:bg-red-700"
                >
                  <FiX size={18} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No videos uploaded yet</p>
        )}
      </div>
    </div>
  );
};

export default ManageMedia;

