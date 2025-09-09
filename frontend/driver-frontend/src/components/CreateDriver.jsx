import React, { useState, useEffect } from "react";
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Card,
  Alert,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  createDriver,
  resetSuccessFlags,
  clearDriverError,
} from "../redux/slices/driverSlice";

const CreateDriver = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { profileLoading, error, registrationSuccess } = useSelector(
    (state) => state.driver
  );
  const currentYear = new Date().getFullYear();

  const [formError, setFormError] = useState(null);
  const [formData, setFormData] = useState({
    _id: "",
    firstName: "",
    lastName: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
    phoneNumber: "+1",
    email: "",
    password: "",
    confirmPassword: "",
    carDetails: {
      make: "",
      model: "",
      year: currentYear,
    },
  });

  // Clear errors on component mount/unmount
  useEffect(() => {
    dispatch(clearDriverError());
    return () => dispatch(resetSuccessFlags());
  }, [dispatch]);

  // Redirect after successful registration
  useEffect(() => {
    if (registrationSuccess) {
      const redirectTimer = setTimeout(() => {
        navigate("/login");
      }, 2000);

      return () => clearTimeout(redirectTimer);
    }
  }, [registrationSuccess, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Format SSN (ID) input to match ###-##-#### pattern
    if (name === "_id") {
      // Remove all non-digit characters
      const digitsOnly = value.replace(/\D/g, "");
      // Apply the format
      let formattedValue = "";
      if (digitsOnly.length <= 3) {
        formattedValue = digitsOnly;
      } else if (digitsOnly.length <= 5) {
        formattedValue = `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3)}`;
      } else {
        formattedValue = `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(
          3,
          5
        )}-${digitsOnly.slice(5, 9)}`;
      }

      setFormData({
        ...formData,
        [name]: formattedValue,
      });
      return;
    }

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
    // Check required fields
    if (
      !formData._id ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.address.street ||
      !formData.address.city ||
      !formData.address.state ||
      !formData.address.zipCode ||
      !formData.phoneNumber ||
      !formData.carDetails.make ||
      !formData.carDetails.model
    ) {
      setFormError("All fields are required");
      return false;
    }

    // Validate SSN format
    if (!/^\d{3}-\d{2}-\d{4}$/.test(formData._id)) {
      setFormError("SSN must be in format XXX-XX-XXXX");
      return false;
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setFormError("Please enter a valid email address");
      return false;
    }

    // Validate phone format
    if (!/^\+1\d{10}$/.test(formData.phoneNumber)) {
      setFormError("Phone number must start with +1 followed by 10 digits");
      return false;
    }

    // Check password match
    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match");
      return false;
    }

    // Check zip code format
    if (!/^\d{5}(-\d{4})?$/.test(formData.address.zipCode)) {
      setFormError("Zip code must be 5 digits or 5+4 format");
      return false;
    }

    // Validate state code (2 uppercase letters)
    if (!/^[A-Z]{2}$/.test(formData.address.state)) {
      setFormError("State must be a 2-letter code (e.g., CA, NY)");
      return false;
    }

    // Validate name fields (no numbers or special characters)
    if (
      !/^[A-Za-z\s\-']+$/.test(formData.firstName) ||
      !/^[A-Za-z\s\-']+$/.test(formData.lastName)
    ) {
      setFormError(
        "Names should only contain letters, spaces, hyphens, or apostrophes"
      );
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setFormError(null);

    // Remove confirmPassword before sending to API
    const { confirmPassword, ...driverData } = formData;
    dispatch(createDriver(driverData));
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow">
            <Card.Body>
              <Card.Title className="mb-4 text-center">
                Drive with Uber
              </Card.Title>

              {(error || formError) && (
                <Alert variant="danger">{formError || error}</Alert>
              )}

              {registrationSuccess && (
                <Alert variant="success">
                  Registration successful! Redirecting to login...
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Card className="mb-4">
                  <Card.Header>Personal Information</Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={12} className="mb-3">
                        <Form.Group>
                          <Form.Label>SSN (Driver ID)</Form.Label>
                          <Form.Control
                            type="text"
                            name="_id"
                            placeholder="XXX-XX-XXXX"
                            value={formData._id}
                            onChange={handleChange}
                            maxLength={11}
                          />
                          <Form.Text className="text-muted">
                            Format: XXX-XX-XXXX (numbers only, hyphens added
                            automatically)
                          </Form.Text>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label>First Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
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
                            max={currentYear + 1}
                            value={formData.carDetails.year}
                            onChange={handleChange}
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
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label>Password</Form.Label>
                          <Form.Control
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                          />
                          <Form.Text className="text-muted">
                            Enter any password you can remember
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label>Confirm Password</Form.Label>
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

                <div className="d-grid gap-2">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={profileLoading || registrationSuccess}
                    size="lg"
                  >
                    {profileLoading ? "Registering..." : "Sign Up to Drive"}
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

export default CreateDriver;
