import React from 'react';
import { FaCar, FaUsers, FaBolt, FaClock } from 'react-icons/fa';
import LocationMap from './Map';
import '../styles/rideSelection.css';

const RideSelection = ({ pickupLocation, dropoffLocation, onSelectRide, predictedPrices, pickupCoords, dropoffCoords }) => {
  const formatPrice = (price) => `$${Number(price).toFixed(2)}`;
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };
  
  const rides = [
    {
      id: 'uberx',
      name: 'UberX',
      icon: <FaCar size={24} />,
      price: predictedPrices?.uberx || 0,
      time: '2 mins away',
      arrivalTime: getCurrentTime(),
      description: 'Affordable rides all to yourself',
      capacity: 4
    },
    {
      id: 'share',
      name: 'Share',
      icon: <FaUsers size={24} />,
      price: predictedPrices?.share || 0,
      time: '3 mins away',
      arrivalTime: getCurrentTime(),
      description: 'One seat only',
      capacity: 1
    },
    {
      id: 'comfort',
      name: 'Comfort Electric',
      icon: <FaBolt size={24} />,
      price: predictedPrices?.comfort_electric || 0,
      time: '6 mins away',
      arrivalTime: getCurrentTime(),
      description: 'Newer zero-emission cars with extra legroom',
      capacity: 4
    },
    {
      id: 'uberxl',
      name: 'UberXL',
      icon: <FaUsers size={24} />,
      price: predictedPrices?.uberxl || 0,
      time: '6 mins away',
      arrivalTime: getCurrentTime(),
      description: 'Affordable rides for groups up to 6',
      capacity: 6
    }
  ];

  const [selectedRide, setSelectedRide] = React.useState(rides[0]);

  const handleRideSelect = (ride) => {
    setSelectedRide(ride);
  };

  return (
    <div className="ride-selection-page">
      <div className="ride-selection-container">
        <div className="ride-options">
          {rides.map((ride) => (
            <div 
              key={ride.id} 
              className={`ride-option ${selectedRide.id === ride.id ? 'selected' : ''}`}
              onClick={() => handleRideSelect(ride)}
            >
              <div className="ride-info">
                <div className="ride-icon">{ride.icon}</div>
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
            onClick={() => onSelectRide(selectedRide)}
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