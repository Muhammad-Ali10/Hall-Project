import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHallById } from '../redux/slices/hallSlice';
import GoogleMapComponent from '../components/GoogleMapComponent';
import BookingModal from '../components/BookingModal';
import { FiMapPin, FiUsers, FiDollarSign, FiStar, FiCalendar, FiPhone, FiMail } from 'react-icons/fi';

const HallDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentHall, loading } = useSelector((state) => state.halls);
  const { user } = useSelector((state) => state.auth);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchHallById(id));
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!currentHall) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800 mb-4">Hall not found</p>
          <Link to="/halls" className="text-orange-600 hover:text-orange-700 font-semibold">
            Browse Halls
          </Link>
        </div>
      </div>
    );
  }

  const mapCenter = currentHall.location?.coordinates &&
    Array.isArray(currentHall.location.coordinates) &&
    currentHall.location.coordinates.length === 2 &&
    typeof currentHall.location.coordinates[0] === 'number' &&
    typeof currentHall.location.coordinates[1] === 'number' &&
    currentHall.location.coordinates[0] !== 0 &&
    currentHall.location.coordinates[1] !== 0 &&
    !isNaN(currentHall.location.coordinates[0]) &&
    !isNaN(currentHall.location.coordinates[1])
    ? {
        lat: currentHall.location.coordinates[1],
        lng: currentHall.location.coordinates[0],
      }
    : null;

  const handleBookNow = () => {
    if (!user) {
      navigate('/login');
    } else {
      setIsBookingModalOpen(true);
    }
  };

  const handleViewAvailableDates = () => {
    setIsBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Image Gallery */}
        {Array.isArray(currentHall.photos) && currentHall.photos.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="relative h-96 md:h-[500px]">
              <img
                src={currentHall.photos[selectedImage]?.url}
                alt={currentHall.name}
                className="w-full h-full object-cover"
              />
              {currentHall.photos.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : currentHall.photos.length - 1))}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev < currentHall.photos.length - 1 ? prev + 1 : 0))}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition"
                  >
                    →
                  </button>
                </>
              )}
            </div>
            {currentHall.photos.length > 1 && (
              <div className="p-4 flex gap-2 overflow-x-auto">
                {currentHall.photos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === idx ? 'border-orange-600' : 'border-gray-200'
                    }`}
                  >
                    <img src={photo.url} alt={`${currentHall.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hall Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h1 className="text-4xl font-bold mb-4 text-gray-800">{currentHall.name}</h1>
              <div className="flex items-center text-gray-600 mb-6">
                <FiMapPin className="mr-2" />
                <span>{currentHall.address?.fullAddress}</span>
              </div>

              {/* Key Details */}
              <div className="grid md:grid-cols-3 gap-6 mb-8 p-6 bg-orange-50 rounded-xl">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <FiUsers className="text-orange-600 text-2xl" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{currentHall.capacity}</p>
                  <p className="text-sm text-gray-600">Capacity</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <FiDollarSign className="text-orange-600 text-2xl" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">₹{currentHall.price}</p>
                  <p className="text-sm text-gray-600">Price</p>
                </div>
                {currentHall.rating && currentHall.rating.average > 0 && (
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <FiStar className="text-yellow-400 text-2xl" />
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{currentHall.rating.average.toFixed(1)}</p>
                    <p className="text-sm text-gray-600">Rating ({currentHall.rating.count})</p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">About This Hall</h2>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {currentHall.description || 'No description available for this hall.'}
                </p>
              </div>

              {/* Event Types */}
              {Array.isArray(currentHall.eventTypes) && currentHall.eventTypes.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">Event Types</h2>
                  <div className="flex flex-wrap gap-2">
                    {currentHall.eventTypes.map((type, idx) => (
                      <span
                        key={idx}
                        className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full font-semibold capitalize"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities */}
              {Array.isArray(currentHall.amenities) && currentHall.amenities.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">Amenities</h2>
                  <div className="grid md:grid-cols-2 gap-3">
                    {currentHall.amenities.map((amenity, idx) => (
                      <div key={idx} className="flex items-center bg-gray-50 p-3 rounded-lg">
                        <span className="text-orange-600 mr-2">✓</span>
                        <span className="text-gray-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Policies */}
              {currentHall.policies && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">Policies</h2>
                  <div className="space-y-4 bg-gray-50 p-6 rounded-xl">
                    {currentHall.policies.cancellation && (
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">Cancellation Policy</h3>
                        <p className="text-gray-600">{currentHall.policies.cancellation}</p>
                      </div>
                    )}
                    {currentHall.policies.refund && (
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">Refund Policy</h3>
                        <p className="text-gray-600">{currentHall.policies.refund}</p>
                      </div>
                    )}
                    {currentHall.policies.terms && (
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">Terms & Conditions</h3>
                        <p className="text-gray-600">{currentHall.policies.terms}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Location Map */}
              {mapCenter && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">Location</h2>
                  <div className="h-96 w-full rounded-xl overflow-hidden shadow-md">
                    <GoogleMapComponent center={mapCenter} />
                  </div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${mapCenter.lat},${mapCenter.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold"
                  >
                    <FiMapPin className="mr-2" />
                    Get Directions
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-4">
              <div className="text-center mb-6">
                <p className="text-3xl font-bold text-gray-800 mb-2">₹{currentHall.price}</p>
                <p className="text-gray-600">per event</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Capacity</span>
                  <span className="font-semibold text-gray-800">{currentHall.capacity} people</span>
                </div>
                {currentHall.rating && currentHall.rating.average > 0 && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Rating</span>
                    <div className="flex items-center">
                      <FiStar className="text-yellow-400 mr-1" />
                      <span className="font-semibold text-gray-800">
                        {currentHall.rating.average.toFixed(1)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleBookNow}
                className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-700 transition shadow-lg hover:shadow-xl mb-4"
              >
                Book Now
              </button>
              <button
                onClick={handleViewAvailableDates}
                className="w-full bg-gray-100 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-200 transition mb-4"
              >
                <FiCalendar className="inline mr-2" />
                View Available Dates
              </button>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-800 mb-3">Contact Hall</h3>
                <div className="space-y-2">
                  <a
                    href={`tel:${currentHall.phone}`}
                    className="flex items-center text-gray-700 hover:text-orange-600 transition"
                  >
                    <FiPhone className="mr-2" />
                    {currentHall.phone}
                  </a>
                  {currentHall.owner?.email && (
                    <a
                      href={`mailto:${currentHall.owner.email}`}
                      className="flex items-center text-gray-700 hover:text-orange-600 transition"
                    >
                      <FiMail className="mr-2" />
                      Email Owner
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        hallId={currentHall?._id}
      />
    </div>
  );
};

export default HallDetailPage;
