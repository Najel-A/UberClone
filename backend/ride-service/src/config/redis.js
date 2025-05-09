const { createClient } = require("redis");

const redisPublisher = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});
const redisSubscriber = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

// Error handling
redisPublisher.on("error", (err) => console.error("Redis Publisher Error:", err));
redisSubscriber.on("error", (err) => console.error("Redis Subscriber Error:", err));

// Connect both clients
(async () => {
  await redisPublisher.connect();
  await redisSubscriber.connect();
})();

module.exports = {
  redisPublisher,
  redisSubscriber,
};
