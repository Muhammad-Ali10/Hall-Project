import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const HeroSearch = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const autocompleteRef = useRef(null);
  const placesServiceRef = useRef(null);

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          setLocationError(null);
          // Navigate to halls page with location
          navigate(`/halls?lat=${location.lat}&lng=${location.lng}`);
        },
        (error) => {
          setLocationError('Location access denied');
          console.error('Geolocation error:', error);
        }
      );
    } else {
      setLocationError('Geolocation not supported');
    }
  };

  useEffect(() => {
    // DO NOT get location automatically - only when user clicks

    // Initialize Google Places Autocomplete
    if (window.google && window.google.maps && window.google.maps.places) {
      const input = document.getElementById('search-input');
      if (input) {
        try {
          const autocomplete = new window.google.maps.places.Autocomplete(input, {
            types: ['(cities)'],
          });
          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place && place.geometry && place.geometry.location) {
              const location = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              };
              setUserLocation(location);
              setSearchQuery(place.formatted_address || '');
            }
          });
          autocompleteRef.current = autocomplete;
        } catch (error) {
          console.error('Error initializing Google Places Autocomplete:', error);
        }
      }
    }
  }, []);

  // Load Google Maps script
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    // Don't load if no API key
    if (!apiKey) {
      console.warn('Google Maps API key is not configured');
      return;
    }

    // Check if already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      console.error('Failed to load Google Maps API');
    };
    document.head.appendChild(script);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (userLocation) {
      params.append('lat', userLocation.lat);
      params.append('lng', userLocation.lng);
    }
    navigate(`/halls?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-4 bg-white rounded-2xl shadow-2xl p-4 md:p-6">
        <div className="flex-1 relative">
          <input
            id="search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by city or hall name..."
            className="w-full px-6 py-4 pr-12 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition"
          />
          <button
            type="button"
            onClick={handleLocationClick}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition"
            title="Use my location"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
        <button
          type="submit"
          className="bg-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-700 transition shadow-lg hover:shadow-xl whitespace-nowrap"
        >
          Search Halls
        </button>
      </div>
      {locationError && (
        <p className="text-orange-200 mt-2 text-center text-sm">
          {locationError}
        </p>
      )}
    </form>
  );
};

export default HeroSearch;
