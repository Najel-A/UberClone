const axios = require('axios');

describe('Billing Service', () => {
  const baseURL = 'http://localhost:3003/api/billing';

  it('should add to customer wallet successfully', async () => {
    const response = await axios.post(`${baseURL}/addToCustomerWallet`, {
      ssn: '123-45-6789',
      amount: 5,
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('message', 'Wallet topped up');
    expect(response.data).toHaveProperty('balance');
    expect(response.data.balance).toBeGreaterThanOrEqual(5); // Ensure balance is updated
  });

  it('should add to driver wallet successfully', async () => {
    const response = await axios.post(`${baseURL}/addToDriverWallet`, {
      ssn: '555-66-7777',
      amount: 5,
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('message', 'Amount withdrawn');
    expect(response.data).toHaveProperty('balance');
    expect(response.data.balance).toBeGreaterThanOrEqual(5); // Ensure balance is updated
  });

  it('should check customer wallet successfully', async () => {
    const response = await axios.post(`${baseURL}/customerWalletCheck`, {
      ssn: '123-45-6789',
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
});