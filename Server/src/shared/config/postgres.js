import pg from "pg";
import config from "./index.js";
import logger from "./logger.js";

const { Pool } = pg;

/**
 * PostgreSQL Database Manager / Connector
 */
class PostgresConnection {
  constructor() {
    this.pool = null;
  }

  /**
   * Returns the PostgreSQL connection pool.
   * Creates the pool if it doesn't already exist.
   */
  getPool() {
    if (!this.pool) {
      this.pool = new Pool({
        host: config.postgres.host,
        port: config.postgres.port,
        database: config.postgres.database,
        user: config.postgres.user,
        password: config.postgres.password,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      this.pool.on("error", (err) => {
        logger.error("Unexpected error on idle PostgreSQL client", err);
      });

      logger.info(
        `PostgreSQL pool created successfully for ${config.postgres.host}:${config.postgres.port}/${config.postgres.database}`,
      );
    }

    return this.pool;
  }

  /**
   * Establishes and verifies the PostgreSQL connection.
   */
  async connect() {
    try {
      const pool = this.getPool();
      const client = await pool.connect();

      const result = await client.query("SELECT NOW()");

      client.release();

      logger.info(
        `PostgreSQL connected successfully: ${result.rows[0].now}`,
      );
    } catch (err) {
      logger.error("Failed to connect to PostgreSQL", err);
      throw err;
    }
  }

  /**
   * Tests the PostgreSQL connection.
   */
  async testConnection() {
    return this.connect();
  }

  /**
   * Executes a SQL query.
   */
  async query(text, params = []) {
    const pool = this.getPool();
    const start = Date.now();

    try {
      const result = await pool.query(text, params);
      const duration = Date.now() - start;

      logger.debug("Executed query", {
        text,
        duration,
        rows: result.rowCount,
      });

      return result;
    } catch (error) {
      logger.error("Error executing query", {
        text,
        error: error.message,
      });

      throw error;
    }
  }

  /**
   * Closes the PostgreSQL connection pool.
   */
  async disconnect() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      logger.info("PostgreSQL pool closed successfully.");
    }
  }

  /**
   * Alias for disconnect().
   */
  async close() {
    await this.disconnect();
  }
}

export default new PostgresConnection();