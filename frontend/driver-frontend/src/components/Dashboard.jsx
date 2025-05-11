import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import {
  updateDriverStatusAndLocation,
  setLocation,
} from "../redux/slices/driverSlice";
import { fetchCurrentDriver } from "../redux/slices/authSlice";
import { rideService } from "../services/api";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { currentDriver } = useSelector((state) => state.auth);
  const { driverStatus, location, loading, error } = useSelector(
    (state) => state.driver
  );
  const [availableRides, setAvailableRides] = useState([]);
  const [ridesLoading, setRidesLoading] = useState(false);
  const [acceptingRideId, setAcceptingRideId] = useState(null);
  const [acceptError, setAcceptError] = useState(null);

  // Fetch current driver status on component mount
  // useEffect(() => {
  //   if (currentDriver && currentDriver._id) {
  //     console.log(currentDriver._id, "currentDriver._id");
  //     dispatch(fetchCurrentDriver(currentDriver._id));
  //   }
  // }, [dispatch, currentDriver?._id]);

  // Toggle driver availability status
  const toggleAvailability = async () => {
    const newStatus =
      driverStatus === "available" ? "unavailable" : "available";

    try {
      // Get current location if becoming available
      if (newStatus === "available") {
        await updateLocationFromBrowser();
      }

      dispatch(
        updateDriverStatusAndLocation({
          id: currentDriver._id,
          data: {
            status: newStatus,
            currentLocation: location,
          },
        })
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // Get location from browser
  const updateLocationFromBrowser = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            dispatch(setLocation(newLocation));
            resolve(newLocation);
          },
          (err) => {
            console.error("Geolocation error:", err);
            reject(err);
          }
        );
      } else {
        console.error("Geolocation is not supported by this browser");
        reject(new Error("Geolocation not supported"));
      }
    });
  };

  // Poll for available rides every 5 seconds
  useEffect(() => {
    let interval;
    const fetchRides = async () => {
      if (driverStatus !== "available" || !location.latitude || !location.longitude) return;
      setRidesLoading(true);
      try {
        const res = await rideService.getAvailableRides(location.latitude, location.longitude);
        setAvailableRides(res.data);
      } catch (err) {
        setAvailableRides([]);
      } finally {
        setRidesLoading(false);
      }
    };
    fetchRides();
    interval = setInterval(fetchRides, 5000);
    return () => clearInterval(interval);
  }, [driverStatus, location.latitude, location.longitude]);

  const handleAcceptRide = async (rideId) => {
    setAcceptingRideId(rideId);
    setAcceptError(null);
    try {
      await rideService.acceptRide(rideId, currentDriver._id);
      // Optionally, refresh rides immediately
      setAvailableRides((rides) => rides.filter((r) => r._id !== rideId));
    } catch (err) {
      setAcceptError(err.response?.data?.message || "Failed to accept ride");
    } finally {
      setAcceptingRideId(null);
    }
  };

  if (!currentDriver) {
    return (
      <Container className="mt-5 text-center">
        <p>Please login to access your dashboard</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <h1 className="text-light">Welcome, {currentDriver.firstName}!</h1>
          <p className="text-muted">Driver ID: {currentDriver._id}</p>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col lg={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title>Driver Status</Card.Title>
              <div className="d-flex align-items-center my-3">
                <div className="me-3">
                  <Badge
                    bg={driverStatus === "available" ? "success" : "secondary"}
                  >
                    {driverStatus === "available" ? "Online" : "Offline"}
                  </Badge>
                </div>
                <Button
                  variant={
                    driverStatus === "available" ? "outline-danger" : "primary"
                  }
                  onClick={toggleAvailability}
                  disabled={loading}
                  className="px-4"
                >
                  {loading
                    ? "Updating..."
                    : driverStatus === "available"
                    ? "Go Offline"
                    : "Go Online"}
                </Button>
              </div>
              {error && <p className="text-danger">{error}</p>}

              {location.latitude && (
                <div className="mt-3">
                  <small className="text-muted">
                    Current location: {location.latitude.toFixed(4)},{" "}
                    {location.longitude.toFixed(4)}
                  </small>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title>Vehicle Information</Card.Title>
              {currentDriver.carDetails ? (
                <div className="mt-3">
                  <p>
                    <strong>Make:</strong> {currentDriver.carDetails.make}
                  </p>
                  <p>
                    <strong>Model:</strong> {currentDriver.carDetails.model}
                  </p>
                  <p>
                    <strong>Year:</strong> {currentDriver.carDetails.year}
                  </p>
                </div>
              ) : (
                <p>No vehicle information available</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title>Personal Information</Card.Title>
              <div className="mt-3">
                <p>
                  <strong>Name:</strong> {currentDriver.firstName}{" "}
                  {currentDriver.lastName}
                </p>
                <p>
                  <strong>Email:</strong> {currentDriver.email}
                </p>
                <p>
                  <strong>Phone:</strong> {currentDriver.phoneNumber}
                </p>
                {currentDriver.address && (
                  <p>
                    <strong>Address:</strong> {currentDriver.address.street},{" "}
                    {currentDriver.address.city}, {currentDriver.address.state}{" "}
                    {currentDriver.address.zipCode}
                  </p>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title>Driver Rating</Card.Title>
              <div className="d-flex align-items-center mt-3">
                <h2 className="mb-0 me-2">
                  {currentDriver.rating?.toFixed(1) || "N/A"}
                </h2>
                <div className="rating-stars">
                  {"★".repeat(Math.round(currentDriver.rating || 0))}
                  {"☆".repeat(5 - Math.round(currentDriver.rating || 0))}
                </div>
              </div>

              {currentDriver.reviews && currentDriver.reviews.length > 0 && (
                <div className="mt-3">
                  <h6>Recent Reviews:</h6>
                  <ul className="list-unstyled">
                    {currentDriver.reviews.slice(0, 3).map((review, index) => (
                      <li key={index} className="mb-2 text-muted">
                        {review}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={12} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title>Available Ride Requests (within 10 miles)</Card.Title>
              {ridesLoading ? (
                <p>Loading rides...</p>
              ) : availableRides.length === 0 ? (
                <p>No available rides nearby.</p>
              ) : (
                <ul className="list-group">
                  {availableRides.map((ride) => (
                    <li key={ride._id} className="list-group-item d-flex justify-content-between align-items-center">
                      <span>
                        <strong>Pickup:</strong> {ride.pickupLocation.address} | <strong>Dropoff:</strong> {ride.dropoffLocation.address} | <strong>Price:</strong> ${ride.price}
                      </span>
                      <Button
                        variant="success"
                        size="sm"
                        disabled={acceptingRideId === ride._id}
                        onClick={() => handleAcceptRide(ride._id)}
                      >
                        {acceptingRideId === ride._id ? "Accepting..." : "Accept Ride"}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              {acceptError && <div className="text-danger mt-2">{acceptError}</div>}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
