import { Link } from 'react-router-dom';
import { FiMapPin, FiUsers, FiDollarSign, FiStar } from 'react-icons/fi';

const HallCard = ({ hall }) => {
  return (
    <Link
      to={`/halls/${hall._id}`}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 block"
    >
      {hall.photos && hall.photos.length > 0 ? (
        <div className="relative h-56 overflow-hidden">
          <img
            src={hall.photos[0].url}
            alt={hall.name}
            className="w-full h-full object-cover"
          />
          {hall.distance && (
            <div className="absolute top-3 right-3 bg-black bg-opacity-75 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center">
              <FiMapPin className="mr-1" size={14} />
              {hall.distance.toFixed(1)} km
            </div>
          )}
        </div>
      ) : (
        <div className="relative h-56 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400">No Image</span>
        </div>
      )}
      <div className="p-5">
        <h3 className="text-lg font-bold mb-2 text-gray-900 line-clamp-1">{hall.name}</h3>
        <div className="flex items-center text-gray-600 mb-3 text-sm">
          <FiMapPin className="mr-1.5" size={14} />
          <span className="truncate">{hall.address?.city || 'Location not specified'}</span>
        </div>
        <div className="flex items-center justify-between mb-3">
          {hall.capacity && (
            <div className="flex items-center text-gray-600 text-sm">
              <FiUsers className="mr-1.5" size={14} />
              <span>{hall.capacity} people</span>
            </div>
          )}
          {hall.price && (
            <div className="flex items-center text-orange-600 font-bold text-lg">
              <FiDollarSign size={16} />
              <span>{hall.price.toLocaleString()}</span>
            </div>
          )}
        </div>
        {hall.rating && hall.rating.average > 0 && (
          <div className="flex items-center mb-3">
            <FiStar className="text-yellow-400 mr-1" size={14} />
            <span className="text-sm font-semibold">{hall.rating.average.toFixed(1)}</span>
            <span className="text-gray-500 text-sm ml-1">({hall.rating.count})</span>
          </div>
        )}
        <button className="w-full bg-orange-600 text-white py-2.5 rounded-lg font-semibold hover:bg-orange-700 transition text-sm mt-2">
          View Details
        </button>
      </div>
    </Link>
  );
};

export default HallCard;

