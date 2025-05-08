require("dotenv").config();
const app = require("./src/app");
const mongoose = require("mongoose");
const { initializeKafka, shutdownKafka } = require("./src/config/kafka");
const  startRideRequestedConsumer = require('./src/events/ride-requested/rideRequestConsumer');
// const startRideAssignedConsumer = require('./src/events/ride-assigned/rideAssignedConsumer');

let server; // To store the Express server instance

const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");

    // Initialize Kafka (creates topics, connects producer)
    await initializeKafka();

    // Start Consumers
    startRideRequestedConsumer();
    // startRideAssignedConsumer();

    // Start Express server
    const PORT = process.env.PORT || 3000; // Default to port 3000 if not specified
    server = app.listen(PORT, () =>
      console.log(`✅ Ride service running on port ${PORT}`)
    );
  } catch (err) {
    console.error("❌ Error starting server:", err.message);
    process.exit(1); // Exit with failure
  }
};

// Graceful shutdown
const shutdown = async () => {
  console.log("\n🛑 Shutting down gracefully...");

  try {
    // Close the Express server
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) return reject(err);
          console.log("🛑 Express server closed");
          resolve();
        });
      });
    }

    // Shutdown Kafka
    await shutdownKafka();
    console.log("🛑 Kafka disconnected");

    // Disconnect MongoDB
    await mongoose.disconnect();
    console.log("🛑 MongoDB disconnected");

    process.exit(0); // Exit successfully
  } catch (err) {
    console.error("❌ Error during shutdown:", err.message);
    process.exit(1); // Exit with failure
  }
};

// Handle termination signals
process.on("SIGINT", shutdown); // Handle Ctrl+C
process.on("SIGTERM", shutdown); // Handle termination signals from cloud providers

// Start the server
startServer();
