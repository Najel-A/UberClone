import React, { useState } from "react";
import axios from "../utils/axiosConfig";
import { validStates, isValidState } from "../utils/states";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    adminId: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phoneNumber: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    phoneNumber: "",
    email: "",
  });

  const formatSSN = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");

    // Format as ###-##-####
    if (digits.length <= 3) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`;
  };

  const formatZipCode = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");

    // Format as ##### or #####-####
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5, 9)}`;
  };

  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");

    // Format as (###) ###-####
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(
      6,
      10
    )}`;
  };

  const validateEmail = (email) => {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateName = (name) => {
    // Only letters, spaces, and hyphens allowed
    const nameRegex = /^[A-Za-z\s-]+$/;
    return nameRegex.test(name);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "adminId") {
      // Format SSN as user types
      const formattedValue = formatSSN(value);
      setForm({ ...form, [name]: formattedValue });

      const ssnPattern = /^\d{3}-\d{2}-\d{4}$/;
      setErrors((prev) => ({
        ...prev,
        adminId:
          value &&
          !ssnPattern.test(formattedValue) &&
          formattedValue.length === 11
            ? "Invalid SSN format. Use XXX-XX-XXXX"
            : "",
      }));
    } else if (name === "zipCode") {
      // Format ZIP code as user types
      const formattedValue = formatZipCode(value);
      setForm({ ...form, [name]: formattedValue });
    } else if (name === "phoneNumber") {
      // Format phone number as user types
      const formattedValue = formatPhoneNumber(value);
      setForm({ ...form, [name]: formattedValue });

      // Validate phone number length
      const digits = value.replace(/\D/g, "");
      setErrors((prev) => ({
        ...prev,
        phoneNumber:
          digits.length > 0 && digits.length !== 10
            ? "Phone number must be 10 digits"
            : "",
      }));
    } else if (name === "email") {
      setForm({ ...form, [name]: value });

      // Validate email format
      setErrors((prev) => ({
        ...prev,
        email:
          value && !validateEmail(value)
            ? "Please enter a valid email address"
            : "",
      }));
    } else if (name === "firstName" || name === "lastName") {
      setForm({ ...form, [name]: value });
      setErrors((prev) => ({
        ...prev,
        [name]:
          value && !validateName(value)
            ? "Name can only contain letters, spaces, and hyphens"
            : "",
      }));
    } else if (name === "address" || name === "city") {
      setForm({ ...form, [name]: value });
      setErrors((prev) => ({
        ...prev,
        [name]:
          value.trim() === ""
            ? `${name.charAt(0).toUpperCase() + name.slice(1)} is required`
            : "",
      }));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const ssnPattern = /^\d{3}-\d{2}-\d{4}$/;
    const zipPattern = /^\d{5}(-\d{4})?$/;
    const phonePattern = /^\(\d{3}\) \d{3}-\d{4}$/;

    if (!ssnPattern.test(form.adminId)) {
      return alert("Invalid SSN format. Use XXX-XX-XXXX.");
    }

    if (!zipPattern.test(form.zipCode)) {
      return alert("Invalid ZIP code format.");
    }

    if (!phonePattern.test(form.phoneNumber)) {
      return alert("Invalid phone number format.");
    }

    if (!validateEmail(form.email)) {
      return alert("Invalid email format.");
    }

    if (!validateName(form.firstName) || !validateName(form.lastName)) {
      return alert("Names can only contain letters, spaces, and hyphens.");
    }

    if (!form.address.trim() || !form.city.trim()) {
      return alert("Address and city are required.");
    }

    if (!isValidState(form.state)) {
      return alert("Invalid state. Please select a valid U.S. state.");
    }

    // Format the form data to match the desired request structure
    const formattedData = {
      _id: form.adminId,
      firstName: form.firstName,
      lastName: form.lastName,
      address: {
        street: form.address,
        city: form.city,
        state: form.state,
        zipCode: form.zipCode,
      },
      phoneNumber: form.phoneNumber.replace(/\D/g, ""), // Store only digits
      email: form.email,
      password: form.password,
    };

    try {
      await axios.post(
        process.env.REACT_APP_ADMIN_BACKEND_PORT_URL + "/api/admin/signup",
        formattedData
      );
      alert("Admin registered successfully!");
      navigate("/login"); // Redirect to login page after successful signup
    } catch (error) {
      alert(
        "Error during registration: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  return (
    <div className="container mt-4">
      <div className="card p-4">
        <h2 className="mb-4">Admin Registration</h2>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Admin ID (SSN Format)</label>
              <input
                type="text"
                name="adminId"
                className={`form-control ${errors.adminId ? "is-invalid" : ""}`}
                value={form.adminId}
                onChange={handleChange}
                required
              />
              {errors.adminId && (
                <div className="invalid-feedback">{errors.adminId}</div>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">First Name</label>
              <input
                type="text"
                name="firstName"
                className={`form-control ${
                  errors.firstName ? "is-invalid" : ""
                }`}
                value={form.firstName}
                onChange={handleChange}
                required
              />
              {errors.firstName && (
                <div className="invalid-feedback">{errors.firstName}</div>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                name="lastName"
                className={`form-control ${
                  errors.lastName ? "is-invalid" : ""
                }`}
                value={form.lastName}
                onChange={handleChange}
                required
              />
              {errors.lastName && (
                <div className="invalid-feedback">{errors.lastName}</div>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                value={form.email}
                onChange={handleChange}
                required
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email}</div>
              )}
            </div>

            <h4 className="col-12 mt-3 mb-3">Address Information</h4>

            <div className="col-md-12 mb-3">
              <label className="form-label">Address</label>
              <input
                type="text"
                name="address"
                className={`form-control ${errors.address ? "is-invalid" : ""}`}
                value={form.address}
                onChange={handleChange}
                required
              />
              {errors.address && (
                <div className="invalid-feedback">{errors.address}</div>
              )}
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">City</label>
              <input
                type="text"
                name="city"
                className={`form-control ${errors.city ? "is-invalid" : ""}`}
                value={form.city}
                onChange={handleChange}
                required
              />
              {errors.city && (
                <div className="invalid-feedback">{errors.city}</div>
              )}
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">State</label>
              <select
                name="state"
                className="form-select"
                value={form.state}
                onChange={handleChange}
                required
              >
                <option value="">Select a state</option>
                {Object.entries(validStates).map(([abbr, name]) => (
                  <option key={abbr} value={abbr}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">Zip Code</label>
              <input
                type="text"
                name="zipCode"
                className="form-control"
                value={form.zipCode}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                className={`form-control ${
                  errors.phoneNumber ? "is-invalid" : ""
                }`}
                value={form.phoneNumber}
                onChange={handleChange}
                required
              />
              {errors.phoneNumber && (
                <div className="invalid-feedback">{errors.phoneNumber}</div>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary mt-3">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
