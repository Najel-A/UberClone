require("dotenv").config();
const app = require("./src/app");
const mongoose = require("mongoose");
const socketIo = require("socket.io");
const { redisSubscriber } = require("./src/config/redis");
const http = require("http");
const { initializeKafka, shutdownKafka } = require("./src/config/kafka");
const startConsumer = require("./src/events/rideRequest/rideRequestConsumer"); // ✅ Update path if needed
const { connectProducer } = require("./src/events/rideRequest/rideRequestProducer");

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

    // Start Kafka consumer
    await startConsumer.startRideRequestConsumer(); // ✅ This runs your consumer on server start

    const server = http.createServer(app);

    // Initialize WebSocket server
    const io = socketIo(server, {
      cors: {
        origin: "*", // adjust this for production
      },
    });

    const CHANNEL = "ride-events"; // Used for ride event updates to simulate ride

    // Subsriber is to listen to the updates made from the publisher in the ride simulation
    redisSubscriber.subscribe(CHANNEL, (message) => {
      console.log("Received Redis message:", message);
      try {
        const parsedMessage = JSON.parse(message);
        console.log("Emitting ride-update event:", parsedMessage);
        io.emit("ride-update", parsedMessage);  // This should emit the message to frontend
      } catch (err) {
        console.error("Error parsing message:", err);
      }
    });
    

    // Configure a redis for the movements of the ride simulation

    io.on("connection", (socket) => {
      console.log("New WebSocket client connected");

      socket.on("disconnect", () => {
        console.log("WebSocket client disconnected");
      });
    });

    // Start your express app
    server.listen(process.env.PORT, () =>
      console.log("Ride service running on port", process.env.PORT)
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

