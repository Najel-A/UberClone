const app = require("./src/app");
const mongoose = require("mongoose");
const { initializeKafka } = require("./src/config/kafka");
const startConsumer = require("./src/events/rideRequest/rideRequestConsumer"); // ✅ Update path if needed
const { connectProducer } = require("./src/events/rideRequest/rideRequestProducer");

require("dotenv").config();

const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // Connect Kafka producer
    await connectProducer(); // ✅ Connect Kafka producer here

    // Start Kafka consumer
    await startConsumer.startRideRequestConsumer(); // ✅ This runs your consumer on server start

    // Start your express app
    app.listen(process.env.PORT, () =>
      console.log("Ride service running on port", process.env.PORT)
    );
  } catch (err) {
    console.error("Error starting server:", err);
  }
};

// Start the server
startServer();
