import React, { useState } from "react";

const UpdateDriver = () => {
  const [form, setForm] = useState({ id: "", name: "", address: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = () => {
    console.log("Updating driver:", form);
    // PUT request to backend here
  };

  return (
    <div>
      <h2>Update Driver Info</h2>
      <input
        name="id"
        placeholder="Driver ID"
        className="form-control mb-2"
        onChange={handleChange}
      />
      <input
        name="name"
        placeholder="Name"
        className="form-control mb-2"
        onChange={handleChange}
      />
      <input
        name="address"
        placeholder="Address"
        className="form-control mb-2"
        onChange={handleChange}
      />
      <button onClick={handleUpdate} className="btn btn-warning">
        Update
      </button>
    </div>
  );
};

export default UpdateDriver;
