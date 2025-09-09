import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Create custom icons for pickup and dropoff
const createCustomIcon = (color, type) => {
  return L.divIcon({
    className: `custom-marker ${type}-marker`,
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        font-weight: bold;
      ">
        ${type === 'pickup' ? 'P' : 'D'}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const pickupIcon = createCustomIcon('#00C853', 'pickup'); // Green for pickup
const dropoffIcon = createCustomIcon('#D32F2F', 'dropoff'); // Red for dropoff

const LocationMap = ({ pickupCoords, dropoffCoords, onLocationSelect }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const pickupMarker = useRef(null);
  const dropoffMarker = useRef(null);
  const [mapError, setMapError] = useState(null);
  const [mapInitialized, setMapInitialized] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!process.env.REACT_APP_LOCATIONIQ_API_KEY) {
      setMapError('LocationIQ API key is missing');
      return;
    }

    // Only initialize map once
    if (!map.current && mapContainer.current) {
      try {
        // Create map instance
        map.current = L.map(mapContainer.current, {
          center: [37.3382, -121.8863], // San Jose coordinates
          zoom: 13,
          zoomControl: false, // We'll add it manually to bottom right
          attributionControl: true
        });

        // Try LocationIQ tiles first, fallback to OpenStreetMap if there's an error
        const locationIQLayer = L.tileLayer(
          'https://tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key=${process.env.REACT_APP_LOCATIONIQ_API_KEY}',
          {
            attribution: '© LocationIQ | © OpenStreetMap contributors',
            maxZoom: 18
          }
        );

        const osmLayer = L.tileLayer(
          'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
          }
        );

        // Add OpenStreetMap tiles as base layer
        osmLayer.addTo(map.current);

        // Try to add LocationIQ layer
        let hasShownTileError = false;
        locationIQLayer.on('tileerror', (error) => {
          if (!hasShownTileError) {
            hasShownTileError = true;
          }
          if (!map.current.hasLayer(osmLayer)) {
            osmLayer.addTo(map.current);
          }
        });

        locationIQLayer.addTo(map.current);

        // Add zoom control to bottom right
        L.control.zoom({
          position: 'bottomright'
        }).addTo(map.current);

        // Add click handler for the map
        map.current.on('click', async (e) => {
          const { lat, lng } = e.latlng;
          
          try {
            // Rate limit handling - add delay between requests
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Reverse geocode the clicked location
            const response = await fetch(
              `https://us1.locationiq.com/v1/reverse?key=${process.env.REACT_APP_LOCATIONIQ_API_KEY}&lat=${lat}&lon=${lng}&format=json`
            );
            
            if (!response.ok) {
              if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again in a moment.');
              }
              throw new Error(`LocationIQ API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (onLocationSelect) {
              // Extract address components
              const address = {
                street: `${data.address.house_number || ''} ${data.address.road || ''}`.trim(),
                city: data.address.city || data.address.town || data.address.village || '',
                state: data.address.state || '',
                coordinates: { lng, lat }
              };
              onLocationSelect(address);
            }
          } catch (error) {
            console.error('Reverse geocoding error:', error);
            setMapError(error.message);
            setTimeout(() => setMapError(null), 3000); // Clear error after 3 seconds
          }
        });

        setMapInitialized(true);

        // Force a resize event after initialization
        setTimeout(() => {
          if (map.current) {
            map.current.invalidateSize();
          }
        }, 250);

      } catch (error) {
        console.error('Map initialization error:', error);
        setMapError('Failed to initialize map');
      }
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        setMapInitialized(false);
      }
    };
  }, []);

  // Handle markers and bounds updates
  useEffect(() => {
    if (!map.current || !mapInitialized) return;

    try {
      // Update pickup marker
      if (pickupCoords) {
        if (pickupMarker.current) {
          map.current.removeLayer(pickupMarker.current);
        }
        pickupMarker.current = L.marker([pickupCoords.lat, pickupCoords.lng], {
          icon: pickupIcon
        }).addTo(map.current);
      }

      // Update dropoff marker
      if (dropoffCoords) {
        if (dropoffMarker.current) {
          map.current.removeLayer(dropoffMarker.current);
        }
        dropoffMarker.current = L.marker([dropoffCoords.lat, dropoffCoords.lng], {
          icon: dropoffIcon
        }).addTo(map.current);

        // Draw a line between pickup and dropoff
        if (pickupCoords) {
          if (map.current.routeLine) {
            map.current.removeLayer(map.current.routeLine);
          }
          map.current.routeLine = L.polyline(
            [
              [pickupCoords.lat, pickupCoords.lng],
              [dropoffCoords.lat, dropoffCoords.lng]
            ],
            {
              color: '#000',
              weight: 3,
              opacity: 0.6,
              dashArray: '10, 10'
            }
          ).addTo(map.current);
        }
      }

      // Fit bounds if both markers exist
      if (pickupCoords && dropoffCoords) {
        const bounds = L.latLngBounds(
          [pickupCoords.lat, pickupCoords.lng],
          [dropoffCoords.lat, dropoffCoords.lng]
        );
        map.current.fitBounds(bounds, { 
          padding: [50, 50],
          maxZoom: 15 // Prevent zooming in too close
        });
      }

    } catch (error) {
      console.error('Error updating markers:', error);
      setMapError('Failed to update map markers');
      setTimeout(() => setMapError(null), 3000); // Clear error after 3 seconds
    }
  }, [pickupCoords, dropoffCoords, mapInitialized]);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      borderRadius: '8px',
      overflow: 'hidden',
      position: 'relative',
      backgroundColor: '#f8f9fa'
    }}>
      <div 
        ref={mapContainer} 
        style={{ 
          width: '100%', 
          height: '100%',
          opacity: mapInitialized ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }} 
      />
      {mapError && (
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '8px 16px',
          borderRadius: '4px',
          color: '#dc3545',
          fontSize: '14px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          zIndex: 1000,
          maxWidth: '80%',
          textAlign: 'center'
        }}>
          {mapError}
        </div>
      )}
    </div>
  );
};

export default LocationMap; 