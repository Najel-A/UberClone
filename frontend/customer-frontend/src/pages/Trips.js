import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaCar, FaSpinner } from 'react-icons/fa';
import '../styles/trips.css';
import { getRideStatus } from '../customer/customerAPI';

console.log('Ride Service URL:', process.env.REACT_APP_RIDE_SERVICE_URL);

const Trips = () => {
  const user = useSelector((state) => state.user.user);
  const selectedRide = useSelector((state) => state.ride.selectedRide);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rideAccepted, setRideAccepted] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!selectedRide) {
      navigate('/dashboard');
      return;
    }

    if (!selectedRide._id) {
      setError('No ride ID found. Please try booking again.');
      setLoading(false);
      return;
    }

    let interval;
    const pollRideStatus = async () => {
      try {
        const res = await getRideStatus(selectedRide._id);
        console.log('Polled ride status:', res.data.status, res.data);
        if (res.data.status === 'accepted') {
          setRideAccepted(true);
          setLoading(false);
          clearInterval(interval);
        } else {
          setLoading(true);
        }
      } catch (err) {
        setError('Failed to check ride status');
        setLoading(false);
        clearInterval(interval);
      }
    };
    pollRideStatus();
    interval = setInterval(pollRideStatus, 4000);
    return () => clearInterval(interval);
  }, [user, selectedRide, navigate]);

  useEffect(() => {
    if (rideAccepted) {
      const timeout = setTimeout(() => {
        navigate('/ride-in-progress');
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [rideAccepted, navigate]);

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
          <h2>{rideAccepted ? 'Driver Found!' : 'Finding a Driver'}</h2>
        </div>
        
        <div className="trips-content">
          {rideAccepted ? (
            <div className="confirmation-section">
              <FaCar className="icon" />
              <h3>Your ride has been accepted by a driver!</h3>
              <p>Driver is on the way. Please be ready at your pickup location.</p>
            </div>
          ) : (
            <div className="loading-section">
              <FaSpinner className="spinner" />
              <h3>Waiting for nearby drivers...</h3>
              <p>We're searching for the best driver for your ride</p>
            </div>
          )}

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