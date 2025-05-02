import React from "react";

const DriverInfo = () => {
  const driver = { id: 1, name: "Alice", address: "123 Main St" };
  return (
    <div>
      <h2>Driver Information</h2>
      <p>
        <strong>ID:</strong> {driver.id}
      </p>
      <p>
        <strong>Name:</strong> {driver.name}
      </p>
      <p>
        <strong>Address:</strong> {driver.address}
      </p>
    </div>
  );
};

export default DriverInfo;
