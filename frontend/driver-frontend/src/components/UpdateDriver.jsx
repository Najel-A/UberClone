import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Alert,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import driverService from "../services/api";

const UpdateDriver = () => {
  const { currentDriver } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    carDetails: {
      make: "",
      model: "",
      year: new Date().getFullYear(),
    },
  });

  // Load current driver data
  useEffect(() => {
    const fetchDriverData = async () => {
      if (!currentDriver || !currentDriver._id) {
        setLoadingData(false);
        return;
      }

      try {
        const response = await driverService.getDriver(currentDriver._id);
        const driver = response.data;

        // Map driver data to form fields
        setFormData({
          firstName: driver.firstName || "",
          lastName: driver.lastName || "",
          address: {
            street: driver.address?.street || "",
            city: driver.address?.city || "",
            state: driver.address?.state || "",
            zipCode: driver.address?.zipCode || "",
          },
          phoneNumber: driver.phoneNumber || "",
          email: driver.email || "",
          password: "",
          confirmPassword: "",
          carDetails: {
            make: driver.carDetails?.make || "",
            model: driver.carDetails?.model || "",
            year: driver.carDetails?.year || new Date().getFullYear(),
          },
        });
        setError(null);
      } catch (err) {
        setError("Failed to load driver information");
        console.error("Error fetching driver data:", err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchDriverData();
  }, [currentDriver]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Format zip code to match ##### or #####-#### pattern
    if (name === "address.zipCode") {
      // Remove all non-digit characters
      const digitsOnly = value.replace(/\D/g, "");
      // Apply the format
      let formattedValue = "";
      if (digitsOnly.length <= 5) {
        formattedValue = digitsOnly;
      } else {
        formattedValue = `${digitsOnly.slice(0, 5)}-${digitsOnly.slice(5, 9)}`;
      }

      setFormData({
        ...formData,
        address: {
          ...formData.address,
          zipCode: formattedValue,
        },
      });
      return;
    }

    // Format phone number to always include +1 prefix
    if (name === "phoneNumber") {
      let formattedValue = value;
      if (!formattedValue.startsWith("+1")) {
        formattedValue = "+1" + formattedValue.replace(/^\+1/, "");
      }
      // Remove non-digit characters except for +
      formattedValue = formattedValue.replace(/[^\d+]/g, "");

      setFormData({
        ...formData,
        [name]: formattedValue,
      });
      return;
    }

    // Handle state field to force uppercase
    if (name === "address.state") {
      const uppercaseValue = value.toUpperCase();
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          state: uppercaseValue.slice(0, 2), // Limit to 2 characters
        },
      });
      return;
    }

    // Handle nested objects
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const validateForm = () => {
    // Only validate fields that are required
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.address.street ||
      !formData.address.city ||
      !formData.address.state ||
      !formData.address.zipCode ||
      !formData.phoneNumber ||
      !formData.carDetails.make ||
      !formData.carDetails.model
    ) {
      setError("All fields except password are required");
      return false;
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Validate phone format
    if (!/^\+1\d{10}$/.test(formData.phoneNumber)) {
      setError("Phone number must start with +1 followed by 10 digits");
      return false;
    }

    // Check zip code format
    if (!/^\d{5}(-\d{4})?$/.test(formData.address.zipCode)) {
      setError("Zip code must be 5 digits or 5+4 format");
      return false;
    }

    // Validate state code (2 uppercase letters)
    if (!/^[A-Z]{2}$/.test(formData.address.state)) {
      setError("State must be a 2-letter code (e.g., CA, NY)");
      return false;
    }

    // Validate name fields (no numbers or special characters)
    if (
      !/^[A-Za-z\s\-']+$/.test(formData.firstName) ||
      !/^[A-Za-z\s\-']+$/.test(formData.lastName)
    ) {
      setError(
        "Names should only contain letters, spaces, hyphens, or apostrophes"
      );
      return false;
    }

    // If password is provided, validate it
    if (formData.password) {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create update data object
      const updateData = { ...formData };

      // Only include password if provided
      if (!updateData.password) {
        delete updateData.password;
      }

      // Always remove confirmPassword
      delete updateData.confirmPassword;

      await driverService.updateDriver(currentDriver._id, updateData);
      setSuccess(true);

      // Redirect to profile after 2 seconds
      setTimeout(() => {
        navigate("/profile");
      }, 2000);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0] ||
        "Error updating driver profile";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Container className="text-center py-5">
        <p>Loading driver information...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow">
            <Card.Body>
              <Card.Title className="mb-4 text-center">
                Update Profile
              </Card.Title>

              {error && <Alert variant="danger">{error}</Alert>}
              {success && (
                <Alert variant="success">
                  Profile updated successfully! Redirecting...
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Card className="mb-4">
                  <Card.Header>Personal Information</Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label>First Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label>Last Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={12} className="mb-3">
                        <Form.Group>
                          <Form.Label>Phone Number</Form.Label>
                          <Form.Control
                            type="text"
                            name="phoneNumber"
                            placeholder="+11234567890"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            required
                            maxLength={12}
                          />
                          <Form.Text className="text-muted">
                            Format: +1 followed by 10 digits (no spaces or
                            hyphens)
                          </Form.Text>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                <Card className="mb-4">
                  <Card.Header>Address</Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={12} className="mb-3">
                        <Form.Group>
                          <Form.Label>Street</Form.Label>
                          <Form.Control
                            type="text"
                            name="address.street"
                            value={formData.address.street}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={5} className="mb-3">
                        <Form.Group>
                          <Form.Label>City</Form.Label>
                          <Form.Control
                            type="text"
                            name="address.city"
                            value={formData.address.city}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3} className="mb-3">
                        <Form.Group>
                          <Form.Label>State</Form.Label>
                          <Form.Control
                            type="text"
                            name="address.state"
                            maxLength={2}
                            placeholder="CA"
                            value={formData.address.state}
                            onChange={handleChange}
                            required
                          />
                          <Form.Text className="text-muted">
                            2-letter state code (automatically capitalized)
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={4} className="mb-3">
                        <Form.Group>
                          <Form.Label>Zip Code</Form.Label>
                          <Form.Control
                            type="text"
                            name="address.zipCode"
                            placeholder="12345 or 12345-6789"
                            value={formData.address.zipCode}
                            onChange={handleChange}
                            required
                            maxLength={10}
                          />
                          <Form.Text className="text-muted">
                            5-digit or 9-digit format (hyphen added
                            automatically)
                          </Form.Text>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                <Card className="mb-4">
                  <Card.Header>Vehicle Information</Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={4} className="mb-3">
                        <Form.Group>
                          <Form.Label>Make</Form.Label>
                          <Form.Control
                            type="text"
                            name="carDetails.make"
                            placeholder="Toyota"
                            value={formData.carDetails.make}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4} className="mb-3">
                        <Form.Group>
                          <Form.Label>Model</Form.Label>
                          <Form.Control
                            type="text"
                            name="carDetails.model"
                            placeholder="Camry"
                            value={formData.carDetails.model}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4} className="mb-3">
                        <Form.Group>
                          <Form.Label>Year</Form.Label>
                          <Form.Control
                            type="number"
                            name="carDetails.year"
                            min={1970}
                            max={new Date().getFullYear() + 1}
                            value={formData.carDetails.year}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                <Card className="mb-4">
                  <Card.Header>Account Information</Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={12} className="mb-3">
                        <Form.Group>
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label>
                            New Password (leave blank to keep current)
                          </Form.Label>
                          <Form.Control
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                          />
                          <Form.Text className="text-muted">
                            Leave blank to keep current password
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label>Confirm New Password</Form.Label>
                          <Form.Control
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                <div className="d-flex gap-2 justify-content-between">
                  <Button
                    variant="secondary"
                    onClick={() => navigate("/profile")}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading || success}
                  >
                    {loading ? "Updating..." : "Update Profile"}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UpdateDriver;
