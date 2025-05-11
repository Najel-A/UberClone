import React, { useEffect, useState } from "react";
import { Card, Container, Row, Col, ListGroup, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import driverService from "../services/api";

const DriverInfo = () => {
  const { currentDriver } = useAuth();
  const [driverData, setDriverData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    const fetchDriverData = async () => {
      if (!currentDriver || !currentDriver._id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await driverService.getDriver(currentDriver._id);
        setDriverData(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to load driver information");
        console.error("Error fetching driver data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDriverData();
  }, [currentDriver]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await driverService.deleteDriver(currentDriver._id);
      await logout();
      navigate("/signup");
    } catch (err) {
      setDeleteError("Failed to delete account. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <p>Loading driver information...</p>
      </Container>
    );
  }

  if (error || !driverData) {
    return (
      <Container className="text-center py-5">
        <p className="text-danger">
          {error || "No driver information available"}
        </p>
        <Button as={Link} to="/dashboard" variant="primary">
          Return to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">Driver Profile</h2>

      <Row>
        <Col lg={8} className="mx-auto">
          <Card className="shadow mb-4">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">Personal Information</h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <strong>Driver ID:</strong> {driverData._id}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Name:</strong> {driverData.firstName}{" "}
                      {driverData.lastName}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Email:</strong> {driverData.email}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Phone:</strong> {driverData.phoneNumber}
                    </ListGroup.Item>
                  </ListGroup>
                </Col>
                <Col md={6}>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <strong>Address:</strong>
                      <p className="mb-0 mt-2">
                        {driverData.address?.street}
                        <br />
                        {driverData.address?.city}, {driverData.address?.state}{" "}
                        {driverData.address?.zipCode}
                      </p>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Account Created:</strong>
                      <br />
                      {new Date(driverData.createdAt).toLocaleDateString()}
                    </ListGroup.Item>
                  </ListGroup>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="shadow mb-4">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">Vehicle Information</h4>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <strong>Vehicle:</strong> {driverData.carDetails?.year}{" "}
                  {driverData.carDetails?.make} {driverData.carDetails?.model}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>

          <Card className="shadow mb-4">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">Rating & Reviews</h4>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col xs={12}>
                  <div className="d-flex align-items-center">
                    <h2 className="mb-0 me-3">
                      {driverData.rating?.toFixed(1) || "N/A"}/5.0
                    </h2>
                    <div className="text-warning fs-4">
                      {"★".repeat(Math.round(driverData.rating || 0))}
                      {"☆".repeat(5 - Math.round(driverData.rating || 0))}
                    </div>
                  </div>
                </Col>
              </Row>

              {driverData.reviews && driverData.reviews.length > 0 ? (
                <div>
                  <h5>Recent Reviews:</h5>
                  <ListGroup>
                    {driverData.reviews.map((review, index) => (
                      <ListGroup.Item key={index}>"{review}"</ListGroup.Item>
                    ))}
                  </ListGroup>
                </div>
              ) : (
                <p>No reviews yet.</p>
              )}
            </Card.Body>
          </Card>

          <div className="d-flex justify-content-between">
            <Button as={Link} to="/dashboard" variant="secondary">
              Back to Dashboard
            </Button>
            <Button as={Link} to="/update-profile" variant="primary">
              Edit Profile
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete Account"}
            </Button>
          </div>
          {deleteError && <div className="text-danger mt-2">{deleteError}</div>}
        </Col>
      </Row>
    </Container>
  );
};

export default DriverInfo;
