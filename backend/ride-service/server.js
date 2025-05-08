const app = require("./src/app");
const mongoose = require("mongoose");
const socketIo = require("socket.io");
const { redisSubscriber } = require("./src/config/redis");
const http = require("http");
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
      console.log("Redis message:", message);
      io.emit("ride-update", JSON.parse(message));
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
    console.error("Error starting server:", err);
  }
};

// Start the server
startServer();
