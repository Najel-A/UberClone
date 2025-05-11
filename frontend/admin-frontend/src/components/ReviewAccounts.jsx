import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  ListGroup,
  Alert,
  Modal,
  Badge,
} from "react-bootstrap";

const ReviewAccounts = () => {
  const [drivers, setDrivers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [driverEmail, setDriverEmail] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Edit states
  const [showEditDriverModal, setShowEditDriverModal] = useState(false);
  const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // Delete confirmation states
  const [showDeleteDriverModal, setShowDeleteDriverModal] = useState(false);
  const [showDeleteCustomerModal, setShowDeleteCustomerModal] = useState(false);
  const [deletingDriverId, setDeletingDriverId] = useState(null);
  const [deletingCustomerId, setDeletingCustomerId] = useState(null);

  // Fetch all drivers and customers on component mount
  useEffect(() => {
    fetchAllDrivers();
    fetchAllCustomers();
  }, []);

  const fetchAllDrivers = async () => {
    try {
      console.log(
        "process.env.REACT_APP_ADMIN_BACKEND_PORT_URL",
        process.env.REACT_APP_ADMIN_BACKEND_PORT_URL
      );
      const response = await axios.get(
        `${process.env.REACT_APP_ADMIN_BACKEND_PORT_URL}/api/admin/drivers`
      );
      console.log("Drivers:", response.data);
      setDrivers(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch drivers");
      console.error("Error fetching drivers:", err);
    }
  };

  const fetchAllCustomers = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_ADMIN_BACKEND_PORT_URL}/api/admin/customers`
      );
      setCustomers(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch customers");
      console.error("Error fetching customers:", err);
    }
  };

  const searchDriverByEmail = async (e) => {
    e.preventDefault();
    if (!driverEmail) {
      setError("Please enter a driver email");
      return;
    }
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_ADMIN_BACKEND_PORT_URL}/api/admin/drivers/email/${driverEmail}`
      );
      setDrivers([response.data]);
      setError("");
      setSuccess("Driver found");
    } catch (err) {
      setError("Driver not found");
      console.error("Error searching driver:", err);
    }
  };

  const searchCustomerByEmail = async (e) => {
    e.preventDefault();
    if (!customerEmail) {
      setError("Please enter a customer email");
      return;
    }
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_ADMIN_BACKEND_PORT_URL}/api/admin/customers/email/${customerEmail}`
      );
      setCustomers([response.data]);
      setError("");
      setSuccess("Customer found");
    } catch (err) {
      setError("Customer not found");
      console.error("Error searching customer:", err);
    }
  };

  const resetDriverSearch = () => {
    setDriverEmail("");
    fetchAllDrivers();
  };

  const resetCustomerSearch = () => {
    setCustomerEmail("");
    fetchAllCustomers();
  };

  const handleEditDriver = (driver) => {
    setEditingDriver(driver);
    setShowEditDriverModal(true);
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setShowEditCustomerModal(true);
  };

  const handleDeleteDriver = (driverId) => {
    setDeletingDriverId(driverId);
    setShowDeleteDriverModal(true);
  };

  const handleDeleteCustomer = (customerId) => {
    setDeletingCustomerId(customerId);
    setShowDeleteCustomerModal(true);
  };

  const validatePhoneNumber = (phone) => {
    // Remove any non-digit characters
    const digits = phone.replace(/\D/g, "");
    // If it starts with 1, remove it
    const number = digits.startsWith("1") ? digits.slice(1) : digits;
    // Format as +1XXXXXXXXXX
    return number.length === 10 ? `+1${number}` : null;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const updateDriver = async (e) => {
    e.preventDefault();
    try {
      // Validate and format the data
      const formattedDriver = { ...editingDriver };

      // Validate and format phone number
      const formattedPhone = validatePhoneNumber(formattedDriver.phoneNumber);
      if (!formattedPhone) {
        setError("Phone number must be 10 digits");
        return;
      }
      formattedDriver.phoneNumber = formattedPhone;

      // Validate email
      if (!validateEmail(formattedDriver.email)) {
        setError("Invalid email format");
        return;
      }

      // Ensure car year is within valid range if provided
      if (formattedDriver.carDetails?.year) {
        const currentYear = new Date().getFullYear();
        if (
          formattedDriver.carDetails.year < 2000 ||
          formattedDriver.carDetails.year > currentYear + 1
        ) {
          setError(`Car year must be between 2000 and ${currentYear + 1}`);
          return;
        }
      }

      const response = await axios.put(
        `${process.env.REACT_APP_ADMIN_BACKEND_PORT_URL}/api/admin/drivers/${editingDriver._id}`,
        formattedDriver,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setDrivers(
        drivers.map((d) => (d._id === editingDriver._id ? response.data : d))
      );
      setShowEditDriverModal(false);
      setSuccess("Driver updated successfully");
      setError("");
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.errors) {
        setError(err.response.data.errors.map((e) => e.msg).join(", "));
      } else {
        setError("Failed to update driver");
      }
      console.error("Error updating driver:", err);
    }
  };

  const updateCustomer = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_ADMIN_BACKEND_PORT_URL}/api/admin/customers/${editingCustomer._id}`,
        editingCustomer
      );
      setCustomers(
        customers.map((c) =>
          c._id === editingCustomer._id ? response.data : c
        )
      );
      setShowEditCustomerModal(false);
      setSuccess("Customer updated successfully");
    } catch (err) {
      setError("Failed to update customer");
      console.error("Error updating customer:", err);
    }
  };

  const confirmDeleteDriver = async () => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_ADMIN_BACKEND_PORT_URL}/api/admin/drivers/${deletingDriverId}`
      );
      setDrivers(drivers.filter((d) => d._id !== deletingDriverId));
      setShowDeleteDriverModal(false);
      setSuccess("Driver deleted successfully");
    } catch (err) {
      setError("Failed to delete driver");
      console.error("Error deleting driver:", err);
    }
  };

  const confirmDeleteCustomer = async () => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_ADMIN_BACKEND_PORT_URL}/api/admin/customers/${deletingCustomerId}`
      );
      setCustomers(customers.filter((c) => c._id !== deletingCustomerId));
      setShowDeleteCustomerModal(false);
      setSuccess("Customer deleted successfully");
    } catch (err) {
      setError("Failed to delete customer");
      console.error("Error deleting customer:", err);
    }
  };

  return (
    <Container className="py-4">
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Edit Driver Modal */}
      <Modal
        show={showEditDriverModal}
        onHide={() => setShowEditDriverModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Driver</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingDriver && (
            <Form onSubmit={updateDriver}>
              <Form.Group className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  value={editingDriver.firstName}
                  onChange={(e) =>
                    setEditingDriver({
                      ...editingDriver,
                      firstName: e.target.value,
                    })
                  }
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  value={editingDriver.lastName}
                  onChange={(e) =>
                    setEditingDriver({
                      ...editingDriver,
                      lastName: e.target.value,
                    })
                  }
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={editingDriver.email}
                  onChange={(e) =>
                    setEditingDriver({
                      ...editingDriver,
                      email: e.target.value,
                    })
                  }
                  required
                  pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                />
                <Form.Text className="text-muted">
                  Must be a valid email address
                </Form.Text>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="tel"
                  value={editingDriver.phoneNumber}
                  onChange={(e) =>
                    setEditingDriver({
                      ...editingDriver,
                      phoneNumber: e.target.value,
                    })
                  }
                  required
                  placeholder="+1XXXXXXXXXX"
                />
                <Form.Text className="text-muted">
                  Must be 10 digits (will be formatted as +1XXXXXXXXXX)
                </Form.Text>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={editingDriver.status || "available"}
                  onChange={(e) =>
                    setEditingDriver({
                      ...editingDriver,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </Form.Select>
              </Form.Group>
              {editingDriver.carDetails && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Car Make</Form.Label>
                    <Form.Control
                      type="text"
                      value={editingDriver.carDetails.make}
                      onChange={(e) =>
                        setEditingDriver({
                          ...editingDriver,
                          carDetails: {
                            ...editingDriver.carDetails,
                            make: e.target.value,
                          },
                        })
                      }
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Car Model</Form.Label>
                    <Form.Control
                      type="text"
                      value={editingDriver.carDetails.model}
                      onChange={(e) =>
                        setEditingDriver({
                          ...editingDriver,
                          carDetails: {
                            ...editingDriver.carDetails,
                            model: e.target.value,
                          },
                        })
                      }
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Car Year</Form.Label>
                    <Form.Control
                      type="number"
                      value={editingDriver.carDetails.year}
                      onChange={(e) =>
                        setEditingDriver({
                          ...editingDriver,
                          carDetails: {
                            ...editingDriver.carDetails,
                            year: parseInt(e.target.value),
                          },
                        })
                      }
                      required
                      min="2000"
                      max={new Date().getFullYear() + 1}
                    />
                    <Form.Text className="text-muted">
                      Must be between 2000 and {new Date().getFullYear() + 1}
                    </Form.Text>
                  </Form.Group>
                </>
              )}
              <Button variant="primary" type="submit" className="me-2">
                Save Changes
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowEditDriverModal(false)}
              >
                Cancel
              </Button>
            </Form>
          )}
        </Modal.Body>
      </Modal>

      {/* Edit Customer Modal */}
      <Modal
        show={showEditCustomerModal}
        onHide={() => setShowEditCustomerModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Customer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingCustomer && (
            <Form onSubmit={updateCustomer}>
              <Form.Group className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  value={editingCustomer.firstName}
                  onChange={(e) =>
                    setEditingCustomer({
                      ...editingCustomer,
                      firstName: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  value={editingCustomer.lastName}
                  onChange={(e) =>
                    setEditingCustomer({
                      ...editingCustomer,
                      lastName: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={editingCustomer.email}
                  onChange={(e) =>
                    setEditingCustomer({
                      ...editingCustomer,
                      email: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="tel"
                  value={editingCustomer.phoneNumber}
                  onChange={(e) =>
                    setEditingCustomer({
                      ...editingCustomer,
                      phoneNumber: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Button variant="primary" type="submit" className="me-2">
                Save Changes
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowEditCustomerModal(false)}
              >
                Cancel
              </Button>
            </Form>
          )}
        </Modal.Body>
      </Modal>

      {/* Delete Driver Confirmation Modal */}
      <Modal
        show={showDeleteDriverModal}
        onHide={() => setShowDeleteDriverModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this driver? This action cannot be
          undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={confirmDeleteDriver}>
            Delete
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteDriverModal(false)}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Customer Confirmation Modal */}
      <Modal
        show={showDeleteCustomerModal}
        onHide={() => setShowDeleteCustomerModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this customer? This action cannot be
          undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={confirmDeleteCustomer}>
            Delete
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteCustomerModal(false)}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h3 className="mb-0">Drivers</h3>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={resetDriverSearch}
              >
                Show All
              </Button>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={searchDriverByEmail} className="mb-3">
                <Form.Group className="d-flex">
                  <Form.Control
                    type="email"
                    placeholder="Search driver by email"
                    value={driverEmail}
                    onChange={(e) => setDriverEmail(e.target.value)}
                  />
                  <Button type="submit" variant="primary" className="ms-2">
                    Search
                  </Button>
                </Form.Group>
              </Form>
              <ListGroup>
                {drivers.map((driver) => (
                  <ListGroup.Item key={driver._id}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>
                          {driver.firstName} {driver.lastName}
                        </strong>
                        <br />
                        <small className="text-muted">
                          Email: {driver.email}
                          <br />
                          Phone: {driver.phoneNumber}
                          <br />
                          Address: {driver.address?.street},{" "}
                          {driver.address?.city}, {driver.address?.state}{" "}
                          {driver.address?.zipCode}
                        </small>
                      </div>
                      <div className="text-end">
                        <Badge
                          bg={
                            driver.status === "available"
                              ? "success"
                              : "secondary"
                          }
                          className="mb-2"
                        >
                          {driver.status || "N/A"}
                        </Badge>
                        <br />
                        <small className="text-muted">
                          Rating: {driver.rating || "N/A"}
                        </small>
                        <div className="mt-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEditDriver(driver)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteDriver(driver._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h3 className="mb-0">Customers</h3>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={resetCustomerSearch}
              >
                Show All
              </Button>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={searchCustomerByEmail} className="mb-3">
                <Form.Group className="d-flex">
                  <Form.Control
                    type="email"
                    placeholder="Search customer by email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                  <Button type="submit" variant="primary" className="ms-2">
                    Search
                  </Button>
                </Form.Group>
              </Form>
              <ListGroup>
                {customers.map((customer) => (
                  <ListGroup.Item key={customer._id}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>
                          {customer.firstName} {customer.lastName}
                        </strong>
                        <br />
                        <small className="text-muted">
                          Email: {customer.email}
                          <br />
                          Phone: {customer.phoneNumber}
                          <br />
                          Address: {customer.address?.street},{" "}
                          {customer.address?.city}, {customer.address?.state}{" "}
                          {customer.address?.zipCode}
                        </small>
                      </div>
                      <div>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEditCustomer(customer)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteCustomer(customer._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ReviewAccounts;
