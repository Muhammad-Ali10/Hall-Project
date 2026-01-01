import { useEffect, useRef, useState } from 'react';

const GoogleMapComponent = ({ center, zoom = 15 }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    // Don't load if no API key
    if (!apiKey) {
      console.warn('Google Maps API key is not configured');
      setApiError(true);
      return;
    }

    // Check if Google Maps API is already loaded
    if (window.google && window.google.maps) {
      setIsApiLoaded(true);
      initializeMap();
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      setIsApiLoaded(true);
      initializeMap();
    };
    
    script.onerror = () => {
      console.error('Failed to load Google Maps API');
      setApiError(true);
    };
    
    document.head.appendChild(script);

    function initializeMap() {
      if (!mapRef.current || !window.google || !window.google.maps) return;
      
      // Validate center coordinates
      if (!center || typeof center.lat !== 'number' || typeof center.lng !== 'number' || 
          isNaN(center.lat) || isNaN(center.lng)) {
        console.warn('Invalid center coordinates for map');
        return;
      }

      try {
        const map = new window.google.maps.Map(mapRef.current, {
          center,
          zoom,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
        });

        if (markerRef.current) {
          markerRef.current.setMap(null);
        }

        markerRef.current = new window.google.maps.Marker({
          position: center,
          map,
          icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
          },
        });
      } catch (error) {
        console.error('Error initializing Google Map:', error);
        setApiError(true);
      }
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, [center, zoom]);

  if (apiError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-gray-500 text-sm">Map unavailable</p>
      </div>
    );
  }

  if (!isApiLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-2"></div>
          <p className="text-gray-500 text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-full" />;
};

export default GoogleMapComponent;

