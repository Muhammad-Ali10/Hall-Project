import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiCheck, FiX, FiLock, FiUnlock, FiMapPin } from 'react-icons/fi';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const HallReview = () => {
  const { hallId } = useParams();
  const navigate = useNavigate();
  const [hall, setHall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    loadHallDetails();
  }, [hallId]);

  const loadHallDetails = async () => {
    try {
      const response = await api.get(`/admin/halls/${hallId}/review`);
      setHall(response.data.data);
    } catch (error) {
      toast.error('Failed to load hall details');
      navigate('/dashboard/admin/halls');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action) => {
    if (action === 'reject' && !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      setActionLoading(true);
      await api.put(`/admin/hall-owners/${hall.owner._id}/approval`, {
        action,
        rejectionReason: action === 'reject' ? rejectionReason : undefined,
        adminNote: adminNote || undefined,
      });
      toast.success(`Hall ${action}d successfully`);
      navigate('/dashboard/admin/halls');
    } catch (error) {
      toast.error(`Failed to ${action} hall`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlock = async (action) => {
    try {
      setActionLoading(true);
      await api.put(`/admin/halls/${hallId}/block`, { action });
      toast.success(`Hall ${action}ed successfully`);
      loadHallDetails();
    } catch (error) {
      toast.error(`Failed to ${action} hall`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!hall) {
    return null;
  }

  const mapCenter = hall.location?.coordinates
    ? { lat: hall.location.latitude || hall.location.coordinates[1], lng: hall.location.longitude || hall.location.coordinates[0] }
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/dashboard/admin/halls')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <FiArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Hall Review</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{hall.name}</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Owner Name</p>
                <p className="font-semibold text-gray-900">{hall.ownerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Owner Email</p>
                <p className="font-semibold text-gray-900">{hall.owner.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-semibold text-gray-900">{hall.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-semibold text-gray-900">{hall.address?.fullAddress}</p>
                <p className="text-sm text-gray-600">
                  {hall.address?.city}, {hall.address?.state} {hall.address?.pincode}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {hall.description && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700">{hall.description}</p>
            </div>
          )}

          {/* Details */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hall Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Capacity</p>
                <p className="font-semibold text-gray-900">{hall.capacity || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Price</p>
                <p className="font-semibold text-gray-900">
                  {hall.price ? `₹${hall.price.toLocaleString()}` : 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Event Types</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {hall.eventTypes?.map((type) => (
                    <span
                      key={type}
                      className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rating</p>
                <p className="font-semibold text-gray-900">
                  {hall.rating?.average?.toFixed(1) || '0.0'} ({hall.rating?.count || 0} reviews)
                </p>
              </div>
            </div>
          </div>

          {/* Amenities */}
          {hall.amenities && hall.amenities.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {hall.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-lg"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Gallery */}
          {hall.photos && hall.photos.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Photos ({hall.photos.length})</h3>
              <div className="grid grid-cols-3 gap-4">
                {hall.photos.slice(0, 6).map((photo, index) => (
                  <img
                    key={index}
                    src={photo.url}
                    alt={`Hall ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Videos */}
          {hall.videos && hall.videos.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Videos ({hall.videos.length})</h3>
              <div className="grid grid-cols-2 gap-4">
                {hall.videos.map((video, index) => (
                  <video
                    key={index}
                    src={video.url}
                    controls
                    className="w-full rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Map */}
          {mapCenter && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FiMapPin className="mr-2" />
                Location
              </h3>
              <div className="h-64 rounded-lg overflow-hidden">
                <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                  <GoogleMap
                    center={mapCenter}
                    zoom={15}
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                  >
                    <Marker position={mapCenter} />
                  </GoogleMap>
                </LoadScript>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Actions */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Approval Status</p>
                <span
                  className={`inline-block px-3 py-1 text-sm font-semibold rounded-full mt-1 ${
                    hall.owner.hallApprovalStatus === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : hall.owner.hallApprovalStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {hall.owner.hallApprovalStatus}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Status</p>
                <span
                  className={`inline-block px-3 py-1 text-sm font-semibold rounded-full mt-1 ${
                    hall.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {hall.isActive ? 'Active' : 'Blocked'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              {hall.owner.hallApprovalStatus === 'pending' && (
                <>
                  <button
                    onClick={() => handleAction('approve')}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50"
                  >
                    <FiCheck size={20} />
                    <span>Approve</span>
                  </button>
                  <div className="space-y-2">
                    <textarea
                      placeholder="Rejection reason (required for reject)"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      rows="3"
                    />
                    <button
                      onClick={() => handleAction('reject')}
                      disabled={actionLoading || !rejectionReason.trim()}
                      className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 font-semibold disabled:opacity-50"
                    >
                      <FiX size={20} />
                      <span>Reject</span>
                    </button>
                  </div>
                </>
              )}
              <button
                onClick={() => handleBlock(hall.isActive ? 'block' : 'unblock')}
                disabled={actionLoading}
                className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-semibold disabled:opacity-50 ${
                  hall.isActive
                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {hall.isActive ? <FiLock size={20} /> : <FiUnlock size={20} />}
                <span>{hall.isActive ? 'Block' : 'Unblock'}</span>
              </button>
              <div className="pt-3 border-t border-gray-200">
                <textarea
                  placeholder="Add admin note (optional)"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  rows="3"
                />
              </div>
            </div>
          </div>

          {/* Created Date */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-500">Created</p>
            <p className="font-semibold text-gray-900">
              {new Date(hall.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HallReview;

