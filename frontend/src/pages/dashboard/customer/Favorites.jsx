import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import { FiHeart, FiMapPin, FiDollarSign } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      // This would need a favorites endpoint
      setFavorites([]);
    } catch (error) {
      toast.error('Failed to load favorites');
      setFavorites([]);
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
      <h1 className="text-3xl font-bold text-gray-900">Favorite Halls</h1>

      {!Array.isArray(favorites) || favorites.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <FiHeart className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500 text-lg mb-4">No favorite halls yet</p>
          <Link
            to="/halls"
            className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 font-semibold"
          >
            Browse Halls
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((hall) => (
            <Link
              key={hall._id}
              to={`/halls/${hall._id}`}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {Array.isArray(hall.photos) && hall.photos.length > 0 && hall.photos[0]?.url && (
                <img src={hall.photos[0].url} alt={hall.name} className="w-full h-48 object-cover" />
              )}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{hall.name}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <FiMapPin className="mr-1" />
                    {hall.address?.city}
                  </span>
                  {hall.price && (
                    <span className="flex items-center font-semibold text-orange-600">
                      <FiDollarSign className="mr-1" />
                      ₹{hall.price.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;

