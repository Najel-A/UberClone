import React, { useState } from "react";
import axios from "axios";

const AddDriver = () => {
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    licenseNumber: "",
    introVideo: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/drivers", form);
      alert("Driver added successfully!");
    } catch (error) {
      alert("Error adding driver");
    }
  };

  return (
    <div className="card p-4">
      <h3>Add New Driver</h3>
      <form onSubmit={handleSubmit}>
        <input
          className="form-control mb-2"
          name="name"
          placeholder="Name"
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
        <input
          className="form-control mb-2"
          name="licenseNumber"
          placeholder="License Number"
          onChange={handleChange}
        />
        <input
          className="form-control mb-2"
          name="introVideo"
          placeholder="Intro Video URL"
          onChange={handleChange}
        />
        <button className="btn btn-primary">Add Driver</button>
      </form>
    </div>
  );
};

export default AddDriver;
