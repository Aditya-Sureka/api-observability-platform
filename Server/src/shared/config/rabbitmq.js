import amqp from "amqplib";
import config from "./index.js";
import logger from "./logger.js";

class RabbitMQConnection {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.isConnecting = false;
  }

  async connect() {
    if (this.channel) {
      return this.channel;
    }
    if (this.isConnecting) {
      await new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!this.isConnecting) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      });
      return this.channel;
    }

    try {
      this.isConnecting = true;

      logger.info(`Connecting to RabbitMQ at ${config.rabbitmq.url}...`);
      this.connection = await amqp.connect(config.rabbitmq.url);
      this.channel = await this.connection.createChannel();

      // Creating key | Queue name
      const dlqName = `${config.rabbitmq.queue}.dlq`; // api_hits | api_hits.dlq

      // DL Queue
      await this.channel.assertQueue(dlqName, {
        durable: true,
      });

      // Normal Queue
      await this.channel.assertQueue(config.rabbitmq.queue, {
        durable: true,
        arguments: {
          "x-dead-letter-exchange": "", // Default exchange
          "x-dead-letter-routing-key": dlqName, // Route to DL queue
        },
      });

      logger.info(
        `Connected to RabbitMQ and asserted normal queue: ${config.rabbitmq.queue}`,
      );

      this.connection.on("close", () => {
        logger.warn("RabbitMQ Connection closed");
        this.connection = null;
        this.channel = null;
      });

      this.connection.on("error", (err) => {
        logger.error("RabbitMQ Connection error", { error: err.message });
        this.connection = null;
        this.channel = null;
      });

      this.isConnecting = false;
      return this.channel;
    } catch (error) {
      this.isConnecting = false;
      logger.error("Error connecting to RabbitMQ", { error: error.message });
      throw error;
    }
  }

  getChannel() {
    return this.channel;
  }

  getStatus() {
    if (!this.connect || !this.channel) return "disconnected";
    if (this.connect.closing) return "closing";
    return "connected";
  }

  async close() {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }

      logger.info("RabbitMq connection closed");
    } catch (error) {
      logger.error("Error is closing RabbitMQ connection : ", error);
    }
  }
}

export default new RabbitMQConnection();
