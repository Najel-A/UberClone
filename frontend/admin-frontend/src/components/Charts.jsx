import React, { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Form, Button, Row, Col, Alert } from "react-bootstrap";
import ProtectedRoute from "./ProtectedRoute";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Charts = () => {
  const [areaData, setAreaData] = useState([]);
  const [driverData, setDriverData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [pickupLat, setPickupLat] = useState("");
  const [pickupLng, setPickupLng] = useState("");
  const [dropoffLat, setDropoffLat] = useState("");
  const [dropoffLng, setDropoffLng] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetchDrivers();
    fetchCustomers();
    fetchData();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await axios.get("/api/admin/drivers");
      setDrivers(response.data);
    } catch (err) {
      console.error("Error fetching drivers:", err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get("/api/admin/customers");
      setCustomers(response.data);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_RIDE_SERVICE_URL}/api/rides/completed/all`
      );

      let rides = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data.rides)
        ? response.data.rides
        : [];

      // Apply filters
      if (selectedDriverId) {
        rides = rides.filter((ride) => ride.driverId === selectedDriverId);
      }
      if (selectedCustomerId) {
        rides = rides.filter((ride) => ride.customerId === selectedCustomerId);
      }
      if (pickupLat && pickupLng) {
        rides = rides.filter((ride) => {
          if (!ride.pickupLocation) return false;
          return (
            calculateDistance(
              parseFloat(pickupLat),
              parseFloat(pickupLng),
              ride.pickupLocation.latitude,
              ride.pickupLocation.longitude
            ) <= 10
          );
        });
      }
      if (dropoffLat && dropoffLng) {
        rides = rides.filter((ride) => {
          if (!ride.dropoffLocation) return false;
          return (
            calculateDistance(
              parseFloat(dropoffLat),
              parseFloat(dropoffLng),
              ride.dropoffLocation.latitude,
              ride.dropoffLocation.longitude
            ) <= 10
          );
        });
      }

      // Process data for different charts
      processAreaData(rides);
      processDriverData(rides);
      processCustomerData(rides);

      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch data");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Haversine formula to calculate distance between two points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3958.8; // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const processAreaData = (rides) => {
    const areas = {};
    rides.forEach((ride) => {
      if (ride.pickupLocation) {
        const area = `${ride.pickupLocation.latitude.toFixed(
          2
        )},${ride.pickupLocation.longitude.toFixed(2)}`;
        areas[area] = (areas[area] || 0) + 1;
      }
    });

    const areaStats = Object.entries(areas)
      .map(([area, count]) => ({
        area: `Area ${area}`,
        rides: count,
      }))
      .sort((a, b) => b.rides - a.rides)
      .slice(0, 10);

    setAreaData(areaStats);
  };

  const processDriverData = (rides) => {
    const drivers = {};
    rides.forEach((ride) => {
      if (ride.driverId) {
        drivers[ride.driverId] = (drivers[ride.driverId] || 0) + 1;
      }
    });

    const driverStats = Object.entries(drivers)
      .map(([driverId, count]) => ({
        driverId,
        rides: count,
      }))
      .sort((a, b) => b.rides - a.rides)
      .slice(0, 10);

    setDriverData(driverStats);
  };

  const processCustomerData = (rides) => {
    const customers = {};
    rides.forEach((ride) => {
      if (ride.customerId) {
        customers[ride.customerId] = (customers[ride.customerId] || 0) + 1;
      }
    });

    const customerStats = Object.entries(customers)
      .map(([customerId, count]) => ({
        customerId,
        rides: count,
      }))
      .sort((a, b) => b.rides - a.rides)
      .slice(0, 10);

    setCustomerData(customerStats);
  };

  const areaChartData = {
    labels: areaData.map((d) => d.area),
    datasets: [
      {
        label: "Rides Per Area",
        data: areaData.map((d) => d.rides),
        backgroundColor: "rgba(75,192,192,0.6)",
        borderColor: "rgba(75,192,192,1)",
        borderWidth: 1,
      },
    ],
  };

  const driverChartData = {
    labels: driverData.map((d) => `Driver ${d.driverId}`),
    datasets: [
      {
        label: "Rides Per Driver",
        data: driverData.map((d) => d.rides),
        backgroundColor: "rgba(153,102,255,0.6)",
        borderColor: "rgba(153,102,255,1)",
        borderWidth: 1,
      },
    ],
  };

  const customerChartData = {
    labels: customerData.map((d) => `Customer ${d.customerId}`),
    datasets: [
      {
        label: "Rides Per Customer",
        data: customerData.map((d) => d.rides),
        backgroundColor: "rgba(255,159,64,0.6)",
        borderColor: "rgba(255,159,64,1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Ride Distribution",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Rides",
        },
      },
    },
  };

  if (loading) return <div className="alert alert-info">Loading charts...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container-fluid">
      <div className="card p-4 mb-4">
        <h3>Chart Filters</h3>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Pickup Location (10-mile radius)</Form.Label>
              <Row>
                <Col>
                  <Form.Control
                    type="number"
                    placeholder="Pickup Latitude"
                    value={pickupLat}
                    onChange={(e) => setPickupLat(e.target.value)}
                  />
                </Col>
                <Col>
                  <Form.Control
                    type="number"
                    placeholder="Pickup Longitude"
                    value={pickupLng}
                    onChange={(e) => setPickupLng(e.target.value)}
                  />
                </Col>
              </Row>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Dropoff Location (10-mile radius)</Form.Label>
              <Row>
                <Col>
                  <Form.Control
                    type="number"
                    placeholder="Dropoff Latitude"
                    value={dropoffLat}
                    onChange={(e) => setDropoffLat(e.target.value)}
                  />
                </Col>
                <Col>
                  <Form.Control
                    type="number"
                    placeholder="Dropoff Longitude"
                    value={dropoffLng}
                    onChange={(e) => setDropoffLng(e.target.value)}
                  />
                </Col>
              </Row>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Driver</Form.Label>
              <Form.Select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
              >
                <option value="">All Drivers</option>
                {drivers.map((driver) => (
                  <option key={driver._id} value={driver._id}>
                    {driver.email}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Customer</Form.Label>
              <Form.Select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                <option value="">All Customers</option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.email}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Button variant="primary" onClick={fetchData}>
          Apply Filters
        </Button>
      </div>

      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card p-4">
            <h3>Rides Per Area</h3>
            <Bar data={areaChartData} options={chartOptions} />
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card p-4">
            <h3>Rides Per Driver</h3>
            <Bar data={driverChartData} options={chartOptions} />
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card p-4">
            <h3>Rides Per Customer</h3>
            <Bar data={customerChartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Charts;
