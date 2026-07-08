import express from "express";
import cors from "cors";
import helmet from "helmet";
import config from "./shared/config/index.js";
import logger from "./shared/config/logger.js";
import mongodb from "./shared/config/mongo.js";
import postgres from "./shared/config/postgres.js";
import rabbitmq from "./shared/config/rabbitmq.js";
import errorHandler from "./shared/middleware/errorHandler.js";
import ResponseFormatter from "./shared/utils/responseFormatter.js";
import cookieParser from "cookie-parser";


// Routers
import authRouter from "./services/auth/routes/authRouter.js";
import clientRouter from "./services/client/routes/clientRoutes.js";
import ingestRouter from "./services/ingest/routes/ingestRoutes.js";




/**
 * Initialize and configure the Express application with necessary middleware, database connections, and error handling.
 */
const app = express();

app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Request logging middleware
 * Logs the HTTP method, path, IP address, and user agent for each incoming request.
 */

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });
  next();
});

/**
 * Health check endpoint
 */

app.get("/health", (req, res) => {
  res.status(200).json(
    ResponseFormatter.success(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        upTime: process.uptime(),
      },
      "Service is healthy",
    ),
  );
});

/**
 * Root endpoint
 * Provides basic information about the API service and available endpoints.
 */

app.get("/", (req, res) => {
  res.status(200).json(
    ResponseFormatter.success(
      {
        service: "API Hit Monitoring System",
        version: "1.0.0",
        endpoints: {
          health: "/health",
          auth: "/api/auth",
          ingest: "/api/hit",
          analytics: "/api/analytics",
        },
      },
      "API Service Information",
    ),
  );
});

/**
 * API Routes
 */

app.use("/api/auth", authRouter);
app.use("/api/hit", ingestRouter);
// app.use("/api/analytics", analyticsRouter);
app.use("/api", clientRouter);

/**
 * 404 Handler
 */
app.use((req, res) => {
  res.status(404).json(ResponseFormatter.error("Endpoint not found", 404));
});

app.use(errorHandler);

/**
 * Initialize database connections and start the server.
 */

async function initializeConnection() {
  try {
    logger.info("Initializing database connections...");

    // MongoDB and RabbitMQ remain required for the app's core flow.
    await mongodb.connect();
    try {
      await postgres.connect();
    } catch (error) {
      logger.warn("PostgreSQL is unavailable; starting without it for now.", {
        message: error.message,
        code: error.code,
      });
    }
    try {
      await rabbitmq.connect();
    } catch (error) {
      logger.warn("RabbitMQ is unavailable; starting without it for now.", {
        message: error.message,
        code: error.code,
      });
    }

    logger.info("All connections establised sucessfully");
  } catch (error) {
    logger.error("Failed to initialize connections: ", error);
    throw error;
  }
}
/**
 * Start the Express server after establishing database connections.
 * Also handles graceful shutdown on process termination signals.
 * On shutdown, it disconnects from MongoDB, PostgreSQL, and RabbitMQ before exiting the process.
 * If any error occurs during the shutdown process, it logs the error and exits with a non-zero status code.
 */

async function startServer() {
  try {
    await initializeConnection();

    const server = app.listen(config.port, () => {
      logger.info(`Server is running on port ${config.port}`);
      logger.info(`Environment: ${config.node_env}`);
      logger.info(`API available at: http://localhost:${config.port}`);
    });

    const gracefulShutdown = async (signal) => {
      logger.info(`Received ${signal}. Closing server...`);

      server.close(async () => {
        logger.info("HTTP server closed.");

        try {
          await mongodb.disconnect();
          await postgres.close();
          await rabbitmq.close();
          logger.info("All connections closed successfully.");
          process.exit(0);
        } catch (error) {
          logger.error("Error during shutdown: ", error);
          process.exit(1);
        }
      });
    };

    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

    // Handle uncaught exceptions and unhandled promise rejections
    process.on("uncaughtException", (error) => {
      logger.error("Uncaught Exception: ", error);
      gracefulShutdown("uncaughtException");
    });

    process.on("unhandledRejection", (reason, promise) => {
      logger.error("Unhandled Rejection at: ", promise, "reason: ", reason);
      gracefulShutdown("unhandledRejection");
    });
  } catch (error) {
    logger.error("Error starting server: ", error);
    process.exit(1);
  }
}

startServer();
