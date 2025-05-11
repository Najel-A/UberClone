const axios = require('axios');

describe('Driver Service Routes', () => {
    let driverId;
    let token;

    it('should create a new driver successfully', async () => {
        const driverData = {
            _id: '123-45-6789',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            password: 'password123',
            phoneNumber: '+11234567890',
            address: {
                street: '123 Main St',
                city: 'San Francisco',
                state: 'CA',
                zipCode: '94105',
            },
            carDetails: {
                make: 'Toyota',
                model: 'Camry',
                year: 2020,
            },
        };

        const response = await axios.post('http://localhost:3001/api/drivers/signup', driverData);

        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('_id', driverData._id);
        expect(response.data).toHaveProperty('email', driverData.email);

        driverId = response.data._id; 
    });

    it('should retrieve the created driver by ID', async () => {
        const response = await axios.get(`http://localhost:3001/api/drivers/${driverId}`);

        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('_id', driverId);
        expect(response.data).toHaveProperty('firstName', 'John');
    });

    it('should log in a driver successfully', async () => {
        const loginData = {
            email: 'john.doe@example.com',
            password: 'password123',
        };

        const response = await axios.post('http://localhost:3001/api/drivers/login', loginData);

        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('token');

        token = response.data.token; // Save the token for later tests
    });

    it('should log out the driver successfully', async () => {
        const response = await axios.post('http://localhost:3001/api/drivers/logout', {}, {
            headers: { Authorization: `Bearer ${token}` },
        });

        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('message', 'Logout successful');
    });

    it('should fail to update driver information with invalid data', async () => {
        const invalidUpdateData = {
            firstName: '',
            lastName: '',
        };

        try {
            await axios.put(`http://localhost:3001/api/drivers/${driverId}`, invalidUpdateData, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (error) {
            expect(error.response.status).toBe(400);
            expect(error.response.data).toHaveProperty('message', 'Validation failed');
        }
    });

    it('should retrieve all drivers successfully', async () => {
        const response = await axios.get('http://localhost:3001/api/drivers');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fail to retrieve a non-existent driver', async () => {
        try {
            await axios.get('http://localhost:3001/api/drivers/non-existent-id');
        } catch (error) {
            expect(error.response.status).toBe(404);
            expect(error.response.data).toHaveProperty('message', 'Driver not found');
        }
    });

    it('should delete the created driver successfully', async () => {
        const response = await axios.delete(`http://localhost:3001/api/drivers/${driverId}`);

        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('message', 'Driver deleted successfully');
    });
});