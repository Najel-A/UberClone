const axios = require("axios");
const { MongoClient } = require("mongodb");

describe("Admin Controller", () => {
  let token;
  let db;
  let client;

  beforeAll(async () => {
    client = new MongoClient("mongodb://localhost:27017");
    await client.connect();
    db = client.db("uberClone");
  });

  afterAll(async () => {
    const result = await db.collection("admins").deleteOne({ email: "jane.doe@mail.com" });
    console.log("Delete Result:", result);
    await client.close();
  });

  it("should sign up a new admin", async () => {
    const response = await axios.post("http://localhost:3002/api/admin/signup", {
      _id: "111-22-3333",
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@mail.com",
      password: "password123",
      address: {
        street: "789 Example Lane",
        city: "San Francisco",
        state: "CA",
        zipCode: "94105",
      },
      phoneNumber: "415-555-6789",
    });

    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty("_id");
    expect(response.data).toHaveProperty("firstName", "Jane");
    expect(response.data).toHaveProperty("lastName", "Doe");
    expect(response.data).toHaveProperty("email", "jane.doe@mail.com");
    expect(response.data).toHaveProperty("address.street", "789 Example Lane");
  });

  it("should log in successfully with valid credentials", async () => {
    const response = await axios.post("http://localhost:3002/api/admin/login", {
      email: "jane.doe@mail.com",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("message", "Login successful");
    expect(response.data).toHaveProperty("token");

    token = response.data.token; // Save the token for logout test
  });

  it("should log out successfully", async () => {
    const response = await axios.post(
      "http://localhost:3002/api/admin/logout",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("message", "Logout successful");
  });
});