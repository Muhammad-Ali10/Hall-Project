const axios = require('axios');

/**
 * Enhanced geocoding function that extracts detailed location information
 * @param {string} address - Address string to geocode
 * @returns {Object} - Location details including coordinates and address components
 */
const getCoordinatesFromAddress = async (address) => {
  try {
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key not configured');
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const result = response.data.results[0];
      const location = result.geometry.location;
      const addressComponents = result.address_components || [];
      
      // Extract address components
      const extractComponent = (types, componentName) => {
        const component = addressComponents.find(comp => 
          types.some(type => comp.types.includes(type))
        );
        return component ? component[componentName] : null;
      };

      const city = extractComponent(['locality', 'administrative_area_level_2'], 'long_name') ||
                   extractComponent(['administrative_area_level_3'], 'long_name');
      const state = extractComponent(['administrative_area_level_1'], 'long_name');
      const region = state; // Alias for state
      const postalCode = extractComponent(['postal_code'], 'long_name');
      const country = extractComponent(['country'], 'long_name');
      const countryCode = extractComponent(['country'], 'short_name');
      const street = extractComponent(['street_number', 'route'], 'long_name');
      
      return {
        lat: location.lat,
        lng: location.lng,
        latitude: location.lat,
        longitude: location.lng,
        formattedAddress: result.formatted_address,
        city: city || null,
        state: state || null,
        region: region || null,
        postalCode: postalCode || null,
        country: country || null,
        countryCode: countryCode || null,
        street: street || null,
        placeId: result.place_id,
      };
    }

    if (response.data.status === 'ZERO_RESULTS') {
      throw new Error('Address not found');
    }

    throw new Error(`Geocoding failed: ${response.data.status}`);
  } catch (error) {
    console.error('Geocoding error:', error.message);
    throw error;
  }
};

const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

module.exports = {
  getCoordinatesFromAddress,
  calculateDistance,
};

