import { useEffect, useRef } from 'react';

const HallsMap = ({ halls, userLocation, onHallClick }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    } else {
      initializeMap();
    }

    function initializeMap() {
      if (!mapRef.current) return;

      // Determine map center
      let center = { lat: 28.6139, lng: 77.2090 }; // Default: New Delhi
      
      if (userLocation && userLocation.lat && userLocation.lng) {
        center = { lat: userLocation.lat, lng: userLocation.lng };
      } else if (halls && halls.length > 0) {
        // Use first hall's location as center
        const firstHall = halls.find(h => h.location?.coordinates);
        if (firstHall && firstHall.location.coordinates) {
          center = {
            lat: firstHall.location.coordinates[1],
            lng: firstHall.location.coordinates[0],
          };
        }
      }

      // Initialize map
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          center,
          zoom: halls && halls.length > 0 ? 12 : 10,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
        });
      } else {
        mapInstanceRef.current.setCenter(center);
      }

      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      // Add markers for each hall
      if (halls && halls.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        let hasValidLocation = false;

        halls.forEach((hall) => {
          // Validate coordinates exist and are valid
          if (hall.location && 
              hall.location.coordinates && 
              Array.isArray(hall.location.coordinates) &&
              hall.location.coordinates.length === 2 &&
              typeof hall.location.coordinates[0] === 'number' &&
              typeof hall.location.coordinates[1] === 'number' &&
              hall.location.coordinates[0] !== 0 &&
              hall.location.coordinates[1] !== 0 &&
              !isNaN(hall.location.coordinates[0]) &&
              !isNaN(hall.location.coordinates[1])) {
            
            const position = {
              lat: hall.location.coordinates[1],
              lng: hall.location.coordinates[0],
            };

            const marker = new window.google.maps.Marker({
              position,
              map: mapInstanceRef.current,
              title: hall.name,
              icon: {
                url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                scaledSize: new window.google.maps.Size(32, 32),
              },
            });

            // Add info window
            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div style="padding: 8px; max-width: 200px;">
                  <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #ea580c;">${hall.name}</h3>
                  <p style="margin: 4px 0; color: #666; font-size: 12px;">
                    <strong>Capacity:</strong> ${hall.capacity} people<br/>
                    <strong>Price:</strong> ₹${hall.price}<br/>
                    ${hall.distance ? `<strong>Distance:</strong> ${hall.distance.toFixed(1)} km` : ''}
                  </p>
                  ${onHallClick ? `<button onclick="window.selectHall('${hall._id}')" style="margin-top: 8px; padding: 6px 12px; background: #ea580c; color: white; border: none; border-radius: 4px; cursor: pointer;">View Details</button>` : ''}
                </div>
              `,
            });

            marker.addListener('click', () => {
              infoWindow.open(mapInstanceRef.current, marker);
            });

            if (onHallClick) {
              window.selectHall = (hallId) => {
                onHallClick(hallId);
              };
            }

            markersRef.current.push(marker);
            bounds.extend(position);
            hasValidLocation = true;
          }
        });

        // Fit bounds to show all markers
        if (hasValidLocation && markersRef.current.length > 0) {
          mapInstanceRef.current.fitBounds(bounds);
          
          // Don't zoom in too much if only one marker
          if (markersRef.current.length === 1) {
            mapInstanceRef.current.setZoom(15);
          }
        }

        // Add user location marker if available
        if (userLocation && userLocation.lat && userLocation.lng) {
          const userMarker = new window.google.maps.Marker({
            position: userLocation,
            map: mapInstanceRef.current,
            title: 'Your Location',
            icon: {
              url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              scaledSize: new window.google.maps.Size(32, 32),
            },
          });
          markersRef.current.push(userMarker);
        }
      }
    }

    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, [halls, userLocation, onHallClick]);

  return <div ref={mapRef} className="w-full h-full min-h-[400px] rounded-xl overflow-hidden" />;
};

export default HallsMap;

