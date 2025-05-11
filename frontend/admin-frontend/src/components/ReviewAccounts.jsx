import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
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
  Accordion,
} from "react-bootstrap";
import {
  setDrivers,
  setCustomers,
  setLoading,
  setError,
  updateDriverSearchParams,
  updateCustomerSearchParams,
  resetDriverSearch,
  resetCustomerSearch,
  updateDriver,
  updateCustomer,
  deleteDriver,
  deleteCustomer,
  selectFilteredDrivers,
  selectFilteredCustomers,
} from "../store/slices/accountsSlice";

const ReviewAccounts = () => {
  const dispatch = useDispatch();
  const { loading, error: reduxError } = useSelector((state) => state.accounts);
  const filteredDrivers = useSelector(selectFilteredDrivers);
  const filteredCustomers = useSelector(selectFilteredCustomers);
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

  // Search visibility states
  const [showDriverSearch, setShowDriverSearch] = useState(false);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);

  // Fetch all drivers and customers on component mount
  useEffect(() => {
    fetchAllDrivers();
    fetchAllCustomers();
  }, []);

  const fetchAllDrivers = async () => {
    try {
      dispatch(setLoading(true));
      const response = await axios.get(
        `${process.env.REACT_APP_ADMIN_BACKEND_PORT_URL}/api/admin/drivers`
      );
      dispatch(setDrivers(response.data));
      setError("");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch drivers";
      dispatch(setError(errorMessage));
      setError(errorMessage);
    }
  };

  const fetchAllCustomers = async () => {
    try {
      dispatch(setLoading(true));
      const response = await axios.get(
        `${process.env.REACT_APP_ADMIN_BACKEND_PORT_URL}/api/admin/customers`
      );
      dispatch(setCustomers(response.data));
      setError("");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch customers";
      dispatch(setError(errorMessage));
      setError(errorMessage);
    }
  };

  const handleDriverSearch = (e) => {
    e.preventDefault();
    // Search is now handled by Redux selectors
    setSuccess("Search completed");
  };

  const handleCustomerSearch = (e) => {
    e.preventDefault();
    // Search is now handled by Redux selectors
    setSuccess("Search completed");
  };

  const handleDriverSearchParamChange = (field, value) => {
    dispatch(updateDriverSearchParams({ [field]: value }));
  };

  const handleCustomerSearchParamChange = (field, value) => {
    dispatch(updateCustomerSearchParams({ [field]: value }));
  };

  const handleResetDriverSearch = () => {
    dispatch(resetDriverSearch());
    fetchAllDrivers();
  };

  const handleResetCustomerSearch = () => {
    dispatch(resetCustomerSearch());
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
    const digits = phone.replace(/\D/g, "");
    const number = digits.startsWith("1") ? digits.slice(1) : digits;
    return number.length === 10 ? `+1${number}` : null;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const updateDriverHandler = async (e) => {
    e.preventDefault();
    try {
      const formattedDriver = { ...editingDriver };

      const formattedPhone = validatePhoneNumber(formattedDriver.phoneNumber);
      if (!formattedPhone) {
        setError("Phone number must be 10 digits");
        return;
      }
      formattedDriver.phoneNumber = formattedPhone;

      if (!validateEmail(formattedDriver.email)) {
        setError("Invalid email format");
        return;
      }

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
        formattedDriver
      );

      dispatch(updateDriver(response.data));
      setShowEditDriverModal(false);
      setSuccess("Driver updated successfully");
      setError("");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to update driver";
      setError(errorMessage);
    }
  };

  const updateCustomerHandler = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_ADMIN_BACKEND_PORT_URL}/api/admin/customers/${editingCustomer._id}`,
        editingCustomer
      );

      dispatch(updateCustomer(response.data));
      setShowEditCustomerModal(false);
      setSuccess("Customer updated successfully");
      setError("");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to update customer";
      setError(errorMessage);
    }
  };

  const confirmDeleteDriverHandler = async () => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_ADMIN_BACKEND_PORT_URL}/api/admin/drivers/${deletingDriverId}`
      );
      dispatch(deleteDriver(deletingDriverId));
      setShowDeleteDriverModal(false);
      setSuccess("Driver deleted successfully");
      setError("");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete driver";
      setError(errorMessage);
    }
  };

  const confirmDeleteCustomerHandler = async () => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_ADMIN_BACKEND_PORT_URL}/api/admin/customers/${deletingCustomerId}`
      );
      dispatch(deleteCustomer(deletingCustomerId));
      setShowDeleteCustomerModal(false);
      setSuccess("Customer deleted successfully");
      setError("");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete customer";
      setError(errorMessage);
    }
  };

  return (
    <Container className="py-4">
      {(error || reduxError) && (
        <Alert variant="danger">{error || reduxError}</Alert>
      )}
      {success && <Alert variant="success">{success}</Alert>}
      {loading && <Alert variant="info">Loading...</Alert>}

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
            <Form onSubmit={updateDriverHandler}>
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
            <Form onSubmit={updateCustomerHandler}>
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
          <Button variant="danger" onClick={confirmDeleteDriverHandler}>
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
          <Button variant="danger" onClick={confirmDeleteCustomerHandler}>
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
              <div>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="me-2"
                  onClick={() => setShowDriverSearch(!showDriverSearch)}
                >
                  {showDriverSearch ? "Hide Search" : "Advanced Search"}
                </Button>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={handleResetDriverSearch}
                >
                  Show All
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {showDriverSearch && (
                <Form onSubmit={handleDriverSearch} className="mb-3">
                  <Accordion defaultActiveKey="0">
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>Basic Information</Accordion.Header>
                      <Accordion.Body>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>First Name</Form.Label>
                              <Form.Control
                                type="text"
                                onChange={(e) =>
                                  handleDriverSearchParamChange(
                                    "firstName",
                                    e.target.value
                                  )
                                }
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Last Name</Form.Label>
                              <Form.Control
                                type="text"
                                onChange={(e) =>
                                  handleDriverSearchParamChange(
                                    "lastName",
                                    e.target.value
                                  )
                                }
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Email</Form.Label>
                              <Form.Control
                                type="email"
                                onChange={(e) =>
                                  handleDriverSearchParamChange(
                                    "email",
                                    e.target.value
                                  )
                                }
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Phone Number</Form.Label>
                              <Form.Control
                                type="tel"
                                onChange={(e) =>
                                  handleDriverSearchParamChange(
                                    "phoneNumber",
                                    e.target.value
                                  )
                                }
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </Accordion.Body>
                    </Accordion.Item>

                    <Accordion.Item eventKey="1">
                      <Accordion.Header>Location</Accordion.Header>
                      <Accordion.Body>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>City</Form.Label>
                              <Form.Control
                                type="text"
                                onChange={(e) =>
                                  handleDriverSearchParamChange(
                                    "city",
                                    e.target.value
                                  )
                                }
                              />
                            </Form.Group>
                          </Col>
                          <Col md={3}>
                            <Form.Group className="mb-3">
                              <Form.Label>State</Form.Label>
                              <Form.Control
                                type="text"
                                maxLength={2}
                                onChange={(e) =>
                                  handleDriverSearchParamChange(
                                    "state",
                                    e.target.value.toUpperCase()
                                  )
                                }
                              />
                            </Form.Group>
                          </Col>
                          <Col md={3}>
                            <Form.Group className="mb-3">
                              <Form.Label>Zip Code</Form.Label>
                              <Form.Control
                                type="text"
                                onChange={(e) =>
                                  handleDriverSearchParamChange(
                                    "zipCode",
                                    e.target.value
                                  )
                                }
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </Accordion.Body>
                    </Accordion.Item>

                    <Accordion.Item eventKey="2">
                      <Accordion.Header>Car Details</Accordion.Header>
                      <Accordion.Body>
                        <Row>
                          <Col md={4}>
                            <Form.Group className="mb-3">
                              <Form.Label>Car Make</Form.Label>
                              <Form.Control
                                type="text"
                                onChange={(e) =>
                                  handleDriverSearchParamChange(
                                    "carMake",
                                    e.target.value
                                  )
                                }
                              />
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group className="mb-3">
                              <Form.Label>Car Model</Form.Label>
                              <Form.Control
                                type="text"
                                onChange={(e) =>
                                  handleDriverSearchParamChange(
                                    "carModel",
                                    e.target.value
                                  )
                                }
                              />
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group className="mb-3">
                              <Form.Label>Car Year</Form.Label>
                              <Form.Control
                                type="number"
                                onChange={(e) =>
                                  handleDriverSearchParamChange(
                                    "carYear",
                                    e.target.value
                                  )
                                }
                                min="2000"
                                max={new Date().getFullYear() + 1}
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Form.Group className="mb-3">
                          <Form.Label>Minimum Rating</Form.Label>
                          <Form.Control
                            type="number"
                            onChange={(e) =>
                              handleDriverSearchParamChange(
                                "minRating",
                                e.target.value
                              )
                            }
                            min="1"
                            max="5"
                            step="0.1"
                          />
                        </Form.Group>
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                  <div className="d-flex justify-content-end mt-3">
                    <Button variant="primary" type="submit" className="me-2">
                      Search
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleResetDriverSearch}
                    >
                      Reset
                    </Button>
                  </div>
                </Form>
              )}
              <ListGroup>
                {filteredDrivers.map((driver) => (
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
              <div>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="me-2"
                  onClick={() => setShowCustomerSearch(!showCustomerSearch)}
                >
                  {showCustomerSearch ? "Hide Search" : "Advanced Search"}
                </Button>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={handleResetCustomerSearch}
                >
                  Show All
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {showCustomerSearch && (
                <Form onSubmit={handleCustomerSearch} className="mb-3">
                  <Accordion defaultActiveKey="0">
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>Basic Information</Accordion.Header>
                      <Accordion.Body>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>First Name</Form.Label>
                              <Form.Control
                                type="text"
                                onChange={(e) =>
                                  handleCustomerSearchParamChange(
                                    "firstName",
                                    e.target.value
                                  )
                                }
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Last Name</Form.Label>
                              <Form.Control
                                type="text"
                                onChange={(e) =>
                                  handleCustomerSearchParamChange(
                                    "lastName",
                                    e.target.value
                                  )
                                }
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Email</Form.Label>
                              <Form.Control
                                type="email"
                                onChange={(e) =>
                                  handleCustomerSearchParamChange(
                                    "email",
                                    e.target.value
                                  )
                                }
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Phone Number</Form.Label>
                              <Form.Control
                                type="tel"
                                onChange={(e) =>
                                  handleCustomerSearchParamChange(
                                    "phoneNumber",
                                    e.target.value
                                  )
                                }
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </Accordion.Body>
                    </Accordion.Item>

                    <Accordion.Item eventKey="1">
                      <Accordion.Header>Location</Accordion.Header>
                      <Accordion.Body>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>City</Form.Label>
                              <Form.Control
                                type="text"
                                onChange={(e) =>
                                  handleCustomerSearchParamChange(
                                    "city",
                                    e.target.value
                                  )
                                }
                              />
                            </Form.Group>
                          </Col>
                          <Col md={3}>
                            <Form.Group className="mb-3">
                              <Form.Label>State</Form.Label>
                              <Form.Control
                                type="text"
                                maxLength={2}
                                onChange={(e) =>
                                  handleCustomerSearchParamChange(
                                    "state",
                                    e.target.value.toUpperCase()
                                  )
                                }
                              />
                            </Form.Group>
                          </Col>
                          <Col md={3}>
                            <Form.Group className="mb-3">
                              <Form.Label>Zip Code</Form.Label>
                              <Form.Control
                                type="text"
                                onChange={(e) =>
                                  handleCustomerSearchParamChange(
                                    "zipCode",
                                    e.target.value
                                  )
                                }
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                  <div className="d-flex justify-content-end mt-3">
                    <Button variant="primary" type="submit" className="me-2">
                      Search
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleResetCustomerSearch}
                    >
                      Reset
                    </Button>
                  </div>
                </Form>
              )}
              <ListGroup>
                {filteredCustomers.map((customer) => (
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
