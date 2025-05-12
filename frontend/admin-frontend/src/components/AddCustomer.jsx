import React, { useState } from "react";
import axios from "axios";
import ProtectedRoute from "./ProtectedRoute";
import { validStates } from "../utils/states";

const AddCustomer = () => {
  const [form, setForm] = useState({
    customerId: "",
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
    password: "",
    creditCardDetails: {
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardholderName: "",
    },
    ridesHistory: [],
    rating: 0,
    reviews: [],
  });

  const [errors, setErrors] = useState({
    customerId: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
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

  const formatCreditCard = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");

    // Format as #### #### #### ####
    if (digits.length <= 4) return digits;
    if (digits.length <= 8) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    if (digits.length <= 12)
      return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(
      8,
      12
    )} ${digits.slice(12, 16)}`;
  };

  const formatExpiryDate = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");

    // Format as MM/YY
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
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
    } else if (name.startsWith("creditCardDetails.")) {
      const field = name.split(".")[1];

      if (field === "cardNumber") {
        const formattedValue = formatCreditCard(value);
        setForm((prev) => ({
          ...prev,
          creditCardDetails: {
            ...prev.creditCardDetails,
            [field]: formattedValue,
          },
        }));

        const digits = value.replace(/\D/g, "");
        setErrors((prev) => ({
          ...prev,
          cardNumber:
            digits.length > 0 && digits.length !== 16
              ? "Card number must be 16 digits"
              : "",
        }));
      } else if (field === "expiryDate") {
        const formattedValue = formatExpiryDate(value);
        setForm((prev) => ({
          ...prev,
          creditCardDetails: {
            ...prev.creditCardDetails,
            [field]: formattedValue,
          },
        }));

        const digits = value.replace(/\D/g, "");
        if (digits.length > 0) {
          const month = parseInt(digits.slice(0, 2));
          setErrors((prev) => ({
            ...prev,
            expiryDate: month < 1 || month > 12 ? "Invalid month" : "",
          }));
        } else {
          setErrors((prev) => ({ ...prev, expiryDate: "" }));
        }
      } else if (field === "cvv") {
        const digits = value.replace(/\D/g, "");
        setForm((prev) => ({
          ...prev,
          creditCardDetails: { ...prev.creditCardDetails, [field]: digits },
        }));

        setErrors((prev) => ({
          ...prev,
          cvv:
            digits.length > 0 && (digits.length < 3 || digits.length > 4)
              ? "CVV must be 3 or 4 digits"
              : "",
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          creditCardDetails: { ...prev.creditCardDetails, [field]: value },
        }));
      }
    } else if (name === "customerId") {
      const formattedValue = formatSSN(value);
      setForm({ ...form, [name]: formattedValue });

      const ssnPattern = /^\d{3}-\d{2}-\d{4}$/;
      setErrors((prev) => ({
        ...prev,
        customerId:
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
    } else if (name === "password") {
      setForm({ ...form, [name]: value });

      if (value.length < 6) {
        setErrors((prev) => ({
          ...prev,
          password: "Password must be at least 6 characters long.",
        }));
      } else {
        setErrors((prev) => ({ ...prev, password: "" }));
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation checks
    const ssnPattern = /^\d{3}-\d{2}-\d{4}$/;
    const zipPattern = /^\d{5}(-\d{4})?$/;
    const phonePattern = /^\(\d{3}\) \d{3}-\d{4}$/;

    if (!ssnPattern.test(form.customerId)) {
      return alert("Invalid SSN format. Use XXX-XX-XXXX.");
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

    if (!form.password || form.password.length < 6) {
      return alert("Password must be at least 6 characters long.");
    }

    const ccDigits = form.creditCardDetails.cardNumber.replace(/\D/g, "");
    if (ccDigits.length !== 16) {
      return alert("Credit card must be 16 digits.");
    }

    const expiryDigits = form.creditCardDetails.expiryDate.replace(/\D/g, "");
    if (expiryDigits.length !== 4) {
      return alert("Expiry date must be in MM/YY format.");
    }

    const cvvDigits = form.creditCardDetails.cvv;
    if (cvvDigits.length < 3 || cvvDigits.length > 4) {
      return alert("CVV must be 3 or 4 digits.");
    }

    // Format the data for submission
    const formattedData = {
      _id: form.customerId,
      firstName: form.firstName,
      lastName: form.lastName,
      address: {
        street: form.address.street,
        city: form.address.city,
        state: form.address.state,
        zipCode: form.address.zipCode,
      },
      phoneNumber: "+1" + form.phoneNumber.replace(/\D/g, ""), // Format as +1XXXXXXXXXX
      email: form.email,
      password: form.password,
      creditCardDetails: {
        cardNumber: form.creditCardDetails.cardNumber.replace(/\D/g, ""), // Store only digits
        expiryDate: form.creditCardDetails.expiryDate,
        cvv: form.creditCardDetails.cvv,
        cardholderName: form.creditCardDetails.cardholderName,
      },
      ridesHistory: [],
      rating: 0,
      reviews: [],
    };

    try {
      await axios.post(
        `${process.env.REACT_APP_CUSTOMER_SERVICE_URL}/api/customers`,
        formattedData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      alert("Customer added successfully!");
      // Reset form after successful submission
      setForm({
        customerId: "",
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
        password: "",
        creditCardDetails: {
          cardNumber: "",
          expiryDate: "",
          cvv: "",
          cardholderName: "",
        },
        ridesHistory: [],
        rating: 0,
        reviews: [],
      });
    } catch (error) {
      alert(
        "Error adding customer: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  return (
    <div className="container mt-4">
      <div className="card p-4">
        <h2 className="mb-4">Add New Customer</h2>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Customer ID (SSN Format)</label>
              <input
                className={`form-control ${
                  errors.customerId ? "is-invalid" : ""
                }`}
                name="customerId"
                value={form.customerId}
                onChange={handleChange}
                required
              />
              {errors.customerId && (
                <div className="invalid-feedback">{errors.customerId}</div>
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
              <label className="form-label">Address</label>
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
              <label className="form-label">Password</label>
              <input
                type="password"
                className={`form-control ${
                  errors.password ? "is-invalid" : ""
                }`}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength="6"
              />
              {errors.password && (
                <div className="invalid-feedback">{errors.password}</div>
              )}
            </div>

            <h4 className="mt-3 mb-3">Credit Card Details</h4>

            <div className="col-md-6 mb-3">
              <label className="form-label">Card Number</label>
              <input
                className={`form-control ${
                  errors.cardNumber ? "is-invalid" : ""
                }`}
                name="creditCardDetails.cardNumber"
                value={form.creditCardDetails.cardNumber}
                onChange={handleChange}
                required
              />
              {errors.cardNumber && (
                <div className="invalid-feedback">{errors.cardNumber}</div>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Cardholder Name</label>
              <input
                className="form-control"
                name="creditCardDetails.cardholderName"
                value={form.creditCardDetails.cardholderName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Expiry Date (MM/YY)</label>
              <input
                className={`form-control ${
                  errors.expiryDate ? "is-invalid" : ""
                }`}
                name="creditCardDetails.expiryDate"
                value={form.creditCardDetails.expiryDate}
                onChange={handleChange}
                maxLength="5"
                required
              />
              {errors.expiryDate && (
                <div className="invalid-feedback">{errors.expiryDate}</div>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">CVV</label>
              <input
                className={`form-control ${errors.cvv ? "is-invalid" : ""}`}
                name="creditCardDetails.cvv"
                value={form.creditCardDetails.cvv}
                onChange={handleChange}
                maxLength="4"
                required
              />
              {errors.cvv && (
                <div className="invalid-feedback">{errors.cvv}</div>
              )}
            </div>
          </div>

          <button type="submit" className="btn btn-primary mt-3">
            Add Customer
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCustomer;
