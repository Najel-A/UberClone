import React from "react";

const ListDrivers = () => {
  const drivers = [
    { id: 1, name: "Alice", address: "123 Main St" },
    { id: 2, name: "Bob", address: "456 Oak Ave" },
  ];

  return (
    <div>
      <h2>List of Drivers</h2>
      <ul className="list-group">
        {drivers.map((driver) => (
          <li key={driver.id} className="list-group-item">
            {driver.name} - {driver.address}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListDrivers;
