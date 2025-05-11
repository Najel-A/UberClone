const axios = require('axios');

describe('Customer Service - CRUD Operations', () => {
  let customerId; // Store the customer ID for reuse in tests

  const customerData = {
    _id: "123-45-6789",
    firstName: "John",
    lastName: "Doe",
    address: {
      street: "123 Main St",
      city: "San Francisco",
      state: "CA",
      zipCode: "94105",
    },
    phoneNumber: "555-123-4567",
    email: "john.doe@example.com",
    password: "SecurePassword123",
    creditCardDetails: {
      cardNumber: "4111111111111111",
      expiryDate: "12/25",
    },
  };

  it('should create a new customer successfully', async () => {
    const response = await axios.post('http://localhost:3000/api/customers', customerData);

    expect(response.status).toBe(201); // Ensure the response status is 201 Created
    expect(response.data).toHaveProperty('_id', customerData._id); // Verify the customer ID
    customerId = response.data._id; // Store the customer ID for later tests
  });

  it('should retrieve all customers successfully', async () => {
    const response = await axios.get('http://localhost:3000/api/customers');

    expect(response.status).toBe(200); // Ensure the response status is 200 OK
    expect(response.data).toBeInstanceOf(Array); // Verify the response is an array
    expect(response.data.some((customer) => customer._id === customerId)).toBe(true); // Verify the created customer is in the list
  });

  it('should log in the customer successfully', async () => {
    const loginData = {
      email: customerData.email,
      password: customerData.password,
    };

    const response = await axios.post('http://localhost:3000/api/customers/login', loginData);

    expect(response.status).toBe(200); // Ensure the response status is 200 OK
    expect(response.data).toHaveProperty('message', 'Login successful'); // Verify the success message
    expect(response.data).toHaveProperty('token'); // Verify a token is returned
  });

  it('should log out the customer successfully', async () => {
    const response = await axios.post('http://localhost:3000/api/customers/logout');

    expect(response.status).toBe(200); // Ensure the response status is 200 OK
    expect(response.data).toHaveProperty('message', 'Logout successful'); // Verify the success message
  });

  it('should delete the customer successfully', async () => {
    const response = await axios.delete(`http://localhost:3000/api/customers/${customerId}`);

    expect(response.status).toBe(200); // Ensure the response status is 200 OK
    expect(response.data).toHaveProperty('message', 'Customer deleted successfully'); // Verify the success message

    // Verify the customer no longer exists
    try {
      await axios.get(`http://localhost:3000/api/customers/${customerId}`);
    } catch (error) {
      expect(error.response.status).toBe(404); // Ensure the response status is 404 Not Found
    }
  });
});