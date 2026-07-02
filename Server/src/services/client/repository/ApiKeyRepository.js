import logger from "../../../shared/config/logger.js";
import BaseApiKeyRepo from "./BaseApiKeyRepo.js";
import ApiKey from "../../../shared/models/ApiKey.js";

/**
 * MongoApiKeyRepository is a concrete implementation of the BaseApiKeyRepo class that interacts with a MongoDB database to perform CRUD operations on API key entities. It provides methods for creating an API key, finding an API key by its value, finding API keys by client ID, and counting API keys by client ID.
 * This class uses the Mongoose model representing the API key entity to perform database operations and logs relevant information using a logger.
 */
class MongoApiKeyRepository extends BaseApiKeyRepo {
  constructor() {
    super(ApiKey);
  }

  /**
   * Creates a new API key in the database.
   * @param {Object} apiKeyData - The data for the new API key.
   * @returns {Promise<Object>} - A promise resolving to the created API key.
   */
  async create(apiKeyData) {
    try {
      const apiKey = new this.model(apiKeyData);
      await apiKey.save();
      logger.info("API key created in MongoDb", {
        keyId: apiKey.keyId,
      });
      return apiKey;
    } catch (error) {
      logger.error("Error creating API key in MongoDb", error);
      throw error;
    }
  }

  /**
   * Finds an API key by its value.
   * @param {string} keyValue - The value of the API key to find.
   * @param {boolean} includeInactive - Whether to include inactive API keys.
   * @returns {Promise<Object|null>} - A promise resolving to the found API key or null.
   */
  async findByKeyValue(keyValue, includeInactive = false) {
    try {
      const filter = { keyValue };
      if (!includeInactive) {
        filter.isActive = true;
      }

      const apiKey = await this.model.findOne(filter).populate("clientId");
      return apiKey;
    } catch (error) {
      logger.error("Error finding API key in MongoDb", error);
      throw error;
    }
  }

  /**
   * Finds API keys by client ID.
   * @param {string} clientId - The ID of the client for which to find API keys.
   * @param {Object} filters - Additional filters for the query.
   * @returns {Promise<Array>} - A promise resolving to an array of found API keys.
   */
  async findByClientId(clientId, filters = {}) {
    try {
      const query = { clientId, ...filters };
      const apiKeys = await this.model
        .find(query)
        .populate("metadata.createdBy", "username email")
        .sort({ createdAt: -1 });
      return apiKeys;
    } catch (error) {
      logger.error("Error finding API keys by client ID in MongoDb", error);
      throw error;
    }
  }

  /**
   * Counts API keys by client ID.
   * @param {string} clientId - The ID of the client for which to count API keys.
   * @param {Object} filters - Additional filters for the query.
   * @returns {Promise<number>} - A promise resolving to the count of found API keys.
   */
  async countByClientId(clientId, filters = {}) {
    try {
      const query = { clientId, ...filters };
      const count = await this.model.countDocuments(query);
      return count;
    } catch (error) {
      logger.error("Error counting API keys by client ID in MongoDb", error);
      throw error;
    }
  }
}

export default new MongoApiKeyRepository();
