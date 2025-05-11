import React, { useState } from "react";
import axios from "axios";
import ProtectedRoute from "./ProtectedRoute";
import { validStates } from "../utils/states";

const AddDriver = () => {
  const [form, setForm] = useState({
    driverId: "",
    firstName: "",
    lastName: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
    phoneNumber: "",
    email: "",
    carDetails: {
      make: "",
      model: "",
      year: "",
      color: "",
      licensePlate: "",
    },
    rating: 0,
    reviews: [],
    introVideo: "",
    introImages: [],
    ridesHistory: [],
  });

  const [errors, setErrors] = useState({
    driverId: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    make: "",
    model: "",
    year: "",
    licensePlate: "",
  });

  // Formatting functions
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

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateName = (name) => {
    // Only letters, spaces, and hyphens allowed
    const nameRegex = /^[A-Za-z\s-]+$/;
    return nameRegex.test(name);
  };

  const validateYear = (year) => {
    const currentYear = new Date().getFullYear();
    const yearNum = parseInt(year);
    return !isNaN(yearNum) && yearNum >= 1980 && yearNum <= currentYear + 1;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      if (field === "zipCode") {
        const formattedValue = formatZipCode(value);
        setForm((prev) => ({
          ...prev,
          address: { ...prev.address, [field]: formattedValue },
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          address: { ...prev.address, [field]: value },
        }));
      }
    } else if (name.startsWith("carDetails.")) {
      const field = name.split(".")[1];

      if (field === "year") {
        // Only allow digits for year
        const digits = value.replace(/\D/g, "").slice(0, 4);
        setForm((prev) => ({
          ...prev,
          carDetails: { ...prev.carDetails, [field]: digits },
        }));

        setErrors((prev) => ({
          ...prev,
          year:
            digits && !validateYear(digits)
              ? "Year must be between 1980 and current year"
              : "",
        }));
      } else if (field === "make" || field === "model") {
        setForm((prev) => ({
          ...prev,
          carDetails: { ...prev.carDetails, [field]: value },
        }));

        setErrors((prev) => ({
          ...prev,
          [field]:
            value && !validateName(value)
              ? `${
                  field.charAt(0).toUpperCase() + field.slice(1)
                } can only contain letters, spaces, and hyphens`
              : "",
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          carDetails: { ...prev.carDetails, [field]: value },
        }));
      }
    } else if (name === "driverId") {
      const formattedValue = formatSSN(value);
      setForm({ ...form, [name]: formattedValue });

      const ssnPattern = /^\d{3}-\d{2}-\d{4}$/;
      setErrors((prev) => ({
        ...prev,
        driverId:
          value &&
          !ssnPattern.test(formattedValue) &&
          formattedValue.length === 11
            ? "Invalid SSN format. Use XXX-XX-XXXX"
            : "",
      }));
    } else if (name === "phoneNumber") {
      const formattedValue = formatPhoneNumber(value);
      setForm({ ...form, [name]: formattedValue });

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
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const urls = files.map((file) => URL.createObjectURL(file));
    setForm({ ...form, introImages: urls });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation checks
    const ssnPattern = /^\d{3}-\d{2}-\d{4}$/;
    const zipPattern = /^\d{5}(-\d{4})?$/;
    const phonePattern = /^\(\d{3}\) \d{3}-\d{4}$/;

    if (!ssnPattern.test(form.driverId)) {
      return alert("Invalid Driver ID format. Use XXX-XX-XXXX.");
    }

    if (!validateName(form.firstName) || !validateName(form.lastName)) {
      return alert("Names can only contain letters, spaces, and hyphens.");
    }

    if (!zipPattern.test(form.address.zipCode)) {
      return alert("Invalid ZIP code format.");
    }

    if (!phonePattern.test(form.phoneNumber)) {
      return alert("Invalid phone number format.");
    }

    if (!validateEmail(form.email)) {
      return alert("Invalid email format.");
    }

    if (
      !form.carDetails.make ||
      !form.carDetails.model ||
      !form.carDetails.year ||
      !form.carDetails.licensePlate
    ) {
      return alert("All car details are required.");
    }

    if (!validateYear(form.carDetails.year)) {
      return alert("Invalid car year.");
    }

    // Format the data for submission
    const formattedData = {
      _id: form.driverId,
      firstName: form.firstName,
      lastName: form.lastName,
      address: {
        street: form.address.street,
        city: form.address.city,
        state: form.address.state,
        zipCode: form.address.zipCode,
      },
      phoneNumber: form.phoneNumber.replace(/\D/g, ""), // Store only digits
      email: form.email,
      carDetails: form.carDetails,
      rating: form.rating,
      reviews: form.reviews,
      introVideo: form.introVideo,
      introImages: form.introImages,
      ridesHistory: form.ridesHistory,
    };

    try {
      await axios.post(
        process.env.REACT_APP_ADMIN_BACKEND_PORT_URL + "/api/admin/drivers",
        formattedData
      );
      alert("Driver added successfully!");
      // Reset form after successful submission
      setForm({
        driverId: "",
        firstName: "",
        lastName: "",
        address: {
          street: "",
          city: "",
          state: "",
          zipCode: "",
        },
        phoneNumber: "",
        email: "",
        carDetails: {
          make: "",
          model: "",
          year: "",
          color: "",
          licensePlate: "",
        },
        rating: 0,
        reviews: [],
        introVideo: "",
        introImages: [],
        ridesHistory: [],
      });
    } catch (error) {
      alert(
        "Error adding driver: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  return (
    <div className="container mt-4">
      <div className="card p-4">
        <h2 className="mb-4">Add New Driver</h2>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Driver ID (SSN Format)</label>
              <input
                className={`form-control ${
                  errors.driverId ? "is-invalid" : ""
                }`}
                name="driverId"
                value={form.driverId}
                onChange={handleChange}
                required
              />
              {errors.driverId && (
                <div className="invalid-feedback">{errors.driverId}</div>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">First Name</label>
              <input
                className={`form-control ${
                  errors.firstName ? "is-invalid" : ""
                }`}
                name="firstName"
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
                className={`form-control ${
                  errors.lastName ? "is-invalid" : ""
                }`}
                name="lastName"
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
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email}</div>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Phone Number</label>
              <input
                className={`form-control ${
                  errors.phoneNumber ? "is-invalid" : ""
                }`}
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                required
              />
              {errors.phoneNumber && (
                <div className="invalid-feedback">{errors.phoneNumber}</div>
              )}
            </div>

            <h4 className="col-12 mt-3 mb-3">Address Information</h4>

            <div className="col-md-12 mb-3">
              <label className="form-label">Street</label>
              <input
                className="form-control"
                name="address.street"
                value={form.address.street}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">City</label>
              <input
                className="form-control"
                name="address.city"
                value={form.address.city}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">State</label>
              <select
                className="form-select"
                name="address.state"
                value={form.address.state}
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
                className="form-control"
                name="address.zipCode"
                value={form.address.zipCode}
                onChange={handleChange}
                required
              />
            </div>

            <h4 className="col-12 mt-3 mb-3">Vehicle Information</h4>

            <div className="col-md-6 mb-3">
              <label className="form-label">Make</label>
              <input
                className={`form-control ${errors.make ? "is-invalid" : ""}`}
                name="carDetails.make"
                value={form.carDetails.make}
                onChange={handleChange}
                required
              />
              {errors.make && (
                <div className="invalid-feedback">{errors.make}</div>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Model</label>
              <input
                className={`form-control ${errors.model ? "is-invalid" : ""}`}
                name="carDetails.model"
                value={form.carDetails.model}
                onChange={handleChange}
                required
              />
              {errors.model && (
                <div className="invalid-feedback">{errors.model}</div>
              )}
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">Year</label>
              <input
                className={`form-control ${errors.year ? "is-invalid" : ""}`}
                name="carDetails.year"
                value={form.carDetails.year}
                onChange={handleChange}
                maxLength="4"
                required
              />
              {errors.year && (
                <div className="invalid-feedback">{errors.year}</div>
              )}
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">Color</label>
              <input
                className="form-control"
                name="carDetails.color"
                value={form.carDetails.color}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">License Plate</label>
              <input
                className="form-control"
                name="carDetails.licensePlate"
                value={form.carDetails.licensePlate}
                onChange={handleChange}
                required
              />
            </div>

            <h4 className="col-12 mt-3 mb-3">Additional Information</h4>

            <div className="col-md-12 mb-3">
              <label className="form-label">Intro Video URL</label>
              <input
                className="form-control"
                name="introVideo"
                value={form.introVideo}
                onChange={handleChange}
                placeholder="YouTube or other video URL"
              />
            </div>

            <div className="col-md-12 mb-3">
              <label className="form-label">Driver Photos</label>
              <input
                type="file"
                multiple
                accept="image/*"
                className="form-control"
                onChange={handleImageChange}
              />
              {form.introImages.length > 0 && (
                <div className="mt-2 d-flex flex-wrap gap-2">
                  {form.introImages.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Driver ${index + 1}`}
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <button type="submit" className="btn btn-primary mt-3">
            Add Driver
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddDriver;
