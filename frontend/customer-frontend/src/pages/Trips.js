import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaCar, FaSpinner } from 'react-icons/fa';
import '../styles/trips.css';

const Trips = () => {
  const user = useSelector((state) => state.user.user);
  const selectedRide = useSelector((state) => state.ride.selectedRide);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!selectedRide) {
      navigate('/dashboard');
      return;
    }

    // Simulate checking for driver acceptance
    const checkDriverStatus = async () => {
      try {
        // Here you would typically make an API call to check driver status
        // For now, we'll just simulate a delay
        await new Promise(resolve => setTimeout(resolve, 5000));
        setLoading(false);
      } catch (err) {
        setError('Failed to check driver status');
        setLoading(false);
      }
    };

    checkDriverStatus();
  }, [user, selectedRide, navigate]);

  if (!user) {
    return (
      <div className="dashboard-card">
        <div className="alert alert-danger">You must be logged in to view this page.</div>
      </div>
    );
  }

  return (
    <div className="trips-container">
      <div className="trips-card">
        <div className="trips-header">
          <h2>Finding a Driver</h2>
        </div>
        
        <div className="trips-content">
          <div className="loading-section">
            <FaSpinner className="spinner" />
            <h3>Waiting for nearby drivers...</h3>
            <p>We're searching for the best driver for your ride</p>
          </div>

          <div className="ride-details">
            <div className="detail-item">
              <span className="label">Pickup:</span>
              <span className="value">{selectedRide?.pickupLocation?.address || 'Loading...'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Dropoff:</span>
              <span className="value">{selectedRide?.dropoffLocation?.address || 'Loading...'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Ride Type:</span>
              <span className="value">{selectedRide?.name || 'Loading...'}</span>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Trips; 