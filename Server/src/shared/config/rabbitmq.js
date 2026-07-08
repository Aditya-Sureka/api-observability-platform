import amqp from "amqplib";
import config from "./index.js";
import logger from "./logger.js";

class RabbitMQConnection {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.isConnecting = false;
    this.isClosing = false;
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
    if (!this.connection || !this.channel) return "disconnected";
    if (this.isClosing) return "closing";
    return "connected";
  }

  async close() {
    if (this.isClosing) {
      return;
    }

    this.isClosing = true;

    try {
      if (this.channel) {
        try {
          await this.channel.close();
        } catch (error) {
          if (error?.message !== "Channel closed") {
            throw error;
          }
        }
        this.channel = null;
      }
      if (this.connection) {
        try {
          await this.connection.close();
        } catch (error) {
          if (error?.message !== "Connection closing" && error?.message !== "Connection closed") {
            throw error;
          }
        }
        this.connection = null;
      }

      logger.info("RabbitMq connection closed");
    } catch (error) {
      logger.error("Error is closing RabbitMQ connection : ", error);
    } finally {
      this.isClosing = false;
    }
  }

  async disconnect() {
    return this.close();
  }
}

export default new RabbitMQConnection();
