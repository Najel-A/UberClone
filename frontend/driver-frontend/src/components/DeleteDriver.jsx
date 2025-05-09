import React, { useState } from "react";

const DeleteDriver = () => {
  const [id, setId] = useState("");

  const handleDelete = () => {
    console.log("Deleting driver with ID:", id);
    // DELETE request to backend here
  };

  return (
    <div>
      <h2>Delete Driver</h2>
      <input
        type="text"
        placeholder="Driver ID"
        className="form-control mb-3"
        onChange={(e) => setId(e.target.value)}
      />
      <button onClick={handleDelete} className="btn btn-danger">
        Delete
      </button>
    </div>
  );
};

export default DeleteDriver;
