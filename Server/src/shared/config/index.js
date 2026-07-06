// Global level config :=

import dotenv from "dotenv";

dotenv.config();

const config = {
  node_env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),

  mongo: {
    uri: process.env.MONGO_URI || "mongodb://localhost:27017/api_monitoring_db",
    dbName: process.env.MONGO_DB_NAME || "api_monitoring_db",
  },

  postgres: {
    host: process.env.PG_HOST || "localhost",
    port: parseInt(process.env.PG_PORT || "5432", 10),
    database: process.env.PG_DATABASE || "api_monitoring_db",
    user: process.env.PG_USER || "postgres",
    password: process.env.PG_PASSWORD || "password",
  },

  rabbitmq: {
    url: process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672",
    queue: process.env.RABBITMQ_QUEUE || "api_hits",
    publisherConfirms:
      process.env.RABBITMQ_PUBLISHER_CONFIRMS === "true" || false, // Msg queue me sent krne ke baad ackg receive hua hai ya nahi iske liye TRUE rkha hai, if FALSE hai toh msg sent hone ke baad it will forget everything.
    retryAttempts: parseInt(process.env.RABBITMQ_RETRY_ATTEMPTS || "3", 10),
    retryDelay: parseInt(process.env.RABBITMQ_RETRY_DELAY || "1000", 10),
  },

  jwt: {
    secret: process.env.JWT_SECRET || "secure_jwt",
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX || "1000", 10), // 1000 REQ / 15 MIN PER IP
  },

  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expiresIn: 24 * 60 * 60 * 1000, // 24 hours
  },
};

export default config;
