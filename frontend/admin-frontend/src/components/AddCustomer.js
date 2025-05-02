import React, { useState } from "react";
import axios from "axios";

const AddCustomer = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/customers", form);
      alert("Customer added successfully!");
    } catch {
      alert("Failed to add customer.");
    }
  };

  return (
    <div className="card p-4">
      <h3>Add New Customer</h3>
      <form onSubmit={handleSubmit}>
        <input
          className="form-control mb-2"
          name="name"
          placeholder="Name"
          onChange={handleChange}
        />
        <input
          className="form-control mb-2"
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />
        <input
          className="form-control mb-2"
          name="address"
          placeholder="Address"
          onChange={handleChange}
        />
        <input
          className="form-control mb-2"
          name="phone"
          placeholder="Phone"
          onChange={handleChange}
        />
        <button className="btn btn-primary">Add Customer</button>
      </form>
    </div>
  );
};

export default AddCustomer;
