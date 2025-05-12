import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setUser, logout as logoutAction } from '../slices/userSlice';
import { setPredictedPrice, setRideHistory, clearSelectedRide } from '../slices/rideSlice';
import Profile from './Profile';
import RideSelection from './RideSelection';
import LocationMap from './Map';
import axios from 'axios';
import '../styles/dashboard.css';

// Use environment variable for API key
const LOCATIONIQ_API_KEY = process.env.REACT_APP_LOCATIONIQ_API_KEY;

const Dashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const predictedPrice = useSelector((state) => state.ride.predictedPrice);
  const rideHistory = useSelector((state) => state.ride.rideHistory);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('book-ride');
  const [pickupLocation, setPickupLocation] = useState({
    street: '',
    city: '',
    state: ''
  });
  const [dropoffLocation, setDropoffLocation] = useState({
    street: '',
    city: '',
    state: ''
  });
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [showRideSelection, setShowRideSelection] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectingLocation, setSelectingLocation] = useState(null);

  useEffect(() => {
    if (!user && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    }
  }, [user, location.pathname, navigate]);

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate('/login');
  };

  const getCoordinates = async (address) => {
    try {
      const fullAddress = `${address.street}, ${address.city}, ${address.state}`;
      const encodedAddress = encodeURIComponent(fullAddress);
      const response = await axios.get(
        `https://us1.locationiq.com/v1/search?key=${LOCATIONIQ_API_KEY}&q=${encodedAddress}&format=json`
      );

      if (response.data && response.data[0]) {
        return {
          lng: parseFloat(response.data[0].lon),
          lat: parseFloat(response.data[0].lat)
        };
      }
      throw new Error(`No coordinates found for address: ${fullAddress}`);
    } catch (error) {
      console.error('Geocoding error:', error.response?.data || error.message);
      throw new Error(`Failed to get coordinates for address: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleLocationChange = (type, field, value) => {
    if (type === 'pickup') {
      setPickupLocation(prev => ({
        ...prev,
        [field]: field === 'state' ? value.toUpperCase().slice(0, 2) : value
      }));
    } else {
      setDropoffLocation(prev => ({
        ...prev,
        [field]: field === 'state' ? value.toUpperCase().slice(0, 2) : value
      }));
    }
  };

  const handleLocationSelect = (address) => {
    if (selectingLocation === 'pickup') {
      setPickupLocation({
        street: address.street,
        city: address.city,
        state: address.state
      });
      setPickupCoords(address.coordinates);
    } else if (selectingLocation === 'dropoff') {
      setDropoffLocation({
        street: address.street,
        city: address.city,
        state: address.state
      });
      setDropoffCoords(address.coordinates);
    }
    setSelectingLocation(null);
  };

  const handleBookRide = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check if pickup and dropoff locations are the same
    if (
      pickupLocation.street.trim().toLowerCase() === dropoffLocation.street.trim().toLowerCase() &&
      pickupLocation.city.trim().toLowerCase() === dropoffLocation.city.trim().toLowerCase() &&
      pickupLocation.state.trim().toLowerCase() === dropoffLocation.state.trim().toLowerCase()
    ) {
      setError('Pickup and dropoff locations cannot be the same.');
      setLoading(false);
      return;
    }

    try {
      // Get coordinates for pickup and dropoff locations
      const pickup = await getCoordinates(pickupLocation);
      const dropoff = await getCoordinates(dropoffLocation);

      setPickupCoords(pickup);
      setDropoffCoords(dropoff);

      // Format current date-time in required format 'YYYY-MM-DD HH:MM:SS.ffffff'
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.000000`;

      const response = await axios.post('http://localhost:8000/predict', {
        pickup_latitude: pickup.lat,
        pickup_longitude: pickup.lng,
        dropoff_latitude: dropoff.lat,
        dropoff_longitude: dropoff.lng,
        passenger_count: 1,
        ride_requests: 10, // <-- Add this (example value)
        drivers: 5         // <-- Add this (example value)
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const basePrice = response.data.fare;
      dispatch(setPredictedPrice({
        uberx: basePrice,
        share: basePrice * 0.85,
        comfort_electric: basePrice * 1.2,
        uberxl: basePrice * 1.4
      }));
      setShowRideSelection(true);
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message || 'Failed to fetch ride options. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRide = (ride) => {
    console.log('Selected ride:', ride);
    // Here you would typically make an API call to book the ride
  };

  const handleStartNewBooking = () => {
    setPickupLocation({ street: '', city: '', state: '' });
    setDropoffLocation({ street: '', city: '', state: '' });
    setPickupCoords(null);
    setDropoffCoords(null);
    setShowRideSelection(false);
    dispatch(clearSelectedRide());
  };

  const renderBookRide = () => (
    <div className="dashboard-card book-ride-card">
      <h3 >Book a Ride</h3>
      <div className="book-ride-container">
        <div className="form-container">
          {!showRideSelection ? (
            <form onSubmit={handleBookRide} className="ride-form">
              <div className="location-group">
                <h4>Pickup Location</h4>
                <div className="form-group">
                  <label htmlFor="pickup-street">Street</label>
                  <input
                    type="text"
                    id="pickup-street"
                    className="form-control"
                    value={pickupLocation.street}
                    onChange={(e) => handleLocationChange('pickup', 'street', e.target.value)}
                    required
                    placeholder="Enter street address"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="pickup-city">City</label>
                    <input
                      type="text"
                      id="pickup-city"
                      className="form-control"
                      value={pickupLocation.city}
                      onChange={(e) => handleLocationChange('pickup', 'city', e.target.value)}
                      required
                      placeholder="Enter city"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="pickup-state">State</label>
                    <input
                      type="text"
                      id="pickup-state"
                      className="form-control"
                      value={pickupLocation.state}
                      onChange={(e) => handleLocationChange('pickup', 'state', e.target.value)}
                      required
                      placeholder="CA"
                      maxLength="2"
                    />
                  </div>
                </div>
              </div>

              <div className="location-group">
                <h4>Dropoff Location</h4>
                <div className="form-group">
                  <label htmlFor="dropoff-street">Street</label>
                  <input
                    type="text"
                    id="dropoff-street"
                    className="form-control"
                    value={dropoffLocation.street}
                    onChange={(e) => handleLocationChange('dropoff', 'street', e.target.value)}
                    required
                    placeholder="Enter street address"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="dropoff-city">City</label>
                    <input
                      type="text"
                      id="dropoff-city"
                      className="form-control"
                      value={dropoffLocation.city}
                      onChange={(e) => handleLocationChange('dropoff', 'city', e.target.value)}
                      required
                      placeholder="Enter city"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="dropoff-state">State</label>
                    <input
                      type="text"
                      id="dropoff-state"
                      className="form-control"
                      value={dropoffLocation.state}
                      onChange={(e) => handleLocationChange('dropoff', 'state', e.target.value)}
                      required
                      placeholder="CA"
                      maxLength="2"
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Loading...' : 'See Prices'}
              </button>
            </form>
          ) : null}
        </div>
      </div>

      {showRideSelection && (
        <RideSelection
          pickupLocation={`${pickupLocation.street}, ${pickupLocation.city}, ${pickupLocation.state}`}
          dropoffLocation={`${dropoffLocation.street}, ${dropoffLocation.city}, ${dropoffLocation.state}`}
          onSelectRide={handleSelectRide}
          predictedPrices={predictedPrice}
          pickupCoords={pickupCoords}
          dropoffCoords={dropoffCoords}
        />
      )}
    </div>
  );

  const renderRideHistory = () => (
    <div className="dashboard-card history-card">
      <h3>Ride History</h3>
      {rideHistory.length === 0 ? (
        <div className="empty-state">
          <p>No ride history available</p>
          <p className="subtext">Your completed rides will appear here</p>
        </div>
      ) : (
        <div className="ride-history">
          {rideHistory.map((ride, index) => (
            <div key={index} className="ride-item">
              <div className="ride-info">
                <p><strong>From:</strong> {ride.pickup}</p>
                <p><strong>To:</strong> {ride.dropoff}</p>
                <p><strong>Date:</strong> {ride.date}</p>
                <p><strong>Fare:</strong> ${ride.fare}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-header">
          <h2>UBER CUSTOMER DASHBOARD</h2>
          <button onClick={handleLogout} className="btn btn-outline-danger">
            LOGOUT
          </button>
        </div>
        <div className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'book-ride' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('book-ride');
              handleStartNewBooking();
            }}
          >
            Book Ride
          </button>
          <button
            className={`nav-tab ${activeTab === 'ride-history' ? 'active' : ''}`}
            onClick={() => navigate('/ride-history')}
          >
            Ride History
          </button>
          <button
            className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {activeTab === 'book-ride' && renderBookRide()}
        {activeTab === 'ride-history' && renderRideHistory()}
        {activeTab === 'profile' && <Profile />}
      </div>
    </div>
  );
};

export default Dashboard; 