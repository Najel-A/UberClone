import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import driverService from "../services/api";
import { Table, Button, Container, Spinner, Alert } from "react-bootstrap";
import axios from "axios";

const DriverRideHistory = () => {
  const { currentDriver } = useAuth();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRides = async () => {
      if (!currentDriver || !currentDriver._id) return;
      setLoading(true);
      setError("");
      try {
        const res = await driverService.getDriverRides(currentDriver._id);
        console.log("Initial rides data:", res.data);

        // For each ride, fetch customer name
        const ridesWithCustomerNames = await Promise.all(
          res.data.map(async (ride) => {
            console.log("Processing ride:", ride);
            if (ride.customerId) {
              try {
                console.log("Fetching customer data for ID:", ride.customerId);
                const customerRes = await axios.get(
                  `${process.env.REACT_APP_CUSTOMER_SERVICE_URL}/api/customers/${ride.customerId}`
                );
                console.log("Customer data received:", customerRes.data);
                const customerName = `${customerRes.data.firstName || ""} ${
                  customerRes.data.lastName || ""
                }`.trim();
                console.log("Customer name:", customerName);
                return { ...ride, customerName: customerName || "N/A" };
              } catch (e) {
                console.error("Error fetching customer data:", e);
                return { ...ride, customerName: "N/A" };
              }
            }
            return { ...ride, customerName: "N/A" };
          })
        );
        console.log(
          "Final rides data with customer names:",
          ridesWithCustomerNames
        );
        setRides(ridesWithCustomerNames);
      } catch (err) {
        console.error("Error fetching rides:", err);
        setError("Failed to fetch ride history");
      } finally {
        setLoading(false);
      }
    };
    fetchRides();
  }, [currentDriver]);

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">My Ride History</h2>
      <Button
        variant="secondary"
        className="mb-3"
        onClick={() => navigate("/dashboard")}
      >
        Back to Dashboard
      </Button>
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : rides.length === 0 ? (
        <Alert variant="info">No rides found.</Alert>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Date</th>
                <th>Pickup</th>
                <th>Dropoff</th>
                <th>Price</th>
                <th>Status</th>
                <th>Customer</th>
              </tr>
            </thead>
            <tbody>
              {rides
                .slice()
                .reverse()
                .map((ride) => (
                  <tr key={ride._id}>
                    <td>{new Date(ride.dateTime).toLocaleString()}</td>
                    <td>{ride.pickupLocation?.address || "N/A"}</td>
                    <td>{ride.dropoffLocation?.address || "N/A"}</td>
                    <td>${ride.price?.toFixed(2) || "N/A"}</td>
                    <td>{ride.status}</td>
                    <td>{ride.customerName || "N/A"}</td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
};

export default DriverRideHistory;
