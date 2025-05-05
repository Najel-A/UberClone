const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "ride-producer",
  brokers: ["localhost:29092"],
});

const producer = kafka.producer(); // <-- this was missing

const connectProducer = async () => {
  await producer.connect();
  console.log("Kafka Producer connected");
};

const emitRideEvent = async (message) => {
  console.log("Emitting ride event:", message);
  //   await connectProducer(); // Ensure the producer is connected before sending

  await producer.send({
    topic: "ride-requested",
    messages: [{ value: JSON.stringify(message) }],
  });
};

const emitSuccessfulRideEvent = async (message) => {
  console.log("Emitting successful ride event:", message);
  //   await connectProducer(); // Ensure the producer is connected before sending

  await producer.send({
    topic: "ride-created",
    messages: [{ value: JSON.stringify(message) }],
  });
};

module.exports = {
  connectProducer,
  emitRideEvent,
  emitSuccessfulRideEvent,
};
