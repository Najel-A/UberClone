import React, { useEffect, useState } from "react";
import axios from "axios";
import ProtectedRoute from "./ProtectedRoute";
import { Alert, Button, Table, Form, Row, Col } from "react-bootstrap";

const Statistics = () => {
  const [rides, setRides] = useState([]);
  const [filteredRides, setFilteredRides] = useState([]);
  const [driverId, setDriverId] = useState("");
  const [pickupLat, setPickupLat] = useState("");
  const [pickupLng, setPickupLng] = useState("");
  const [dropoffLat, setDropoffLat] = useState("");
  const [dropoffLng, setDropoffLng] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [locationStats, setLocationStats] = useState({
    pickupRadiusCount: 0,
    dropoffRadiusCount: 0,
    pickup: null,
    dropoff: null,
  });
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalRides, setTotalRides] = useState(0);
  const [revenuePerDay, setRevenuePerDay] = useState({});

  useEffect(() => {
    // Fetch list of drivers
    axios.get("/api/admin/drivers").then((res) => setDrivers(res.data));
    // Fetch all rides on component mount
    fetchRides();
  }, []);

  // Update filtered rides whenever location parameters change
  useEffect(() => {
    filterRides();
  }, [pickupLat, pickupLng, dropoffLat, dropoffLng, driverId]);

  const fetchRides = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call ride service directly
      const response = await axios.get(
        `${process.env.REACT_APP_RIDE_SERVICE_URL}/api/rides/completed/all`
      );

      console.log("Response from ride service:", response.data);

      // Ensure we have an array of rides
      const completedRides = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data.rides)
        ? response.data.rides
        : [];

      console.log("Processed rides:", completedRides);

      setRides(completedRides);
      setFilteredRides(completedRides);

      // Calculate totals
      const revenue = completedRides.reduce(
        (sum, ride) => sum + (ride.price || 0),
        0
      );
      const rides = completedRides.length;

      // Calculate revenue per day
      const dailyRevenue = completedRides.reduce((acc, ride) => {
        const date = new Date(ride.dateTime).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { day: ride.dateTime, totalRevenue: 0 };
        }
        acc[date].totalRevenue += ride.price || 0;
        return acc;
      }, {});

      setTotalRevenue(revenue);
      setTotalRides(rides);
      setRevenuePerDay(dailyRevenue);

      // Calculate location stats if coordinates are provided
      if (pickupLat && pickupLng) {
        const pickupStats = calculateLocationStats(
          completedRides,
          pickupLat,
          pickupLng,
          "pickup"
        );
        setLocationStats((prev) => ({ ...prev, pickup: pickupStats }));
      }

      if (dropoffLat && dropoffLng) {
        const dropoffStats = calculateLocationStats(
          completedRides,
          dropoffLat,
          dropoffLng,
          "dropoff"
        );
        setLocationStats((prev) => ({ ...prev, dropoff: dropoffStats }));
      }

      setError("");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch rides";
      setError(errorMessage);
      console.error("Error fetching rides:", err);
      console.error("Error details:", {
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers,
      });
    } finally {
      setLoading(false);
    }
  };

  const filterRides = () => {
    let filtered = [...rides];

    // Filter by pickup location if coordinates are provided
    if (pickupLat && pickupLng) {
      filtered = filtered.filter((ride) => {
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

    // Filter by dropoff location if coordinates are provided
    if (dropoffLat && dropoffLng) {
      filtered = filtered.filter((ride) => {
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

    setFilteredRides(filtered);

    // Update location statistics
    const pickupRadiusCount = rides.filter((ride) => {
      if (!ride.pickupLocation || !pickupLat || !pickupLng) return false;
      return (
        calculateDistance(
          parseFloat(pickupLat),
          parseFloat(pickupLng),
          ride.pickupLocation.latitude,
          ride.pickupLocation.longitude
        ) <= 10
      );
    }).length;

    const dropoffRadiusCount = rides.filter((ride) => {
      if (!ride.dropoffLocation || !dropoffLat || !dropoffLng) return false;
      return (
        calculateDistance(
          parseFloat(dropoffLat),
          parseFloat(dropoffLng),
          ride.dropoffLocation.latitude,
          ride.dropoffLocation.longitude
        ) <= 10
      );
    }).length;

    setLocationStats({
      pickupRadiusCount,
      dropoffRadiusCount,
      pickup:
        pickupLat && pickupLng
          ? calculateLocationStats(rides, pickupLat, pickupLng, "pickup")
          : null,
      dropoff:
        dropoffLat && dropoffLng
          ? calculateLocationStats(rides, dropoffLat, dropoffLng, "dropoff")
          : null,
    });
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

  const toRad = (value) => {
    return (value * Math.PI) / 180;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const fetchBills = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get completed rides from admin service
      const response = await axios.get("/api/admin/rides/completed");
      const completedRides = response.data.rides;

      // Calculate total revenue and rides
      const totalRevenue = completedRides.reduce(
        (sum, ride) => sum + (ride.price || 0),
        0
      );
      const totalRides = completedRides.length;

      // Group rides by date for revenue per day
      const revenuePerDay = completedRides.reduce((acc, ride) => {
        const date = new Date(ride.dateTime).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { revenue: 0, rides: 0 };
        }
        acc[date].revenue += ride.price || 0;
        acc[date].rides += 1;
        return acc;
      }, {});

      setBills(completedRides);
      setFilteredBills(completedRides);
      setTotalRevenue(totalRevenue);
      setTotalRides(totalRides);
      setRevenuePerDay(revenuePerDay);

      // Calculate location stats if coordinates are provided
      if (pickupLat && pickupLng) {
        const pickupStats = calculateLocationStats(
          completedRides,
          pickupLat,
          pickupLng,
          "pickup"
        );
        setLocationStats((prev) => ({ ...prev, pickup: pickupStats }));
      }

      if (dropoffLat && dropoffLng) {
        const dropoffStats = calculateLocationStats(
          completedRides,
          dropoffLat,
          dropoffLng,
          "dropoff"
        );
        setLocationStats((prev) => ({ ...prev, dropoff: dropoffStats }));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch rides");
      console.error("Error fetching rides:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate location statistics
  const calculateLocationStats = (rides, lat, lng, type) => {
    const locationKey =
      type === "pickup" ? "pickupLocation" : "dropoffLocation";
    const ridesInRadius = rides.filter((ride) => {
      const rideLat = ride[locationKey].latitude;
      const rideLng = ride[locationKey].longitude;
      const distance = calculateDistance(lat, lng, rideLat, rideLng);
      return distance <= 10; // 10 miles radius
    });

    return {
      count: ridesInRadius.length,
      totalRevenue: ridesInRadius.reduce(
        (sum, ride) => sum + (ride.price || 0),
        0
      ),
    };
  };

  return (
    <div className="card p-4">
      <h3>Ride Statistics</h3>

      <div className="mb-4">
        <label className="form-label">Select Driver:</label>
        <select
          className="form-select"
          value={driverId}
          onChange={(e) => setDriverId(e.target.value)}
        >
          <option value="">Select a driver</option>
          {drivers.map((driver) => (
            <option key={driver._id} value={driver._id}>
              {driver.email}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <h5>Pickup Location Search (10-mile radius)</h5>
        <div className="row">
          <div className="col">
            <input
              type="number"
              className="form-control"
              placeholder="Pickup Latitude"
              value={pickupLat}
              onChange={(e) => setPickupLat(e.target.value)}
            />
          </div>
          <div className="col">
            <input
              type="number"
              className="form-control"
              placeholder="Pickup Longitude"
              value={pickupLng}
              onChange={(e) => setPickupLng(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h5>Dropoff Location Search (10-mile radius)</h5>
        <div className="row">
          <div className="col">
            <input
              type="number"
              className="form-control"
              placeholder="Dropoff Latitude"
              value={dropoffLat}
              onChange={(e) => setDropoffLat(e.target.value)}
            />
          </div>
          <div className="col">
            <input
              type="number"
              className="form-control"
              placeholder="Dropoff Longitude"
              value={dropoffLng}
              onChange={(e) => setDropoffLng(e.target.value)}
            />
          </div>
        </div>
      </div>

      <button className="btn btn-primary mb-4" onClick={fetchRides}>
        Refresh Data
      </button>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading...</div>}

      <div className="mb-4">
        <h4>Location Statistics</h4>
        {pickupLat && pickupLng && (
          <div className="alert alert-info mb-2">
            <strong>Rides within 10 miles of pickup location:</strong>{" "}
            {locationStats.pickupRadiusCount}
          </div>
        )}
        {dropoffLat && dropoffLng && (
          <div className="alert alert-info mb-2">
            <strong>Rides within 10 miles of dropoff location:</strong>{" "}
            {locationStats.dropoffRadiusCount}
          </div>
        )}
        <div className="alert alert-info">
          <strong>Total Rides in Filtered Area:</strong> {totalRides}
        </div>
      </div>

      {filteredRides.length > 0 && (
        <>
          <div className="mb-4">
            <h4>Summary</h4>
            <p>
              <strong>Total Revenue:</strong> {formatAmount(totalRevenue)}
            </p>
            <p>
              <strong>Total Rides:</strong> {totalRides}
            </p>
            <p>
              <strong>Average Ride Price:</strong>{" "}
              {formatAmount(totalRevenue / totalRides)}
            </p>
          </div>

          <div className="mb-4">
            <h4>Revenue per Day</h4>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Revenue</th>
                    <th>Number of Rides</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(revenuePerDay).map((day, index) => (
                    <tr key={index}>
                      <td>{new Date(day.day).toLocaleDateString()}</td>
                      <td>{formatAmount(day.totalRevenue)}</td>
                      <td>
                        {
                          filteredRides.filter(
                            (ride) =>
                              new Date(ride.dateTime).toLocaleDateString() ===
                              new Date(day.day).toLocaleDateString()
                          ).length
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-4">
            <h4>Rides in Area</h4>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Customer ID</th>
                    <th>Pickup Location</th>
                    <th>Dropoff Location</th>
                    <th>Distance (miles)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRides.map((ride) => {
                    const pickupDistance =
                      ride.pickupLocation && pickupLat && pickupLng
                        ? calculateDistance(
                            parseFloat(pickupLat),
                            parseFloat(pickupLng),
                            ride.pickupLocation.latitude,
                            ride.pickupLocation.longitude
                          ).toFixed(1)
                        : "N/A";

                    const dropoffDistance =
                      ride.dropoffLocation && dropoffLat && dropoffLng
                        ? calculateDistance(
                            parseFloat(dropoffLat),
                            parseFloat(dropoffLng),
                            ride.dropoffLocation.latitude,
                            ride.dropoffLocation.longitude
                          ).toFixed(1)
                        : "N/A";

                    return (
                      <tr key={ride._id}>
                        <td>{formatDate(ride.dateTime)}</td>
                        <td>{formatAmount(ride.price)}</td>
                        <td>{ride.status}</td>
                        <td>{ride.customerId}</td>
                        <td>
                          {ride.pickupLocation?.address || "N/A"}
                          {pickupDistance !== "N/A" &&
                            ` (${pickupDistance} mi)`}
                        </td>
                        <td>
                          {ride.dropoffLocation?.address || "N/A"}
                          {dropoffDistance !== "N/A" &&
                            ` (${dropoffDistance} mi)`}
                        </td>
                        <td>
                          {pickupDistance !== "N/A" &&
                            `Pickup: ${pickupDistance} mi`}
                          {dropoffDistance !== "N/A" &&
                            pickupDistance !== "N/A" && <br />}
                          {dropoffDistance !== "N/A" &&
                            `Dropoff: ${dropoffDistance} mi`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Statistics;
