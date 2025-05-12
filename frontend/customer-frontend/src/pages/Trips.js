import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaCar, FaSpinner } from 'react-icons/fa';
import '../styles/trips.css';
import { getRideStatus, submitDriverReview, cancelRide } from '../customer/customerAPI';
import { clearSelectedRide } from '../slices/rideSlice';

console.log('Ride Service URL:', process.env.REACT_APP_RIDE_SERVICE_URL);

const Trips = () => {
  const user = useSelector((state) => state.user.user);
  const selectedRide = useSelector((state) => state.ride.selectedRide);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rideAccepted, setRideAccepted] = useState(false);
  const [rideCompleted, setRideCompleted] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [cancelSuccess, setCancelSuccess] = useState('');
  const [cancelledBy, setCancelledBy] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

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
        } else if (res.data.status === 'completed') {
          setRideCompleted(true);
          setShowReview(true);
          setLoading(false);
          clearInterval(interval);
        } else if (res.data.status === 'cancelled') {
          setLoading(false);
          setCancelledBy(res.data.cancelledBy || null);
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
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [rideAccepted, navigate]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    try {
      await submitDriverReview(selectedRide.driverId, rating, reviewText);
      setReviewSuccess('Thank you for your feedback!');
      setShowReview(false);
    } catch (err) {
      setReviewError('Failed to submit review. Please try again.');
    }
  };

  const handleCancelRide = async () => {
    setCancelError('');
    setCancelSuccess('');
    setCancelLoading(true);
    try {
      await cancelRide(selectedRide._id);
      setCancelledBy('customer');
      dispatch(clearSelectedRide());
      setCancelSuccess('Ride cancelled successfully.');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setCancelError(err.response?.data?.message || 'Failed to cancel ride. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleBackToHome = () => {
    dispatch(clearSelectedRide());
    setLoading(true);
    setError('');
    setRideAccepted(false);
    setRideCompleted(false);
    setShowReview(false);
    setReviewText('');
    setRating(5);
    setReviewSuccess('');
    setReviewError('');
    setCancelError('');
    setCancelSuccess('');
    setCancelledBy(null);
    setCancelLoading(false);
    navigate('/dashboard');
  };

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
          <button 
            onClick={handleBackToHome}
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '16px',
              padding: '8px 0',
              marginBottom: '16px'
            }}
          >
            ← Back to Home
          </button>
          <h2>{rideAccepted ? 'Driver Found!' : 'Finding a Driver'}</h2>
        </div>
        <div className="trips-content">
          {cancelledBy === 'driver' && (
            <div className="alert alert-warning">Ride cancelled by driver.</div>
          )}
          {rideCompleted && showReview && (
            <div className="review-section" style={{ marginBottom: 24, padding: 16, background: '#f8f9fa', borderRadius: 8 }}>
              <h3>Rate Your Driver</h3>
              <form onSubmit={handleSubmitReview}>
                <div style={{ marginBottom: 12 }}>
                  <label>Rating: </label>
                  <select value={rating} onChange={e => setRating(Number(e.target.value))} style={{ marginLeft: 8 }}>
                    {[5,4,3,2,1].map(val => (
                      <option key={val} value={val}>{val}</option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label>Review: </label>
                  <textarea
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    rows={3}
                    style={{ width: '100%', borderRadius: 4, border: '1px solid #ccc', padding: 8 }}
                    placeholder="Share your experience..."
                  />
                </div>
                <button type="submit" style={{ background: '#000', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 20px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Submit Review
                </button>
                {reviewSuccess && <div style={{ color: 'green', marginTop: 8 }}>{reviewSuccess}</div>}
                {reviewError && <div style={{ color: 'red', marginTop: 8 }}>{reviewError}</div>}
              </form>
            </div>
          )}
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
            {!rideCompleted && !cancelledBy && (
              <button
                style={{
                  background: 'red',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  padding: '8px 20px',
                  cursor: cancelLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  marginTop: 16,
                  opacity: cancelLoading ? 0.7 : 1
                }}
                onClick={handleCancelRide}
                disabled={cancelLoading}
              >
                {cancelLoading ? 'Cancelling...' : 'Cancel Ride'}
              </button>
            )}
            {cancelError && <div style={{ color: 'red', marginTop: 8 }}>{cancelError}</div>}
            {cancelSuccess && <div style={{ color: 'green', marginTop: 8 }}>{cancelSuccess}</div>}
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