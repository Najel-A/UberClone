const axios = require('axios');

describe('Billing Service', () => {
  const baseURL = 'http://localhost:3003/api/billing';
  const customerSSN = '123-45-6789';
  const driverSSN = '555-66-7777';

  it('should create a customer wallet successfully', async () => {
    const createResponse = await axios.post(`${baseURL}/createCustomerWallet`, { ssn: customerSSN });
    expect(createResponse.status).toBe(201);
    expect(createResponse.data).toHaveProperty('message', 'Customer wallet created');
    expect(createResponse.data.wallet).toHaveProperty('ssn', customerSSN);
  });

  it('should add to customer wallet successfully', async () => {
    const response = await axios.post(`${baseURL}/addToCustomerWallet`, {
      ssn: customerSSN,
      amount: 100,
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('message', 'Wallet topped up');
    expect(response.data).toHaveProperty('balance');
    expect(response.data.balance).toBeGreaterThanOrEqual(5); // Ensure balance is updated
  });

  it('should check customer wallet successfully', async () => {
    const response = await axios.post(`${baseURL}/customerWalletCheck`, {
      ssn: customerSSN,
      amount: 50,
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('canAfford');
    expect(response.data).toHaveProperty('balance');
    expect(response.data).toHaveProperty('message');
    if (response.data.canAfford) {
      expect(response.data.message).toBe('Sufficient balance');
    } else {
      expect(response.data.message).toBe('Insufficient balance');
    }
  });

  it('should delete a customer wallet successfully', async () => {
    const deleteResponse = await axios.delete(`${baseURL}/deleteCustomerWallet`, {
      data: { ssn: customerSSN },
    });
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.data).toHaveProperty('message', 'Customer wallet deleted successfully');
  });

  it('should create a driver wallet successfully', async () => {
    const createResponse = await axios.post(`${baseURL}/createDriverWallet`, { ssn: driverSSN });
    expect(createResponse.status).toBe(201);
    expect(createResponse.data).toHaveProperty('message', 'Driver wallet created');
    expect(createResponse.data.wallet).toHaveProperty('ssn', driverSSN);
  });

  it('should add to driver wallet successfully', async () => {
    const response = await axios.post(`${baseURL}/addToDriverWallet`, {
      ssn: driverSSN,
      amount: 5,
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('message', 'Wallet topped up');
    expect(response.data).toHaveProperty('balance');
    expect(response.data.balance).toBeGreaterThanOrEqual(5); 
  });

  it('should delete a driver wallet successfully', async () => {
    const deleteResponse = await axios.delete(`${baseURL}/deleteDriverWallet`, {
      data: { ssn: driverSSN },
    });
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.data).toHaveProperty('message', 'Driver wallet deleted successfully');
  });
});