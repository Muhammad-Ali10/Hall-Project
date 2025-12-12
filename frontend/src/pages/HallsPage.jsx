import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { fetchHalls } from '../redux/slices/hallSlice';
import { FiMapPin, FiUsers, FiDollarSign, FiStar, FiFilter, FiX, FiWifi, FiPhone, FiMail, FiCalendar, FiCheckCircle } from 'react-icons/fi';

const HallsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { halls, loading, pagination } = useSelector((state) => state.halls);
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    eventType: searchParams.get('eventType') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minCapacity: searchParams.get('minCapacity') || '',
    maxCapacity: searchParams.get('maxCapacity') || '',
    amenities: searchParams.get('amenities') || '',
    maxDistance: searchParams.get('maxDistance') || '',
    lat: searchParams.get('lat') || '',
    lng: searchParams.get('lng') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
  });

  const [userLocation, setUserLocation] = useState(null);

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          setFilters({ ...filters, lat: location.lat, lng: location.lng });
        },
        () => {
          alert('Location access denied. Please enable location permissions.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  useEffect(() => {
    const activeFilters = { ...filters };
    Object.keys(activeFilters).forEach((key) => {
      if (!activeFilters[key]) delete activeFilters[key];
    });
    dispatch(fetchHalls(activeFilters));
  }, [dispatch, filters]);

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      city: '',
      eventType: '',
      minPrice: '',
      maxPrice: '',
      minCapacity: '',
      maxCapacity: '',
      amenities: '',
      maxDistance: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
    setFilters(clearedFilters);
    setSearchParams({});
  };

  const amenitiesList = [
    'Parking',
    'AC',
    'WiFi',
    'Sound System',
    'Stage',
    'Catering',
    'Decoration',
    'Photography',
    'Security',
    'Restrooms',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Browse Halls</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FiFilter />
          Filters
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside
          className={`${
            sidebarOpen ? 'block' : 'hidden'
          } md:block w-full md:w-80 bg-white rounded-2xl shadow-lg p-6 h-fit sticky top-4`}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Filters</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-gray-500 hover:text-gray-700"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Hall name or city..."
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* City */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
            <input
              type="text"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              placeholder="Enter city"
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Event Type */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Event Type</label>
            <select
              value={filters.eventType}
              onChange={(e) => handleFilterChange('eventType', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
            >
              <option value="">All Types</option>
              <option value="wedding">Wedding</option>
              <option value="corporate">Corporate</option>
              <option value="birthday">Birthday</option>
              <option value="conference">Conference</option>
              <option value="exhibition">Exhibition</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Price Range (₹)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                placeholder="Min"
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
              />
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                placeholder="Max"
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Capacity Range */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Capacity</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={filters.minCapacity}
                onChange={(e) => handleFilterChange('minCapacity', e.target.value)}
                placeholder="Min"
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
              />
              <input
                type="number"
                value={filters.maxCapacity}
                onChange={(e) => handleFilterChange('maxCapacity', e.target.value)}
                placeholder="Max"
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Location Button */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleLocationClick}
              className="w-full flex items-center justify-center space-x-2 bg-orange-600 text-white px-4 py-2.5 rounded-lg hover:bg-orange-700 font-semibold transition"
            >
              <FiMapPin size={18} />
              <span>{userLocation ? 'Location Detected' : 'Use My Location'}</span>
            </button>
          </div>

          {/* Distance */}
          {userLocation && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Max Distance (km)
              </label>
              <input
                type="number"
                value={filters.maxDistance}
                onChange={(e) => handleFilterChange('maxDistance', e.target.value)}
                placeholder="e.g., 10"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
              />
            </div>
          )}

          {/* Amenities */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Amenities</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {amenitiesList.map((amenity) => (
                <label key={amenity} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.amenities.includes(amenity)}
                    onChange={(e) => {
                      const current = filters.amenities.split(',').filter((a) => a);
                      if (e.target.checked) {
                        handleFilterChange('amenities', [...current, amenity].join(','));
                      } else {
                        handleFilterChange(
                          'amenities',
                          current.filter((a) => a !== amenity).join(',')
                        );
                      }
                    }}
                    className="mr-2 w-4 h-4 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 mb-2"
            >
              <option value="createdAt">Newest</option>
              <option value="price">Price</option>
              <option value="capacity">Capacity</option>
              <option value="rating">Rating</option>
              {userLocation && <option value="distance">Distance</option>}
            </select>
            <select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          <button
            onClick={clearFilters}
            className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-semibold transition"
          >
            Clear All Filters
          </button>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
          ) : halls.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-md">
              <p className="text-gray-500 text-lg">No halls found matching your criteria</p>
              <button
                onClick={clearFilters}
                className="mt-4 text-orange-600 hover:text-orange-700 font-semibold"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4 text-gray-600 font-semibold">
                Showing {halls.length} of {pagination?.totalItems || 0} halls
              </div>
              <div className="space-y-6">
                {halls.map((hall) => (
                  <Link
                    key={hall._id}
                    to={`/halls/${hall._id}`}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 block"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Image Section - Left */}
                      <div className="md:w-80 lg:w-96 h-64 md:h-auto flex-shrink-0 relative group">
                        {hall.photos && hall.photos.length > 0 ? (
                          <>
                            <img
                              src={hall.photos[0].url}
                              alt={hall.name}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                            {hall.photos.length > 1 && (
                              <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-semibold">
                                {hall.photos.length} photos
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">No Image</span>
                          </div>
                        )}
                        {hall.distance && (
                          <div className="absolute top-3 right-3 bg-black bg-opacity-75 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center backdrop-blur-sm">
                            <FiMapPin className="mr-1" size={14} />
                            {hall.distance.toFixed(1)} km
                          </div>
                        )}
                        {hall.rating && hall.rating.average > 0 && (
                          <div className="absolute top-3 left-3 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg">
                            {hall.rating.average.toFixed(1)} ⭐
                          </div>
                        )}
                      </div>

                      {/* Content Section - Right */}
                      <div className="flex-1 p-6 flex flex-col justify-between">
                        <div>
                          {/* Header with Title and Quick Info */}
                          <div className="mb-3">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-2xl font-bold text-gray-900 pr-2">{hall.name}</h3>
                              {/* Quick Amenities Icons */}
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {hall.amenities && hall.amenities.includes('WiFi') && (
                                  <div className="p-1.5 bg-orange-50 rounded-lg" title="WiFi Available">
                                    <FiWifi className="text-orange-600" size={16} />
                                  </div>
                                )}
                                {hall.amenities && hall.amenities.includes('Parking') && (
                                  <div className="p-1.5 bg-orange-50 rounded-lg" title="Parking Available">
                                    <span className="text-orange-600 text-xs font-bold">P</span>
                                  </div>
                                )}
                                {hall.amenities && hall.amenities.includes('AC') && (
                                  <div className="p-1.5 bg-orange-50 rounded-lg" title="Air Conditioned">
                                    <span className="text-orange-600 text-xs font-bold">AC</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Event Types */}
                          {hall.eventTypes && hall.eventTypes.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {hall.eventTypes.slice(0, 3).map((type, idx) => (
                                <span
                                  key={idx}
                                  className="bg-orange-100 text-orange-700 px-2.5 py-1 rounded-md text-xs font-semibold capitalize"
                                >
                                  {type}
                                </span>
                              ))}
                              {hall.eventTypes.length > 3 && (
                                <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-semibold">
                                  +{hall.eventTypes.length - 3} more
                                </span>
                              )}
                            </div>
                          )}

                          {/* Description */}
                          {hall.description && (
                            <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">
                              {hall.description}
                            </p>
                          )}

                          {/* Location Details - City and State */}
                          <div className="space-y-2 mb-4">
                            <div className="flex items-start text-gray-600">
                              <FiMapPin className="mr-2 mt-0.5 flex-shrink-0" size={16} />
                              <div className="text-sm">
                                {hall.address?.fullAddress && (
                                  <div className="font-medium mb-1">{hall.address.fullAddress}</div>
                                )}
                                {(hall.address?.city || hall.address?.state) && (
                                  <div className="text-gray-700 font-semibold">
                                    {hall.address.city && <span>{hall.address.city}</span>}
                                    {hall.address.city && hall.address.state && <span>, </span>}
                                    {hall.address.state && <span>{hall.address.state}</span>}
                                  </div>
                                )}
                                {!hall.address?.city && !hall.address?.state && (
                                  <span className="text-gray-500">Location not specified</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Key Information Grid - Price and Capacity Prominent */}
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            {hall.price && (
                              <div className="flex items-center text-gray-700 bg-orange-50 border-2 border-orange-200 px-4 py-3 rounded-lg">
                                <FiDollarSign className="mr-2 text-orange-600" size={20} />
                                <div>
                                  <div className="text-xs text-gray-500 font-medium">Hall Price</div>
                                  <div className="text-lg font-bold text-orange-600">₹{hall.price.toLocaleString()}</div>
                                  <div className="text-xs text-gray-500">per event</div>
                                </div>
                              </div>
                            )}
                            {hall.capacity && (
                              <div className="flex items-center text-gray-700 bg-orange-50 border-2 border-orange-200 px-4 py-3 rounded-lg">
                                <FiUsers className="mr-2 text-orange-600" size={20} />
                                <div>
                                  <div className="text-xs text-gray-500 font-medium">Hall Capacity</div>
                                  <div className="text-lg font-bold text-orange-600">{hall.capacity}</div>
                                  <div className="text-xs text-gray-500">people</div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* More Amenities */}
                          {hall.amenities && hall.amenities.length > 0 && (
                            <div className="mb-4">
                              <div className="text-xs text-gray-500 mb-2 font-semibold">Amenities</div>
                              <div className="flex flex-wrap gap-1.5">
                                {hall.amenities.slice(0, 6).map((amenity, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                                  >
                                    {amenity}
                                  </span>
                                ))}
                                {hall.amenities.length > 6 && (
                                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                    +{hall.amenities.length - 6} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Photo Count, Rating & Additional Info */}
                          <div className="flex items-center justify-between flex-wrap gap-3 text-xs text-gray-500 mb-2">
                            <div className="flex items-center gap-4">
                              {hall.photos && hall.photos.length > 0 && (
                                <div className="flex items-center bg-gray-50 px-2 py-1 rounded">
                                  <FiCalendar className="mr-1" size={12} />
                                  <span className="font-medium">{hall.photos.length} photo{hall.photos.length !== 1 ? 's' : ''}</span>
                                </div>
                              )}
                              {hall.rating && hall.rating.count > 0 && (
                                <div className="flex items-center bg-gray-50 px-2 py-1 rounded">
                                  <FiStar className="mr-1 text-yellow-400" size={12} />
                                  <span className="font-medium">{hall.rating.count} review{hall.rating.count !== 1 ? 's' : ''}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Footer with Price, Capacity, City, State and Button */}
                        <div className="flex items-end justify-between pt-4 border-t border-gray-200 mt-4">
                          <div className="flex items-center gap-6">
                            {hall.price && (
                              <div className="text-left">
                                <div className="text-xs text-gray-500 mb-1">Hall Price</div>
                                <div className="text-xl font-bold text-orange-600">
                                  ₹{hall.price.toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-400">per event</div>
                              </div>
                            )}
                            {hall.capacity && (
                              <div className="text-left border-l border-gray-200 pl-6">
                                <div className="text-xs text-gray-500 mb-1">Hall Capacity</div>
                                <div className="text-xl font-bold text-gray-800">
                                  {hall.capacity}
                                </div>
                                <div className="text-xs text-gray-400">people</div>
                              </div>
                            )}
                            {(hall.address?.city || hall.address?.state) && (
                              <div className="text-left border-l border-gray-200 pl-6">
                                <div className="text-xs text-gray-500 mb-1">Location</div>
                                <div className="text-sm font-semibold text-gray-700">
                                  {hall.address.city && <span>{hall.address.city}</span>}
                                  {hall.address.city && hall.address.state && <span>, </span>}
                                  {hall.address.state && <span>{hall.address.state}</span>}
                                </div>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              navigate(`/halls/${hall._id}`);
                            }}
                            className="bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition whitespace-nowrap shadow-md hover:shadow-lg"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-2">
                  <button
                    onClick={() => {
                      const newFilters = { ...filters, page: pagination.currentPage - 1 };
                      setFilters(newFilters);
                    }}
                    disabled={!pagination.hasPrevPage}
                    className="px-6 py-2 border-2 border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-orange-500 transition font-semibold"
                  >
                    Previous
                  </button>
                  <span className="px-6 py-2 text-gray-700 font-semibold">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => {
                      const newFilters = { ...filters, page: pagination.currentPage + 1 };
                      setFilters(newFilters);
                    }}
                    disabled={!pagination.hasNextPage}
                    className="px-6 py-2 border-2 border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-orange-500 transition font-semibold"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HallsPage;
