import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from 'react-bootstrap';

const Simulation = () => {
  const currentDriver = useSelector((state) => state.auth.currentDriver);
  const acceptedRideId = useSelector((state) => state.driver.acceptedRideId);
  const [ride, setRide] = useState(null);
  const [distanceCovered, setDistanceCovered] = useState(0);
  const [totalDistance, setTotalDistance] = useState(1);
  const [status, setStatus] = useState('in_progress');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!acceptedRideId) return;
    let interval;
    const pollRide = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_RIDE_SERVICE_URL}/api/rides/${acceptedRideId}`);
        setRide(res.data);
        setDistanceCovered(res.data.distanceCovered || 0);
        setTotalDistance(res.data.distanceCovered || 1);
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
  }, [acceptedRideId]);

  if (!currentDriver) {
    return <div className="dashboard-card">Please login to view simulation.</div>;
  }
  if (!acceptedRideId) {
    return <div className="dashboard-card">No accepted ride in progress.</div>;
  }
  if (!ride) {
    return <div className="dashboard-card">Loading ride...</div>;
  }

  const percent = Math.min(100, Math.round((distanceCovered / totalDistance) * 100));

  return (
    <div className="trips-container">
      <div style={{ marginBottom: 16 }}>
        <Button variant="secondary" onClick={() => navigate('/dashboard')}>
          Home
        </Button>
      </div>
      <div className="trips-card">
        <div className="trips-header">
          <h2>Ride Simulation</h2>
        </div>
        <div className="trips-content">
          {loading ? (
            <div className="loading-section">
              <p>Loading ride progress...</p>
            </div>
          ) : status === 'completed' ? (
            <div className="confirmation-section">
              <h3>Ride Completed!</h3>
              <p>Simulation finished.</p>
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
                    width: `${percent}%`,
                    backgroundColor: '#007bff',
                    transition: 'width 0.5s',
                    borderRadius: '10px 0 0 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    {`${percent}%`}
                  </div>
                </div>
              </div>
              <div className="ride-details">
                <div className="detail-item">
                  <span className="label">Pickup:</span>
                  <span className="value">{ride.pickupLocation?.address}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Dropoff:</span>
                  <span className="value">{ride.dropoffLocation?.address}</span>
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

export default Simulation; 