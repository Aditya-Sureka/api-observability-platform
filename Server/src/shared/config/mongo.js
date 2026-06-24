import mongoose from "mongoose";
import config from "./index.js";
import logger from "./logger.js";

// Singleton pattern to ensure a single instance of the MongoDB connection

/**
 * MongoDB database Manager / Connector
 */

class MongoConnection {
  constructor() {
    this.connection = null;
  }

  /**
   * Connects to the MongoDB database using Mongoose.
   * If a connection already exists, it returns the existing
   * connection. Otherwise, it establishes a new connection
   * using the provided configuration.
   * @returns {Promise<mongoose.Connection>} The Mongoose connection instance.
   */

  async connect() {
    try {
      if (this.connection) {
        logger.info("MongoDB connection already established.");
        return this.connection;
      }

      await mongoose.connect(config.mongo.uri, {
        dbName: config.mongo.dbName,
      });
      logger.info(
        `MongoDB connected successfully to ${config.mongo.uri}/${config.mongo.dbName}`,
      );
      ``;

      this.connection.on("error", (err) => {
        logger.error("MongoDB connection error:", err);
      });

      this.connection.on("disconnected", () => {
        logger.warn("MongoDB connection disconnected.");
      });
      return this.connection;
    } catch (error) {
      logger.error("Error connecting to MongoDB:", error);
      throw error;
    }
  }

  /**
   * Disconnects from the MongoDB database if a connection exists.
   * If no connection exists, it does nothing.
   * @returns {Promise<void>}
   */
  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.disconnect();
        this.connection = null;
        logger.info("MongoDB connection closed.");
      }
    } catch (error) {
      logger.error("Error disconnecting from MongoDB:", error);
      throw error;
    }
  }

  /**
   * Gets the current MongoDB connection instance.
   * @returns {mongoose.Connection} The Mongoose connection instance.
   */
  getConnection() {
    return this.connection;
  }
}

export default new MongoConnection();
