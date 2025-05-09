import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('book-ride');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [rideHistory, setRideHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBookRide = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // TODO: Implement ride booking logic
      console.log('Booking ride from:', pickupLocation, 'to:', dropoffLocation);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setError('Ride booking feature is under development');
    } catch (err) {
      setError(err.message || 'Failed to book ride');
    } finally {
      setLoading(false);
    }
  };

  const renderBookRide = () => (
    <div className="dashboard-card book-ride-card">
      <h3>Book a Ride</h3>
      <form onSubmit={handleBookRide} className="ride-form">
        <div className="form-group">
          <label htmlFor="pickup">Pickup Location</label>
          <input
            type="text"
            id="pickup"
            className="form-control"
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            required
            placeholder="Enter pickup location"
          />
        </div>
        <div className="form-group">
          <label htmlFor="dropoff">Dropoff Location</label>
          <input
            type="text"
            id="dropoff"
            className="form-control"
            value={dropoffLocation}
            onChange={(e) => setDropoffLocation(e.target.value)}
            required
            placeholder="Enter dropoff location"
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (
            <span className="loading-spinner" />
          ) : (
            'Book Ride'
          )}
        </button>
      </form>
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

  const renderProfile = () => (
    <div className="dashboard-card profile-card">
      <h3>Profile Information</h3>
      {user && (
        <div className="profile-info">
          <div className="profile-section">
            <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.phoneNumber}</p>
          </div>
          <div className="profile-section">
            <p><strong>Address:</strong></p>
            <p>{user.address.street}</p>
            <p>{user.address.city}, {user.address.state} {user.address.zipCode}</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-header">
          <h2>UBER Customer Dashboard</h2>
          <button onClick={handleLogout} className="btn btn-outline-danger">
            Logout
          </button>
        </div>
        <div className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'book-ride' ? 'active' : ''}`}
            onClick={() => setActiveTab('book-ride')}
          >
            Book Ride
          </button>
          <button
            className={`nav-tab ${activeTab === 'ride-history' ? 'active' : ''}`}
            onClick={() => setActiveTab('ride-history')}
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
        {activeTab === 'profile' && renderProfile()}
      </div>
    </div>
  );
};

export default Dashboard; 