import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft } from 'react-icons/fa';
import '../styles/rideHistory.css';

const RideHistory = () => {
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRides = async () => {
      if (!user || !user.id) return;
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${process.env.REACT_APP_RIDE_SERVICE_URL}/api/rides/customer/${user.id}`);
        let ridesData = res.data;
        // For each ride, fetch driver name if not present
        ridesData = await Promise.all(ridesData.map(async (ride) => {
          if (ride.driverName && ride.driverName !== 'N/A') return ride;
          if (ride.driverId) {
            try {
              const driverRes = await axios.get(`${process.env.REACT_APP_DRIVER_SERVICE_URL}/api/drivers/${ride.driverId}`);
              const driverName = `${driverRes.data.firstName || driverRes.data.firstname || ''} ${driverRes.data.lastName || driverRes.data.lastname || ''}`.trim();
              return { ...ride, driverName: driverName || ride.driverId };
            } catch (e) {
              return { ...ride, driverName: ride.driverId };
            }
          }
          return { ...ride, driverName: 'N/A' };
        }));
        // Sort by dateTime descending
        ridesData.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
        setRides(ridesData);
      } catch (err) {
        setError('Failed to fetch ride history');
      } finally {
        setLoading(false);
      }
    };
    fetchRides();
  }, [user]);

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'status-completed';
      case 'in progress':
        return 'status-in-progress';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  return (
    <div className="ride-history-container">
      <div className="ride-history-card">
        <div className="ride-history-header">
          <button 
            onClick={() => navigate('/dashboard')}
            className="back-button"
          >
            <FaArrowLeft /> Back
          </button>
          <h2 className="ride-history-title">Ride History</h2>
        </div>
        <div className="ride-history-content">
          {loading ? (
            <div className="loading-section">
              <p>Loading ride history...</p>
            </div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : rides.length === 0 ? (
            <div className="no-rides-message">No rides found.</div>
          ) : (
            <div className="ride-history-table-scroll">
              <table className="rides-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Pickup</th>
                    <th>Dropoff</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Driver</th>
                  </tr>
                </thead>
                <tbody>
                  {rides.map((ride) => (
                    <tr key={ride._id}>
                      <td className="ride-date">{new Date(ride.dateTime).toLocaleString()}</td>
                      <td>{ride.pickupLocation?.address || 'N/A'}</td>
                      <td>{ride.dropoffLocation?.address || 'N/A'}</td>
                      <td className="ride-price">${ride.price?.toFixed(2) || 'N/A'}</td>
                      <td>
                        <span className={`ride-status ${getStatusClass(ride.status)}`}>
                          {ride.status || 'N/A'}
                        </span>
                      </td>
                      <td>{ride.driverName || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RideHistory; 