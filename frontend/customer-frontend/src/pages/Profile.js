import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../slices/userSlice';
import axios from 'axios';
import '../styles/dashboard.css';
import { FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCreditCard } from 'react-icons/fa';

const Profile = () => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    creditCardDetails: {
      cardNumber: '',
      expiryDate: ''
    }
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/customers');
      const customer = response.data.find(c => c._id === user.id);
      if (!customer) {
        setError('Profile not found');
        setProfile(null);
        return;
      }
      setProfile(customer);
      setFormData({
        firstName: customer.firstName,
        lastName: customer.lastName,
        phoneNumber: customer.phoneNumber,
        email: customer.email,
        address: {
          street: customer.address.street,
          city: customer.address.city,
          state: customer.address.state,
          zipCode: customer.address.zipCode
        },
        creditCardDetails: {
          cardNumber: customer.creditCardDetails.cardNumber,
          expiryDate: customer.creditCardDetails.expiryDate
        }
      });
    } catch (err) {
      setError('Failed to fetch profile data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { _id, ...updateData } = formData;
      await axios.put(`http://localhost:3000/api/customers/${user.id}`, updateData);
      setProfile({ ...profile, ...formData });
      dispatch(setUser({ ...user, ...formData }));
      setIsEditing(false);
      setError('');
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="dashboard-card">
        <div className="alert alert-danger">You must be logged in to view this page.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard-card">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-card">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  const renderPersonalInfo = () => (
    <div className="profile-section">
      <div className="section-header">
        <h4>Personal Information</h4>
      </div>
      <div className="info-content">
        <div className="info-row">
          <FaUser className="info-icon" />
          <div className="info-details">
            <label>Name</label>
            <p>{profile.firstName} {profile.lastName}</p>
          </div>
        </div>
        <div className="info-row">
          <FaEnvelope className="info-icon" />
          <div className="info-details">
            <label>Email</label>
            <p>{profile.email}</p>
          </div>
        </div>
        <div className="info-row">
          <FaPhone className="info-icon" />
          <div className="info-details">
            <label>Phone</label>
            <p>{profile.phoneNumber}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAddress = () => (
    <div className="profile-section">
      <div className="section-header">
        <h4>Address Information</h4>
      </div>
      <div className="info-content">
        <div className="info-row">
          <FaMapMarkerAlt className="info-icon" />
          <div className="info-details">
            <label>Address</label>
            <p>{profile.address.street}</p>
            <p>{profile.address.city}, {profile.address.state} {profile.address.zipCode}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPayment = () => (
    <div className="profile-section">
      <div className="section-header">
        <h4>Payment Information</h4>
      </div>
      <div className="info-content">
        <div className="info-row">
          <FaCreditCard className="info-icon" />
          <div className="info-details">
            <label>Card Details</label>
            <p>Card ending in {profile.creditCardDetails.cardNumber.slice(-4)}</p>
            <p>Expires: {profile.creditCardDetails.expiryDate}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-card profile-card">
      <div className="card-header">
        <h3>Profile Information</h3>
        <button
          className="btn btn-primary"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {!isEditing ? (
        <div className="profile-content">
          {renderPersonalInfo()}
          {renderAddress()}
          {renderPayment()}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="row">
            <div className="col">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  className="form-control"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="col">
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  className="form-control"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              className="form-control"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Street Address</label>
            <input
              type="text"
              name="address.street"
              className="form-control"
              value={formData.address.street}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="row">
            <div className="col">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="address.city"
                  className="form-control"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="col">
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  name="address.state"
                  className="form-control"
                  value={formData.address.state}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="col">
              <div className="form-group">
                <label>ZIP Code</label>
                <input
                  type="text"
                  name="address.zipCode"
                  className="form-control"
                  value={formData.address.zipCode}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col">
              <div className="form-group">
                <label>Card Number</label>
                <input
                  type="text"
                  name="creditCardDetails.cardNumber"
                  className="form-control"
                  value={formData.creditCardDetails.cardNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="col">
              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="text"
                  name="creditCardDetails.expiryDate"
                  className="form-control"
                  value={formData.creditCardDetails.expiryDate}
                  onChange={handleInputChange}
                  placeholder="MM/YY"
                  required
                />
              </div>
            </div>
          </div>

          <div className="button-group">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <div className="loading-spinner" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Profile; 