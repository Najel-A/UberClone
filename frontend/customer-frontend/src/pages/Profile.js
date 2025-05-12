import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../slices/userSlice";
import axios from "axios";
import "../styles/dashboard.css";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCreditCard,
  FaTrash,
  FaWallet,
  FaCamera
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";


const Profile = () => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
    creditCardDetails: {
      cardNumber: "",
      expiryDate: "",
    },
  });
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicUploading, setProfilePicUploading] = useState(false);
  const [profilePicError, setProfilePicError] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchWalletBalance();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3000/api/customers");
      const customer = response.data.find((c) => c._id === user.id);
      if (!customer) {
        setError("Profile not found");
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
          zipCode: customer.address.zipCode,
        },
        creditCardDetails: {
          cardNumber: customer.creditCardDetails.cardNumber,
          expiryDate: customer.creditCardDetails.expiryDate,
        },
      });
    } catch (err) {
      setError("Failed to fetch profile data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3004/api/billing/getCustomerWallet/${user.id}`
      );
      setWalletBalance(response.data.balance);
    } catch (err) {
      console.error("Failed to fetch wallet balance:", err);
      setError("Failed to fetch wallet balance");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { _id, ...updateData } = formData;
      await axios.put(
        `http://localhost:3000/api/customers/${user.id}`,
        updateData
      );
      setProfile({ ...profile, ...formData });
      dispatch(setUser({ ...user, ...formData }));
      setIsEditing(false);
      setError("");
    } catch (err) {
      setError("Failed to update profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:3000/api/customers/${user.id}`);
      dispatch(setUser(null)); // Clear user from Redux store
      navigate("/login"); // Redirect to login page
    } catch (err) {
      setError("Failed to delete account");
      console.error(err);
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleAddMoney = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      setWalletLoading(true);
      const response = await axios.post(
        "http://localhost:3004/api/billing/addToCustomerWallet",
        {
          ssn: user.id,
          amount: parseFloat(amount),
        }
      );

      // Update wallet balance
      setWalletBalance(response.data.balance);
      setShowAddMoneyModal(false);
      setAmount("");
      setError("");
    } catch (err) {
      setError("Failed to add money to wallet");
      console.error(err);
    } finally {
      setWalletLoading(false);
    }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const handleProfilePicUpload = async (e) => {
    e.preventDefault();
    if (!profilePicFile) return;
    setProfilePicUploading(true);
    setProfilePicError('');
    try {
      const formData = new FormData();
      formData.append('profilePicture', profilePicFile);
      const res = await axios.post(`http://localhost:3000/api/customers/${user.id}/profile-picture`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile((prev) => ({ ...prev, profilePicture: res.data.profilePicture }));
      setProfilePicFile(null);
      setProfilePicPreview(null);
    } catch (err) {
      setProfilePicError('Failed to upload profile picture');
    } finally {
      setProfilePicUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="dashboard-card">
        <div className="alert alert-danger">
          You must be logged in to view this page.
        </div>
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
            <p>
              {profile.firstName} {profile.lastName}
            </p>
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
            <p>
              {profile.address.city}, {profile.address.state}{" "}
              {profile.address.zipCode}
            </p>
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
            <p>
              Card ending in {profile.creditCardDetails.cardNumber.slice(-4)}
            </p>
            <p>Expires: {profile.creditCardDetails.expiryDate}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWallet = () => (
    <div className="profile-section">
      <div className="section-header">
        <h4>Wallet</h4>
      </div>
      <div className="info-content">
        <div className="info-row">
          <FaWallet className="info-icon" />
          <div className="info-details">
            <label>Balance</label>
            <p>${walletBalance.toFixed(2)}</p>
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddMoneyModal(true)}
        >
          Add Money
        </button>
      </div>
    </div>
  );

  return (
    <div className="dashboard-card profile-card">
      <div className="card-header">
        <h3>Profile Information</h3>
        <div className="header-buttons">
          <button
            className="btn btn-primary"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
          <button
            className="btn btn-danger"
            onClick={() => setShowDeleteModal(true)}
          >
            <FaTrash /> Delete Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h4>Delete Account</h4>
            <p>
              Are you sure you want to delete your account? This action cannot
              be undone.
            </p>
            <div className="modal-buttons">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeleteAccount}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Money Modal */}
      {showAddMoneyModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h4>Add Money to Wallet</h4>
            <div className="form-group">
              <label>Amount ($)</label>
              <input
                type="number"
                className="form-control"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
                placeholder="Enter amount"
              />
            </div>
            <div className="modal-buttons">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowAddMoneyModal(false);
                  setAmount("");
                }}
                disabled={walletLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAddMoney}
                disabled={walletLoading}
              >
                {walletLoading ? "Adding..." : "Add Money"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Picture Section */}
      <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', marginBottom: 24 }}>
        <div style={{ position: 'relative', width: 120, height: 120 }}>
          <img
            src={profilePicPreview || (profile && profile.profilePicture ? `http://localhost:3000${profile.profilePicture}` : undefined) || "https://ui-avatars.com/api/?name=User&background=random"}
            alt="Profile"
            style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '2px solid #eee' }}
          />
          <label htmlFor="profile-pic-upload" style={{ position: 'absolute', bottom: 0, right: 0, background: '#fff', borderRadius: '50%', padding: 8, cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
            <FaCamera />
          </label>
          <input
            id="profile-pic-upload"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleProfilePicChange}
          />
        </div>
        {profilePicFile && (
          <form onSubmit={handleProfilePicUpload} style={{ marginTop: 12, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button type="submit" className="btn btn-primary" disabled={profilePicUploading}>
              {profilePicUploading ? 'Uploading...' : 'Upload Photo'}
            </button>
            {profilePicError && <div className="text-danger mt-2">{profilePicError}</div>}
          </form>
        )}
      </div>

      {!isEditing ? (
        <div className="profile-content">
          {renderPersonalInfo()}
          {renderAddress()}
          {renderPayment()}
          {renderWallet()}
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
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? <div className="loading-spinner" /> : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Profile;
