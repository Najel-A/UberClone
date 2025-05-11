import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaCar, FaUsers, FaBolt, FaMapMarkerAlt, FaCreditCard } from 'react-icons/fa';
import { setSelectedRide, clearSelectedRide } from '../slices/rideSlice';
import '../styles/rideConfirmation.css';
import axios from 'axios';

const RideConfirmation = ({ ride, pickupLocation, dropoffLocation, distance, onConfirm, onBack }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const selectedRide = useSelector((state) => state.ride.selectedRide);
  const user = useSelector((state) => state.user.user);
  const rideToShow = ride || selectedRide;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [walletBalance, setWalletBalance] = useState(null);
  const [walletError, setWalletError] = useState('');

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BILLING_SERVICE_URL}/api/billing/getCustomerWallet/${user.id}`);
        setWalletBalance(res.data.balance);
      } catch (err) {
        setWalletError('Failed to fetch wallet balance');
      }
    };
    fetchWallet();
  }, [user.id]);

  const canBook = walletBalance !== null && walletBalance >= rideToShow.price;

  if (!user) {
    return (
      <div className="dashboard-card">
        <div className="alert alert-danger">You must be logged in to view this page.</div>
      </div>
    );
  }

  const formatPrice = (price) => `$${Number(price).toFixed(2)}`;

  // Helper to parse location string to {lat, lng}
  const parseLocation = (locationStr) => {
    // Expects: "street, city, state" (not used for API, just for display)
    // For API, pickup/dropoff coords should be available in ride or props
    // Here, we assume ride contains pickup/dropoff coords as ride.pickupCoords, ride.dropoffCoords
    return null;
  };

  const handleConfirm = async () => {
    console.log('Confirm button clicked', rideToShow);
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const pickupCoords = rideToShow.pickupCoords || rideToShow.pickup_coords || null;
      const dropoffCoords = rideToShow.dropoffCoords || rideToShow.dropoff_coords || null;
      console.log('pickupCoords:', pickupCoords, 'dropoffCoords:', dropoffCoords);
      if (!pickupCoords || !dropoffCoords) {
        setError('Pickup or dropoff coordinates are missing.');
        setLoading(false);
        return;
      }

      const payload = {
        customerId: user.id,
        pickupLocation: {
          latitude: pickupCoords.lat,
          longitude: pickupCoords.lng,
          address: pickupLocation
        },
        dropoffLocation: {
          latitude: dropoffCoords.lat,
          longitude: dropoffCoords.lng,
          address: dropoffLocation
        },
        dateTime: new Date().toISOString(),
        price: rideToShow.price,
        passenger_count: rideToShow.capacity || 1,
        distanceCovered: distance,
        name: rideToShow.name,
        id: rideToShow.id
      };

      const response = await fetch('http://localhost:3005/api/rides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to book ride');
      }

      const bookedRide = await response.json();
      
      // Update Redux state with the booked ride (use backend response only)
      dispatch(setSelectedRide(bookedRide));

      setSuccess('Ride booked successfully!');
      
      // Wait a moment to show success message before navigating
      setTimeout(() => {
        navigate('/trips');
      }, 1500);

    } catch (err) {
      setError(err.message || 'Failed to book ride');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ride-confirmation-container">
      <button className="back-button" onClick={onBack}>&larr; Back</button>
      <h2>Confirm Your Ride</h2>
      <div className="ride-details">
        <div className="ride-summary">
          <div className="ride-icon">{rideToShow?.icon || <FaCar size={24} />}</div>
          <div className="ride-info">
            <h3>{rideToShow?.name}</h3>
            <p>{rideToShow?.description}</p>
            <p>Capacity: {rideToShow?.capacity}</p>
          </div>
        </div>
        <div className="location-details">
          <div className="location-row">
            <FaMapMarkerAlt /> <span>Pickup: {pickupLocation}</span>
          </div>
          <div className="location-row">
            <FaMapMarkerAlt /> <span>Dropoff: {dropoffLocation}</span>
          </div>
          <div className="location-row">
            <span>Distance: {distance?.toFixed(2)} miles</span>
          </div>
        </div>
        <div className="billing-details">
          <h4>Bill</h4>
          <div className="bill-row">
            <span>Ride Price:</span>
            <span>{formatPrice(rideToShow?.price)}</span>
          </div>
        </div>
      </div>
      {error && <div className="alert alert-danger" style={{ marginBottom: 12 }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: 12 }}>{success}</div>}
      {walletError && <div className="alert alert-danger" style={{ marginBottom: 12 }}>{walletError}</div>}
      <div style={{ marginBottom: 12 }}>
        <strong>Wallet Balance:</strong> ${walletBalance?.toFixed(2) ?? '...'}
      </div>
      {!canBook && (
        <div style={{ color: 'red', marginBottom: 12 }}>
          Insufficient wallet balance to book this ride.
        </div>
      )}
      <button className="confirm-button" onClick={handleConfirm} disabled={!canBook || loading}>
        {loading ? 'Booking...' : 'Confirm Ride'}
      </button>
    </div>
  );
};

export default RideConfirmation; 