import React, { useState } from "react";

const CreateDriver = () => {
  const [driver, setDriver] = useState({ name: "", address: "" });

  const handleChange = (e) => {
    setDriver({ ...driver, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Creating driver:", driver);
    // POST request to backend here
  };

  return (
    <div>
      <h2>Create Driver</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            type="text"
            className="form-control"
            name="name"
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Address</label>
          <input
            type="text"
            className="form-control"
            name="address"
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
    </div>
  );
};

export default CreateDriver;
