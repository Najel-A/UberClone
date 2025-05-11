import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RideInProgress = () => {
  const user = useSelector((state) => state.user.user);
  const selectedRide = useSelector((state) => state.ride.selectedRide);
  const navigate = useNavigate();
  const [distanceCovered, setDistanceCovered] = useState(0);
  const [totalDistance, setTotalDistance] = useState(1); // Avoid division by zero
  const [status, setStatus] = useState('in_progress');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !selectedRide || !selectedRide._id) {
      navigate('/dashboard');
      return;
    }
    setTotalDistance(selectedRide.distanceCovered || 1);
    let interval;
    const pollRide = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_RIDE_SERVICE_URL}/api/rides/${selectedRide._id}`);
        setDistanceCovered(res.data.distanceCovered || 0);
        setStatus(res.data.status);
        setLoading(false);
        if (res.data.status === 'completed') {
          clearInterval(interval);
        }
      } catch (err) {
        setError('Failed to fetch ride progress');
        setLoading(false);
        clearInterval(interval);
      }
    };
    pollRide();
    interval = setInterval(pollRide, 2000);
    return () => clearInterval(interval);
  }, [user, selectedRide, navigate]);

  if (!user || !selectedRide) {
    return <div className="dashboard-card">No ride in progress.</div>;
  }

  const percent = Math.min(100, Math.round((distanceCovered / totalDistance) * 100));

  return (
    <div className="trips-container">
      <div style={{ marginBottom: 16 }}>
        <button
          style={{
            background: '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            padding: '8px 20px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}
          onClick={() => navigate('/dashboard')}
        >
          Home
        </button>
      </div>
      <div className="trips-card">
        <div className="trips-header">
          <h2>Ride In Progress</h2>
        </div>
        <div className="trips-content">
          {loading ? (
            <div className="loading-section">
              <p>Loading ride progress...</p>
            </div>
          ) : status === 'completed' ? (
            <div className="confirmation-section">
              <h3>Ride Completed!</h3>
              <p>Thank you for riding with us.</p>
            </div>
          ) : (
            <>
              <div style={{ margin: '30px 0' }}>
                <div style={{
                  height: '30px',
                  width: '100%',
                  backgroundColor: '#e0e0de',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, Math.round((distanceCovered / totalDistance) * 100))}%`,
                    backgroundColor: '#007bff',
                    transition: 'width 0.5s',
                    borderRadius: '10px 0 0 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    {`${Math.min(100, Math.round((distanceCovered / totalDistance) * 100))}%`}
                  </div>
                </div>
              </div>
              <div className="ride-details">
                <div className="detail-item">
                  <span className="label">Pickup:</span>
                  <span className="value">{selectedRide.pickupLocation?.address}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Dropoff:</span>
                  <span className="value">{selectedRide.dropoffLocation?.address}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Distance Covered:</span>
                  <span className="value">{distanceCovered.toFixed(2)} / {totalDistance.toFixed(2)} miles</span>
                </div>
              </div>
            </>
          )}
          {error && <div className="alert alert-danger">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default RideInProgress; 