import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedRide } from '../slices/rideSlice';
import { FaCar, FaUsers, FaBolt, FaClock } from 'react-icons/fa';
import LocationMap from './Map';
import '../styles/rideSelection.css';
import RideConfirmation from './RideConfirmation';

const LOCATIONIQ_API_KEY = process.env.REACT_APP_LOCATIONIQ_API_KEY;

// Cache for storing distance calculations
const distanceCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

const RideSelection = ({ pickupLocation, dropoffLocation, onSelectRide, pickupCoords, dropoffCoords }) => {
  const predictedPrices = useSelector((state) => state.ride.predictedPrice);
  const dispatch = useDispatch();
  const [drivingDistance, setDrivingDistance] = React.useState(null);
  const [distanceError, setDistanceError] = React.useState('');
  const [isCalculating, setIsCalculating] = React.useState(false);

  React.useEffect(() => {
    const getDrivingDistance = async () => {
      if (!pickupCoords || !dropoffCoords) return;
      
      // Create a cache key from the coordinates
      const cacheKey = `${pickupCoords.lat},${pickupCoords.lng}-${dropoffCoords.lat},${dropoffCoords.lng}`;
      
      // Check cache first
      const cachedData = distanceCache.get(cacheKey);
      if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
        setDrivingDistance(cachedData.distance);
        return;
      }

      // If already calculating, don't start another calculation
      if (isCalculating) return;
      
      try {
        setIsCalculating(true);
        setDistanceError('');
        setDrivingDistance(null);

        // Add a small delay to prevent rapid consecutive requests
        await new Promise(resolve => setTimeout(resolve, 1000));

        const url = `https://us1.locationiq.com/v1/directions/driving/${pickupCoords.lng},${pickupCoords.lat};${dropoffCoords.lng},${dropoffCoords.lat}?key=${LOCATIONIQ_API_KEY}&overview=false`;
        const response = await fetch(url);
        
        if (!response.ok) {
          if (response.status === 429) {
            throw new Error('Rate limit exceeded. Please try again in a moment.');
          }
          throw new Error('Failed to fetch driving distance.');
        }

        const data = await response.json();
        if (data.routes && data.routes[0] && data.routes[0].distance) {
          const distanceMiles = data.routes[0].distance / 1609.34;
          setDrivingDistance(distanceMiles);
          
          // Cache the result
          distanceCache.set(cacheKey, {
            distance: distanceMiles,
            timestamp: Date.now()
          });
        } else {
          setDistanceError('Could not fetch driving distance.');
        }
      } catch (err) {
        setDistanceError(err.message || 'Error fetching driving distance.');
      } finally {
        setIsCalculating(false);
      }
    };

    getDrivingDistance();
  }, [pickupCoords, dropoffCoords]);

  const formatPrice = (price) => `$${Number(price).toFixed(2)}`;
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };
  const user = useSelector((state) => state.user.user);
  
  const iconMap = {
    uberx: <FaCar size={24} />,
    share: <FaUsers size={24} />,
    comfort: <FaBolt size={24} />,
    uberxl: <FaUsers size={24} />
  };

  const rides = [
    {
      id: 'uberx',
      name: 'UberX',
      price: predictedPrices?.uberx || 0,
      time: '2 mins away',
      arrivalTime: getCurrentTime(),
      description: 'Affordable rides all to yourself',
      capacity: 4
    },
    {
      id: 'share',
      name: 'Share',
      price: predictedPrices?.share || 0,
      time: '3 mins away',
      arrivalTime: getCurrentTime(),
      description: 'One seat only',
      capacity: 1
    },
    {
      id: 'comfort',
      name: 'Comfort Electric',
      price: predictedPrices?.comfort_electric || 0,
      time: '6 mins away',
      arrivalTime: getCurrentTime(),
      description: 'Newer zero-emission cars with extra legroom',
      capacity: 4
    },
    {
      id: 'uberxl',
      name: 'UberXL',
      price: predictedPrices?.uberxl || 0,
      time: '6 mins away',
      arrivalTime: getCurrentTime(),
      description: 'Affordable rides for groups up to 6',
      capacity: 6
    }
  ];

  const [selectedRide, setSelectedRideLocal] = React.useState(rides[0]);
  const [showConfirmation, setShowConfirmation] = React.useState(false);

  const handleRideSelect = (ride) => {
    const rideWithCoords = {
      ...ride,
      pickupCoords: pickupCoords,
      dropoffCoords: dropoffCoords
    };
    setSelectedRideLocal(rideWithCoords);
    dispatch(setSelectedRide(rideWithCoords));
  };

  const reduxSelectedRide = useSelector((state) => state.ride.selectedRide);

  const handleBookRide = () => {
    if (!reduxSelectedRide) {
      const rideWithCoords = {
        ...selectedRide,
        pickupCoords: pickupCoords,
        dropoffCoords: dropoffCoords
      };
      dispatch(setSelectedRide(rideWithCoords));
    }
    setShowConfirmation(true);
  };

  if (!user) {
    return (
      <div className="dashboard-card">
        <div className="alert alert-danger">You must be logged in to view this page.</div>
      </div>
    );
  }

  if (showConfirmation) {
    return (
      <RideConfirmation
        pickupLocation={pickupLocation}
        dropoffLocation={dropoffLocation}
        distance={drivingDistance}
        onConfirm={() => onSelectRide(selectedRide)}
        onBack={() => setShowConfirmation(false)}
      />
    );
  }

  return (
    <div className="ride-selection-page">
      <div className="ride-selection-container">
        <div className="ride-options">
          {/* Distance display */}
          {pickupCoords && dropoffCoords && (
            <div className="ride-distance-info" style={{ marginBottom: '16px', fontWeight: 'bold', fontSize: '16px' }}>
              {distanceError ? (
                <span style={{ color: 'red' }}>{distanceError}</span>
              ) : drivingDistance !== null ? (
                <>Distance (on road): {drivingDistance.toFixed(2)} miles</>
              ) : (
                <>Calculating road distance...</>
              )}
            </div>
          )}
          {rides.map((ride) => (
            <div 
              key={ride.id} 
              className={`ride-option ${selectedRide.id === ride.id ? 'selected' : ''}`}
              onClick={() => handleRideSelect(ride)}
            >
              <div className="ride-info">
                <div className="ride-icon">{iconMap[ride.id]}</div>
                <div className="ride-details">
                  <div className="ride-name">{ride.name}</div>
                  <div className="ride-description">{ride.description}</div>
                  <div className="ride-capacity">
                    <FaUsers size={14} /> Up to {ride.capacity} passengers
                  </div>
                </div>
              </div>
              <div className="ride-price-info">
                <div className="ride-price">{formatPrice(ride.price)}</div>
                <div className="ride-time">
                  <FaClock size={14} /> {ride.time}
                </div>
                <div className="ride-arrival">Arrives at {ride.arrivalTime}</div>
              </div>
            </div>
          ))}
          <button 
            className="book-ride-button" 
            onClick={handleBookRide}
          >
            Book {selectedRide.name} - {formatPrice(selectedRide.price)}
          </button>
        </div>
        <div className="map-container">
          <LocationMap
            pickupCoords={pickupCoords}
            dropoffCoords={dropoffCoords}
          />
        </div>
      </div>
    </div>
  );
};

export default RideSelection; 