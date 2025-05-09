import React, { useState } from "react";
import axios from "../utils/axiosConfig";
import { validStates, isValidState } from "../utils/states";

export default function Signup() {
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const ssnPattern = /^\d{3}-\d{2}-\d{4}$/;
    const zipPattern = /^\d{5}(-\d{4})?$/;

    if (!ssnPattern.test(form.adminId)) {
      return alert("Invalid SSN format. Use XXX-XX-XXXX.");
    }

    if (!zipPattern.test(form.zipCode)) {
      return alert("Invalid ZIP code format.");
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
      phoneNumber: form.phoneNumber,
      email: form.email,
      password: form.password,
    };

    try {
      await axios.post("http://localhost:3002/api/admin/signup", formattedData);
      alert("Admin registered successfully!");
    } catch (error) {
      alert("Error during registration.");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Admin Registration</h2>
      <form onSubmit={handleSubmit}>
        {[
          { name: "adminId", label: "Admin ID (SSN Format)" },
          { name: "firstName", label: "First Name" },
          { name: "lastName", label: "Last Name" },
          { name: "address", label: "Address" },
          { name: "city", label: "City" },
          { name: "zipCode", label: "Zip Code" },
          { name: "phoneNumber", label: "Phone Number" },
          { name: "email", label: "Email" },
          { name: "password", label: "Password", type: "password" },
        ].map(({ name, label, type }) => (
          <div key={name} className="mb-3">
            <label className="form-label">{label}</label>
            <input
              type={type || "text"}
              name={name}
              className="form-control"
              value={form[name]}
              onChange={handleChange}
            />
          </div>
        ))}

        <div className="mb-3">
          <label className="form-label">State</label>
          <select
            name="state"
            className="form-select"
            value={form.state}
            onChange={handleChange}
          >
            <option value="">Select a state</option>
            {Object.entries(validStates).map(([abbr, name]) => (
              <option key={abbr} value={abbr}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn-primary">
          Sign Up
        </button>
      </form>
    </div>
  );
}
