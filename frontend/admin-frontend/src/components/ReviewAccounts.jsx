import React, { useEffect, useState, useCallback } from "react";
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
  updateDebouncedDriverSearchParams,
  updateDebouncedCustomerSearchParams,
  resetDriverSearch,
  resetCustomerSearch,
  updateDriver,
  updateCustomer,
  deleteDriver,
  deleteCustomer,
  selectFilteredDrivers,
  selectFilteredCustomers,
} from "../store/slices/accountsSlice";
import debounce from "lodash/debounce";

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

  // Create debounced search handlers
  const debouncedDriverSearch = useCallback(
    debounce((field, value) => {
      dispatch(updateDebouncedDriverSearchParams({ [field]: value }));
    }, 300),
    [dispatch]
  );

  const debouncedCustomerSearch = useCallback(
    debounce((field, value) => {
      dispatch(updateDebouncedCustomerSearchParams({ [field]: value }));
    }, 300),
    [dispatch]
  );

  // Fetch all drivers and customers on component mount
  useEffect(() => {
    axios
      .get(process.env.REACT_APP_ADMIN_BACKEND_PORT_URL + "/api/admin/drivers")
      .then((res) => setDrivers(res.data));
    axios
      .get(process.env.REACT_APP_ADMIN_BACKEND_PORT_URL + "/api/admin/customers")
      .then((res) => setCustomers(res.data));
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

  const handleDriverSearchParamChange = (field, value) => {
    // Update immediate search params for UI feedback
    dispatch(updateDriverSearchParams({ [field]: value }));
    // Debounce the actual search
    debouncedDriverSearch(field, value);
  };

  const handleCustomerSearchParamChange = (field, value) => {
    // Update immediate search params for UI feedback
    dispatch(updateCustomerSearchParams({ [field]: value }));
    // Debounce the actual search
    debouncedCustomerSearch(field, value);
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
      // Create a copy of the driver data without _id
      const { _id, ...formattedDriver } = editingDriver;

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
        `${process.env.REACT_APP_ADMIN_BACKEND_PORT_URL}/api/admin/drivers/${_id}`,
        formattedDriver
      );

      // Add the _id back to the response data for Redux state update
      const updatedDriver = { ...response.data, _id };
      dispatch(updateDriver(updatedDriver));
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
      // Create a copy of the customer data without _id
      const { _id, ...formattedCustomer } = editingCustomer;

      const response = await axios.put(
        `${process.env.REACT_APP_ADMIN_BACKEND_PORT_URL}/api/admin/customers/${_id}`,
        formattedCustomer
      );

      // Add the _id back to the response data for Redux state update
      const updatedCustomer = { ...response.data, _id };
      dispatch(updateCustomer(updatedCustomer));
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

  // Cleanup debounced functions on unmount
  useEffect(() => {
    return () => {
      debouncedDriverSearch.cancel();
      debouncedCustomerSearch.cancel();
    };
  }, [debouncedDriverSearch, debouncedCustomerSearch]);

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
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Driver</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingDriver && (
            <Form onSubmit={updateDriverHandler}>
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
                      </Col>
                      <Col md={6}>
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
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
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
                        </Form.Group>
                      </Col>
                      <Col md={6}>
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
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
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
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Rating</Form.Label>
                          <Form.Control
                            type="number"
                            value={editingDriver.rating || 5.0}
                            onChange={(e) =>
                              setEditingDriver({
                                ...editingDriver,
                                rating: parseFloat(e.target.value),
                              })
                            }
                            min="1.0"
                            max="5.0"
                            step="0.1"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="1">
                  <Accordion.Header>Address</Accordion.Header>
                  <Accordion.Body>
                    <Form.Group className="mb-3">
                      <Form.Label>Street Address</Form.Label>
                      <Form.Control
                        type="text"
                        value={editingDriver.address?.street || ""}
                        onChange={(e) =>
                          setEditingDriver({
                            ...editingDriver,
                            address: {
                              ...editingDriver.address,
                              street: e.target.value,
                            },
                          })
                        }
                        required
                      />
                    </Form.Group>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>City</Form.Label>
                          <Form.Control
                            type="text"
                            value={editingDriver.address?.city || ""}
                            onChange={(e) =>
                              setEditingDriver({
                                ...editingDriver,
                                address: {
                                  ...editingDriver.address,
                                  city: e.target.value,
                                },
                              })
                            }
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>State</Form.Label>
                          <Form.Control
                            type="text"
                            maxLength={2}
                            value={editingDriver.address?.state || ""}
                            onChange={(e) =>
                              setEditingDriver({
                                ...editingDriver,
                                address: {
                                  ...editingDriver.address,
                                  state: e.target.value.toUpperCase(),
                                },
                              })
                            }
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>Zip Code</Form.Label>
                          <Form.Control
                            type="text"
                            value={editingDriver.address?.zipCode || ""}
                            onChange={(e) =>
                              setEditingDriver({
                                ...editingDriver,
                                address: {
                                  ...editingDriver.address,
                                  zipCode: e.target.value,
                                },
                              })
                            }
                            required
                            pattern="^\d{5}(-\d{4})?$"
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
                            value={editingDriver.carDetails?.make || ""}
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
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Car Model</Form.Label>
                          <Form.Control
                            type="text"
                            value={editingDriver.carDetails?.model || ""}
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
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Car Year</Form.Label>
                          <Form.Control
                            type="number"
                            value={editingDriver.carDetails?.year || ""}
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
                            min="1970"
                            max={new Date().getFullYear() + 1}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="3">
                  <Accordion.Header>Location & Media</Accordion.Header>
                  <Accordion.Body>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Latitude</Form.Label>
                          <Form.Control
                            type="number"
                            value={
                              editingDriver.currentLocation?.latitude || ""
                            }
                            onChange={(e) =>
                              setEditingDriver({
                                ...editingDriver,
                                currentLocation: {
                                  ...editingDriver.currentLocation,
                                  latitude: parseFloat(e.target.value),
                                },
                              })
                            }
                            min="-90"
                            max="90"
                            step="any"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Longitude</Form.Label>
                          <Form.Control
                            type="number"
                            value={
                              editingDriver.currentLocation?.longitude || ""
                            }
                            onChange={(e) =>
                              setEditingDriver({
                                ...editingDriver,
                                currentLocation: {
                                  ...editingDriver.currentLocation,
                                  longitude: parseFloat(e.target.value),
                                },
                              })
                            }
                            min="-180"
                            max="180"
                            step="any"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group className="mb-3">
                      <Form.Label>Introduction Video URL</Form.Label>
                      <Form.Control
                        type="url"
                        value={editingDriver.introductionMedia?.video || ""}
                        onChange={(e) =>
                          setEditingDriver({
                            ...editingDriver,
                            introductionMedia: {
                              ...editingDriver.introductionMedia,
                              video: e.target.value,
                            },
                          })
                        }
                        placeholder="https://..."
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Introduction Images URLs (one per line)
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={
                          editingDriver.introductionMedia?.images?.join("\n") ||
                          ""
                        }
                        onChange={(e) =>
                          setEditingDriver({
                            ...editingDriver,
                            introductionMedia: {
                              ...editingDriver.introductionMedia,
                              images: e.target.value
                                .split("\n")
                                .filter((url) => url.trim()),
                            },
                          })
                        }
                        placeholder="https://..."
                      />
                    </Form.Group>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
              <div className="mt-3">
                <Button variant="primary" type="submit" className="me-2">
                  Save Changes
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowEditDriverModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>

      {/* Edit Customer Modal */}
      <Modal
        show={showEditCustomerModal}
        onHide={() => setShowEditCustomerModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Customer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingCustomer && (
            <Form onSubmit={updateCustomerHandler}>
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
                            value={editingCustomer.firstName}
                            onChange={(e) =>
                              setEditingCustomer({
                                ...editingCustomer,
                                firstName: e.target.value,
                              })
                            }
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
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
                            required
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
                            value={editingCustomer.email}
                            onChange={(e) =>
                              setEditingCustomer({
                                ...editingCustomer,
                                email: e.target.value,
                              })
                            }
                            required
                            pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
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
                            required
                            placeholder="+1XXXXXXXXXX"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Rating</Form.Label>
                          <Form.Control
                            type="number"
                            value={editingCustomer.rating || 0}
                            onChange={(e) =>
                              setEditingCustomer({
                                ...editingCustomer,
                                rating: parseFloat(e.target.value),
                              })
                            }
                            min="0"
                            max="5"
                            step="0.1"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="1">
                  <Accordion.Header>Address</Accordion.Header>
                  <Accordion.Body>
                    <Form.Group className="mb-3">
                      <Form.Label>Street Address</Form.Label>
                      <Form.Control
                        type="text"
                        value={editingCustomer.address?.street || ""}
                        onChange={(e) =>
                          setEditingCustomer({
                            ...editingCustomer,
                            address: {
                              ...editingCustomer.address,
                              street: e.target.value,
                            },
                          })
                        }
                        required
                      />
                    </Form.Group>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>City</Form.Label>
                          <Form.Control
                            type="text"
                            value={editingCustomer.address?.city || ""}
                            onChange={(e) =>
                              setEditingCustomer({
                                ...editingCustomer,
                                address: {
                                  ...editingCustomer.address,
                                  city: e.target.value,
                                },
                              })
                            }
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>State</Form.Label>
                          <Form.Control
                            type="text"
                            maxLength={2}
                            value={editingCustomer.address?.state || ""}
                            onChange={(e) =>
                              setEditingCustomer({
                                ...editingCustomer,
                                address: {
                                  ...editingCustomer.address,
                                  state: e.target.value.toUpperCase(),
                                },
                              })
                            }
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>Zip Code</Form.Label>
                          <Form.Control
                            type="text"
                            value={editingCustomer.address?.zipCode || ""}
                            onChange={(e) =>
                              setEditingCustomer({
                                ...editingCustomer,
                                address: {
                                  ...editingCustomer.address,
                                  zipCode: e.target.value,
                                },
                              })
                            }
                            required
                            pattern="^\d{5}(-\d{4})?$"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="2">
                  <Accordion.Header>Credit Card Details</Accordion.Header>
                  <Accordion.Body>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Card Number</Form.Label>
                          <Form.Control
                            type="text"
                            value={
                              editingCustomer.creditCardDetails?.cardNumber ||
                              ""
                            }
                            onChange={(e) =>
                              setEditingCustomer({
                                ...editingCustomer,
                                creditCardDetails: {
                                  ...editingCustomer.creditCardDetails,
                                  cardNumber: e.target.value,
                                },
                              })
                            }
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Expiry Date</Form.Label>
                          <Form.Control
                            type="text"
                            value={
                              editingCustomer.creditCardDetails?.expiryDate ||
                              ""
                            }
                            onChange={(e) =>
                              setEditingCustomer({
                                ...editingCustomer,
                                creditCardDetails: {
                                  ...editingCustomer.creditCardDetails,
                                  expiryDate: e.target.value,
                                },
                              })
                            }
                            required
                            placeholder="MM/YY"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
              <div className="mt-3">
                <Button variant="primary" type="submit" className="me-2">
                  Save Changes
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowEditCustomerModal(false)}
                >
                  Cancel
                </Button>
              </div>
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
                <div className="mb-3">
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
                                placeholder="Search by first name..."
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
                                placeholder="Search by last name..."
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
                                placeholder="Search by email..."
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
                                placeholder="Search by phone..."
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
                                placeholder="Search by city..."
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
                                placeholder="State"
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
                                placeholder="Search by zip..."
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
                                placeholder="Search by make..."
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
                                placeholder="Search by model..."
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
                                placeholder="Search by year..."
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
                            placeholder="Minimum rating..."
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
                    <Button
                      variant="secondary"
                      onClick={handleResetDriverSearch}
                    >
                      Reset Filters
                    </Button>
                  </div>
                </div>
              )}
              <ListGroup>
                {filteredDrivers.map((driver) => (
                  <ListGroup.Item key={driver._id}>
                    <Accordion>
                      <Accordion.Item eventKey="0">
                        <Accordion.Header>
                          <div className="d-flex justify-content-between align-items-center w-100 pe-3">
                            <div>
                              <strong>{driver.email}</strong>
                              <Badge
                                bg={
                                  driver.status === "available"
                                    ? "success"
                                    : "secondary"
                                }
                                className="ms-2"
                              >
                                {driver.status || "N/A"}
                              </Badge>
                              <Badge bg="info" className="ms-2">
                                Rating: {driver.rating?.toFixed(1) || "N/A"}
                              </Badge>
                            </div>
                            <div>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditDriver(driver);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteDriver(driver._id);
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </Accordion.Header>
                        <Accordion.Body>
                          <Row>
                            <Col md={6}>
                              <h4>
                                {driver.firstName} {driver.lastName}
                              </h4>
                              <h6>Contact Information</h6>
                              <p className="mb-1">
                                <strong>Email:</strong> {driver.email}
                              </p>
                              <p className="mb-1">
                                <strong>Phone:</strong> {driver.phoneNumber}
                              </p>
                              <p className="mb-1">
                                <strong>Address:</strong>{" "}
                                {driver.address?.street && (
                                  <>
                                    {driver.address.street},{" "}
                                    {driver.address.city},{" "}
                                    {driver.address.state}{" "}
                                    {driver.address.zipCode}
                                  </>
                                )}
                              </p>
                            </Col>
                            <Col md={6}>
                              <h6>Car Details</h6>
                              <p className="mb-1">
                                <strong>Make:</strong>{" "}
                                {driver.carDetails?.make || "N/A"}
                              </p>
                              <p className="mb-1">
                                <strong>Model:</strong>{" "}
                                {driver.carDetails?.model || "N/A"}
                              </p>
                              <p className="mb-1">
                                <strong>Year:</strong>{" "}
                                {driver.carDetails?.year || "N/A"}
                              </p>
                            </Col>
                          </Row>
                          <Row className="mt-3">
                            <Col md={6}>
                              <h6>Location</h6>
                              <p className="mb-1">
                                <strong>Latitude:</strong>{" "}
                                {driver.currentLocation?.latitude?.toFixed(6) ||
                                  "N/A"}
                              </p>
                              <p className="mb-1">
                                <strong>Longitude:</strong>{" "}
                                {driver.currentLocation?.longitude?.toFixed(
                                  6
                                ) || "N/A"}
                              </p>
                            </Col>
                            <Col md={6}>
                              <h6>Media</h6>
                              {driver.introductionMedia?.video && (
                                <p className="mb-1">
                                  <strong>Video:</strong>{" "}
                                  <a
                                    href={driver.introductionMedia.video}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    View Video
                                  </a>
                                </p>
                              )}
                              {driver.introductionMedia?.images?.length > 0 && (
                                <p className="mb-1">
                                  <strong>Images:</strong>{" "}
                                  {driver.introductionMedia.images.map(
                                    (url, index) => (
                                      <a
                                        key={index}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="me-2"
                                      >
                                        Image {index + 1}
                                      </a>
                                    )
                                  )}
                                </p>
                              )}
                            </Col>
                          </Row>
                          {driver.reviews?.length > 0 && (
                            <Row className="mt-3">
                              <Col>
                                <h6>Reviews</h6>
                                {driver.reviews.map((review, index) => (
                                  <p key={index} className="mb-1">
                                    {review}
                                  </p>
                                ))}
                              </Col>
                            </Row>
                          )}
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
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
                <div className="mb-3">
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
                                placeholder="Search by first name..."
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
                                placeholder="Search by last name..."
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
                                placeholder="Search by email..."
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
                                placeholder="Search by phone..."
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
                                placeholder="Search by city..."
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
                                placeholder="State"
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
                                placeholder="Search by zip..."
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
                    <Button
                      variant="secondary"
                      onClick={handleResetCustomerSearch}
                    >
                      Reset Filters
                    </Button>
                  </div>
                </div>
              )}
              <ListGroup>
                {filteredCustomers.map((customer) => (
                  <ListGroup.Item key={customer._id}>
                    <Accordion>
                      <Accordion.Item eventKey="0">
                        <Accordion.Header>
                          <div className="d-flex justify-content-between align-items-center w-100 pe-3">
                            <div>
                              <strong>{customer.email}</strong>
                              <Badge bg="info" className="ms-2">
                                Rating: {customer.rating?.toFixed(1) || "N/A"}
                              </Badge>
                              {customer.creditCardDetails && (
                                <Badge bg="success" className="ms-2">
                                  Has Credit Card
                                </Badge>
                              )}
                            </div>
                            <div>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditCustomer(customer);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCustomer(customer._id);
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </Accordion.Header>
                        <Accordion.Body>
                          <Row>
                            <Col md={6}>
                              <h4>
                                {customer.firstName} {customer.lastName}
                              </h4>
                              <h6>Contact Information</h6>
                              <p className="mb-1">
                                <strong>Email:</strong> {customer.email}
                              </p>
                              <p className="mb-1">
                                <strong>Phone:</strong> {customer.phoneNumber}
                              </p>
                              <p className="mb-1">
                                <strong>Address:</strong>{" "}
                                {customer.address?.street && (
                                  <>
                                    {customer.address.street},{" "}
                                    {customer.address.city},{" "}
                                    {customer.address.state}{" "}
                                    {customer.address.zipCode}
                                  </>
                                )}
                              </p>
                            </Col>
                            <Col md={6}>
                              <h6>Credit Card Details</h6>
                              {customer.creditCardDetails ? (
                                <>
                                  <p className="mb-1">
                                    <strong>Card Number:</strong>{" "}
                                    {customer.creditCardDetails.cardNumber}
                                  </p>
                                  <p className="mb-1">
                                    <strong>Expiry Date:</strong>{" "}
                                    {customer.creditCardDetails.expiryDate}
                                  </p>
                                </>
                              ) : (
                                <p className="mb-1">No credit card on file</p>
                              )}
                            </Col>
                          </Row>
                          {customer.reviews?.length > 0 && (
                            <Row className="mt-3">
                              <Col>
                                <h6>Reviews</h6>
                                {customer.reviews.map((review, index) => (
                                  <p key={index} className="mb-1">
                                    {review}
                                  </p>
                                ))}
                              </Col>
                            </Row>
                          )}
                          {customer.ridesHistory?.length > 0 && (
                            <Row className="mt-3">
                              <Col>
                                <h6>Ride History</h6>
                                {customer.ridesHistory.map((rideId, index) => (
                                  <p key={index} className="mb-1">
                                    Ride ID: {rideId}
                                  </p>
                                ))}
                              </Col>
                            </Row>
                          )}
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
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
