const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "test-producer",
  brokers: ["localhost:29092"],
});

const producer = kafka.producer();

const run = async () => {
  await producer.connect();

  const message = {
    topic: "test-topic",
    messages: [{ value: "Hello KafkaJS user!" }],
  };

  await producer.send(message);
  console.log("Message sent!");

  await producer.disconnect();
};

run().catch(console.error);
