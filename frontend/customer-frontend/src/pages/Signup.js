import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/auth.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    ssn: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
    creditCardDetails: {
      cardNumber: '',
      expiryDate: '',
    },
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    // Password validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Phone number validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phoneNumber.replace(/\D/g, ''))) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }

    // SSN validation
    const ssnRegex = /^\d{3}-\d{2}-\d{4}$/;
    if (!ssnRegex.test(formData.ssn)) {
      setError('Please enter a valid SSN in format XXX-XX-XXXX');
      return false;
    }

    // Credit card expiry date validation
    const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!expiryRegex.test(formData.creditCardDetails.expiryDate)) {
      setError('Please enter a valid expiry date in MM/YY format');
      return false;
    }

    return true;
  };

  const handleChange = (e) => {
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
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Remove confirmPassword before sending to backend
      const { confirmPassword, ...signupData } = formData;
      // Use SSN as _id
      signupData._id = signupData.ssn;
      delete signupData.ssn;
      await signup(signupData);
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create Your Account</h2>
        <p className="auth-subtitle">Please fill in your details to create an account</p>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="row">
            <div className="col">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="col">
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="row">
            <div className="col">
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="col">
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  className="form-control"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col">
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="1234567890"
                  required
                />
              </div>
            </div>
            <div className="col">
              <div className="form-group">
                <label>Social Security Number</label>
                <input
                  type="text"
                  className="form-control"
                  name="ssn"
                  value={formData.ssn}
                  onChange={handleChange}
                  placeholder="XXX-XX-XXXX"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Street Address</label>
            <input
              type="text"
              className="form-control"
              name="address.street"
              value={formData.address.street}
              onChange={handleChange}
              required
            />
          </div>

          <div className="row">
            <div className="col">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  className="form-control"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="col">
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  className="form-control form-control-short"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  placeholder="XX"
                  maxLength={2}
                  required
                />
              </div>
            </div>
            <div className="col">
              <div className="form-group">
                <label>ZIP Code</label>
                <input
                  type="text"
                  className="form-control form-control-medium"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  placeholder="12345"
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
                  className="form-control"
                  name="creditCardDetails.cardNumber"
                  value={formData.creditCardDetails.cardNumber}
                  onChange={handleChange}
                  placeholder="1234567890123456"
                  required
                />
              </div>
            </div>
            <div className="col">
              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="text"
                  className="form-control form-control-medium"
                  name="creditCardDetails.expiryDate"
                  value={formData.creditCardDetails.expiryDate}
                  onChange={handleChange}
                  placeholder="MM/YY"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>

          <Link to="/login" className="auth-link">
            Already have an account? Sign In
          </Link>
        </form>
      </div>
    </div>
  );
};

export default Signup; 