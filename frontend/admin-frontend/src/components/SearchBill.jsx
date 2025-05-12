import React, { useState, useEffect, useCallback } from "react";
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
  Badge,
  Accordion,
} from "react-bootstrap";
import debounce from "lodash/debounce";

const SearchBill = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchParams, setSearchParams] = useState({
    billId: "",
    customerId: "",
    driverId: "",
    minAmount: "",
    maxAmount: "",
    startDate: "",
    endDate: "",
    status: "",
  });

  // Create debounced search handler
  const debouncedSearch = useCallback(
    debounce((params) => {
      fetchBills(params);
    }, 300),
    []
  );

  // Fetch all bills on component mount
  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async (params = {}) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      // Add search parameters to query string
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await axios.get(
        `${process.env.REACT_APP_ADMIN_BACKEND_PORT_URL}/api/admin/billing${
          queryParams.toString() ? `?${queryParams.toString()}` : ""
        }`
      );
      setBills(response.data);
      setError("");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch bills";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchParamChange = (field, value) => {
    setSearchParams((prev) => ({
      ...prev,
      [field]: value,
    }));
    debouncedSearch({ ...searchParams, [field]: value });
  };

  const handleResetSearch = () => {
    setSearchParams({
      billId: "",
      customerId: "",
      driverId: "",
      minAmount: "",
      maxAmount: "",
      startDate: "",
      endDate: "",
      status: "",
    });
    fetchBills();
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

  return (
    <Container className="py-4">
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      {loading && <Alert variant="info">Loading...</Alert>}

      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h3 className="mb-0">Bills</h3>
          <div>
            <Button
              variant="outline-primary"
              size="sm"
              className="me-2"
              onClick={() => setShowSearch(!showSearch)}
            >
              {showSearch ? "Hide Search" : "Advanced Search"}
            </Button>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={handleResetSearch}
            >
              Show All
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {showSearch && (
            <div className="mb-3">
              <Accordion defaultActiveKey="0">
                <Accordion.Item eventKey="0">
                  <Accordion.Header>Basic Information</Accordion.Header>
                  <Accordion.Body>
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Bill ID</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Search by bill ID..."
                            value={searchParams.billId}
                            onChange={(e) =>
                              handleSearchParamChange("billId", e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Customer ID</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Search by customer ID..."
                            value={searchParams.customerId}
                            onChange={(e) =>
                              handleSearchParamChange(
                                "customerId",
                                e.target.value
                              )
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Driver ID</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Search by driver ID..."
                            value={searchParams.driverId}
                            onChange={(e) =>
                              handleSearchParamChange(
                                "driverId",
                                e.target.value
                              )
                            }
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Min Amount</Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="Minimum amount..."
                            value={searchParams.minAmount}
                            onChange={(e) =>
                              handleSearchParamChange(
                                "minAmount",
                                e.target.value
                              )
                            }
                            min="0"
                            step="0.01"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Max Amount</Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="Maximum amount..."
                            value={searchParams.maxAmount}
                            onChange={(e) =>
                              handleSearchParamChange(
                                "maxAmount",
                                e.target.value
                              )
                            }
                            min="0"
                            step="0.01"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Status</Form.Label>
                          <Form.Select
                            value={searchParams.status}
                            onChange={(e) =>
                              handleSearchParamChange("status", e.target.value)
                            }
                          >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="cancelled">Cancelled</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Start Date</Form.Label>
                          <Form.Control
                            type="datetime-local"
                            value={searchParams.startDate}
                            onChange={(e) =>
                              handleSearchParamChange(
                                "startDate",
                                e.target.value
                              )
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>End Date</Form.Label>
                          <Form.Control
                            type="datetime-local"
                            value={searchParams.endDate}
                            onChange={(e) =>
                              handleSearchParamChange("endDate", e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
              <div className="d-flex justify-content-end mt-3">
                <Button variant="secondary" onClick={handleResetSearch}>
                  Reset Filters
                </Button>
              </div>
            </div>
          )}

          <ListGroup>
            {bills.map((bill) => (
              <ListGroup.Item key={bill._id}>
                <Accordion>
                  <Accordion.Item eventKey="0">
                    <Accordion.Header>
                      <div className="d-flex justify-content-between align-items-center w-100 pe-3">
                        <div>
                          <strong>Bill #{bill._id}</strong>
                          <Badge
                            bg={
                              bill.status === "paid"
                                ? "success"
                                : bill.status === "pending"
                                ? "warning"
                                : "danger"
                            }
                            className="ms-2"
                          >
                            {bill.status || "N/A"}
                          </Badge>
                          <Badge bg="info" className="ms-2">
                            {formatAmount(bill.amount)}
                          </Badge>
                        </div>
                        <div>
                          <small className="text-muted">
                            {formatDate(bill.createdAt)}
                          </small>
                        </div>
                      </div>
                    </Accordion.Header>
                    <Accordion.Body>
                      <Row>
                        <Col md={6}>
                          <h6>Customer Information</h6>
                          <p className="mb-1">
                            <strong>Customer ID:</strong> {bill.customerId}
                          </p>
                          <p className="mb-1">
                            <strong>Customer Name:</strong>{" "}
                            {bill.customerName || "N/A"}
                          </p>
                        </Col>
                        <Col md={6}>
                          <h6>Driver Information</h6>
                          <p className="mb-1">
                            <strong>Driver ID:</strong> {bill.driverId}
                          </p>
                          <p className="mb-1">
                            <strong>Driver Name:</strong>{" "}
                            {bill.driverName || "N/A"}
                          </p>
                        </Col>
                      </Row>
                      <Row className="mt-3">
                        <Col md={6}>
                          <h6>Ride Details</h6>
                          <p className="mb-1">
                            <strong>Pickup Location:</strong>{" "}
                            {bill.pickupLocation || "N/A"}
                          </p>
                          <p className="mb-1">
                            <strong>Dropoff Location:</strong>{" "}
                            {bill.dropoffLocation || "N/A"}
                          </p>
                          <p className="mb-1">
                            <strong>Distance:</strong>{" "}
                            {bill.distance ? `${bill.distance} miles` : "N/A"}
                          </p>
                        </Col>
                        <Col md={6}>
                          <h6>Payment Details</h6>
                          <p className="mb-1">
                            <strong>Amount:</strong> {formatAmount(bill.amount)}
                          </p>
                          <p className="mb-1">
                            <strong>Payment Method:</strong>{" "}
                            {bill.paymentMethod || "N/A"}
                          </p>
                          <p className="mb-1">
                            <strong>Payment Status:</strong>{" "}
                            {bill.paymentStatus || "N/A"}
                          </p>
                        </Col>
                      </Row>
                      {bill.notes && (
                        <Row className="mt-3">
                          <Col>
                            <h6>Notes</h6>
                            <p className="mb-1">{bill.notes}</p>
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
    </Container>
  );
};

export default SearchBill;
