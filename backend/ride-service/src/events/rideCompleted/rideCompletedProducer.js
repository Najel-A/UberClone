// events/rideKafka/rideProducer.js
const { kafka, topics } = require("../../config/kafka");
const producer = kafka.producer();

exports.connectProducer = async () => {
  await producer.connect();
  console.log("✅ Kafka Producer connected");
};

exports.emitCompletedRideEvent = async (message) => {
  console.log("📤 Emitting ride.request event:", message);
  await producer.send({
    topic: topics.RIDE_COMPLETED,
    messages: [{ value: JSON.stringify(message) }],
  });
};


