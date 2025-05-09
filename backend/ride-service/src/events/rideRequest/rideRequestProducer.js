const { kafka, topics } = require("../../config/kafka");

const producer = kafka.producer();

exports.connectProducer = async () => {
  await producer.connect();
  console.log("✅ Kafka Producer connected");
};

exports.emitRideEvent = async (message) => {
  console.log("📤 Emitting ride event:", message);
  await producer.send({
    topic: topics.RIDE_REQUESTS,
    messages: [{ value: JSON.stringify(message) }],
  });
};


