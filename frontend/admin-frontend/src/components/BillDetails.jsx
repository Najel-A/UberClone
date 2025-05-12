import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ProtectedRoute from "./ProtectedRoute";

const BillDetails = () => {
  const { id } = useParams();
  const [bill, setBill] = useState(null);

  useEffect(() => {
    axios
      .get(
        process.env.REACT_APP_ADMIN_BACKEND_PORT_URL +
          `/api/admin/billing/${id}`
      )
      .then((res) => setBill(res.data));
  }, [id]);

  if (!bill) return <p>Loading...</p>;

  return (
    <div className="card p-4">
      <h3>Bill Details</h3>
      <p>
        <strong>ID:</strong> {bill.id}
      </p>
      <p>
        <strong>Customer:</strong> {bill.customer}
      </p>
      <p>
        <strong>Driver:</strong> {bill.driver}
      </p>
      <p>
        <strong>Amount:</strong> ${bill.amount}
      </p>
      <p>
        <strong>Date:</strong> {bill.date}
      </p>
    </div>
  );
};

export default BillDetails;
