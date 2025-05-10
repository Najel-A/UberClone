import React, { useEffect, useState } from "react";
import axios from "axios";
import ProtectedRoute from "./ProtectedRoute";

const ReviewAccounts = () => {
  const [drivers, setDrivers] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    axios
      .get(process.env.REACT_APP_ADMIN_BACKEND_PORT_URL + "/api/drivers")
      .then((res) => setDrivers(res.data));
    axios
      .get(process.env.REACT_APP_ADMIN_BACKEND_PORT_URL + "/api/customers")
      .then((res) => setCustomers(res.data));
  }, []);

  return (
    <div>
      <h3>Drivers</h3>
      <ul className="list-group mb-4">
        {drivers.map((d) => (
          <li key={d.id} className="list-group-item">
            {d.name} – {d.address} – {d.phone}
          </li>
        ))}
      </ul>

      <h3>Customers</h3>
      <ul className="list-group">
        {customers.map((c) => (
          <li key={c.id} className="list-group-item">
            {c.name} – {c.email} – {c.phone}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReviewAccounts;
