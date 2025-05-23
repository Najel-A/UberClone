import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import {
  updateDriverStatusAndLocation,
  setLocation,
  setAcceptedRideId,
} from "../redux/slices/driverSlice";
import { fetchCurrentDriver } from "../redux/slices/authSlice";
import { rideService, driverService } from "../services/api";
import { useNavigate } from 'react-router-dom';

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
  const [walletBalance, setWalletBalance] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState(null);
  const [driverData, setDriverData] = useState(null);
  const [driverLoading, setDriverLoading] = useState(true);
  const [driverError, setDriverError] = useState(null);
  const [cancelingRideId, setCancelingRideId] = useState(null);
  const [cancelError, setCancelError] = useState("");
  const [cancelSuccess, setCancelSuccess] = useState("");
  const navigate = useNavigate();

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
      let locationToSend = undefined;
      if (newStatus === "available") {
        await updateLocationFromBrowser();
        if (
          typeof location.latitude === 'number' &&
          typeof location.longitude === 'number' &&
          !isNaN(location.latitude) &&
          !isNaN(location.longitude)
        ) {
          locationToSend = location;
        }
      }

      dispatch(
        updateDriverStatusAndLocation({
          id: currentDriver._id,
          data: {
            status: newStatus,
            ...(locationToSend ? { currentLocation: locationToSend } : {}),
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

  useEffect(() => {
    const fetchWallet = async () => {
      if (!currentDriver || !currentDriver._id) return;
      setWalletLoading(true);
      setWalletError(null);
      try {
        const res = await driverService.getDriverWallet(currentDriver._id);
        setWalletBalance(res.data.balance);
      } catch (err) {
        setWalletError('Failed to fetch wallet balance');
      } finally {
        setWalletLoading(false);
      }
    };
    fetchWallet();
  }, [currentDriver]);

  const fetchLatestDriver = async () => {
    if (!currentDriver || !currentDriver._id) return;
    setDriverLoading(true);
    setDriverError(null);
    try {
      const res = await driverService.getDriver(currentDriver._id);
      setDriverData(res.data);
      dispatch({ type: 'auth/setCurrentDriver', payload: res.data });
    } catch (err) {
      setDriverError('Failed to fetch driver data');
    } finally {
      setDriverLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestDriver();
  }, []);

  const handleAcceptRide = async (rideId) => {
    setAcceptingRideId(rideId);
    setAcceptError(null);
    try {
      await rideService.acceptRide(rideId, currentDriver._id);
      dispatch(setAcceptedRideId(rideId));
      setAvailableRides((rides) => rides.filter((r) => r._id !== rideId));
      navigate('/simulation');
    } catch (err) {
      setAcceptError(err.response?.data?.message || "Failed to accept ride");
    } finally {
      setAcceptingRideId(null);
    }
  };

  const handleCancelRide = async (rideId) => {
    setCancelingRideId(rideId);
    setCancelError("");
    setCancelSuccess("");
    try {
      await rideService.cancelRide(rideId);
      setCancelSuccess("Ride cancelled successfully.");
      setAvailableRides((rides) => rides.filter((r) => r._id !== rideId));
      fetchLatestDriver();
    } catch (err) {
      setCancelError("Failed to cancel ride. Please try again.");
    } finally {
      setCancelingRideId(null);
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
              <div className="d-flex justify-content-between align-items-center">
                <Card.Title>Driver Rating</Card.Title>
                <Button variant="outline-primary" size="sm" onClick={fetchLatestDriver}>
                  Refresh
                </Button>
              </div>
              {driverLoading ? (
                <p>Loading driver info...</p>
              ) : driverError ? (
                <p className="text-danger">{driverError}</p>
              ) : (
                <>
                  <div className="d-flex align-items-center mt-3">
                    <h2 className="mb-0 me-2">
                      {driverData?.rating?.toFixed(1) || "N/A"}
                    </h2>
                    <div
                      className="rating-stars"
                      title={`Average: ${driverData?.rating?.toFixed(2) || 'N/A'} (${driverData?._ratings?.length || 0} ratings)`}
                      style={{ fontSize: '1.5rem', cursor: 'pointer' }}
                    >
                      {"★".repeat(Math.round(driverData?.rating || 0))}
                      {"☆".repeat(5 - Math.round(driverData?.rating || 0))}
                    </div>
                    <span className="ms-2 text-muted" style={{ fontSize: '1.1rem' }}>
                      ({driverData?._ratings?.length || 0})
                    </span>
                  </div>
                  {driverData?.reviews && driverData.reviews.length > 0 && (
                    <div className="mt-3">
                      <h6>Recent Reviews:</h6>
                      <ul className="list-unstyled">
                        {driverData.reviews.slice(0, 3).map((review, index) => (
                          <li key={index} className="mb-2 text-muted">
                            {review}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
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
      </Row>

      <Row>
        <Col lg={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title>Wallet</Card.Title>
              {walletLoading ? (
                <p>Loading wallet balance...</p>
              ) : walletError ? (
                <p className="text-danger">{walletError}</p>
              ) : (
                <h4>Balance: ${walletBalance?.toFixed(2) ?? '0.00'}</h4>
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
                      <div>
                        <Button
                          variant="success"
                          size="sm"
                          disabled={acceptingRideId === ride._id}
                          onClick={() => handleAcceptRide(ride._id)}
                          className="me-2"
                        >
                          {acceptingRideId === ride._id ? "Accepting..." : "Accept Ride"}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={cancelingRideId === ride._id}
                          onClick={() => handleCancelRide(ride._id)}
                        >
                          {cancelingRideId === ride._id ? "Cancelling..." : "Cancel Ride"}
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {acceptError && <div className="text-danger mt-2">{acceptError}</div>}
              {cancelError && <div className="text-danger mt-2">{cancelError}</div>}
              {cancelSuccess && <div className="text-success mt-2">{cancelSuccess}</div>}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
