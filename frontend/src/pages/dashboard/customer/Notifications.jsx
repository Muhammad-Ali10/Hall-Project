import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import { FiBell } from 'react-icons/fi';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      // This would need a notifications endpoint
      setNotifications([]);
    } catch (error) {
      toast.error('Failed to load notifications');
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <FiBell className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500 text-lg">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification._id} className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-1">{notification.title}</h3>
              <p className="text-gray-600 text-sm">{notification.message}</p>
              <p className="text-gray-400 text-xs mt-2">
                {new Date(notification.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;

