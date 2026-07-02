import BaseClientRepo from "./BaseClientRepo.js";
import Client from "../../../shared/models/Client.js";
import logger from "../../../shared/config/logger.js";

/**
 * MongoClientRepo is a concrete implementation of the BaseClientRepo class that interacts with a MongoDB database to perform CRUD operations on client entities. It provides methods for creating a client, finding a client by ID or slug, finding clients based on filters, and counting clients based on filters.
 * This class uses the Mongoose model representing the client entity to perform database operations and logs relevant information using a logger.
 */
class MongoClientRepo extends BaseClientRepo {
  constructor() {
    super(Client);
  }

  /**
   * Creates a new client in the database using the provided client data.
   * @param {Object} clientData
   * @returns {Promise<Object>} - Returns a promise that resolves to the created client object.
   */
  async create(clientData) {
    try {
      const client = new this.model(clientData);
      await client.save();


      logger.info("Client created in MongoDb", {
        mongoId: client._id,
        slug: client.slug,
      });

      return client;
    } catch (error) {
      logger.error("Error creating client in MongoDb", error);
      throw error;
    }
  }

  /**
   * Finds a client in the database by their ID.
   * @param {string} clientId - The ID of the client to find.
   * @returns {Promise<Object|null>} - Returns a promise that resolves to the client object if found, or null if not found.
   */
  async findById(clientId) {
    try {
      const client = await this.model.findById(clientId);

      logger.info("Client found in MongoDb by ID", client);

      return client;
    } catch (error) {
      logger.error("Error finding client in MongoDb", error);
      throw error;
    }
  }

  /**
   * Finds a client in the database by their slug.
   * @param {string} slug - The slug of the client to find.
   * @returns {Promise<Object|null>} - Returns a promise that resolves to the client object if found, or null if not found.
   */
  async findBySlug(slug) {
    try {
      const client = await this.model.findOne({ slug });
      logger.info("Client found in MongoDb by slug", client);
      return client;
    } catch (error) {
      logger.error("Error finding client in MongoDb", error);
      throw error;
    }
  }

  /**
   * Finds clients in the database based on the provided filters and options.
   * @param {Object} filters - Query filters to find clients in the database. This parameter is optional and defaults to an empty object, which means it will return all clients if no filters are provided.
   * @param {Object} options - Query options for finding clients in the database. This parameter is optional and defaults to an empty object. It can include properties such as limit, skip, and sort to control the number of results returned, the starting point for the results, and the sorting order of the results.
   * @returns {Promise<Object>}
   */
  async find(filters = {}, options = {}) {
    try {
      const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;

      const clients = await this.model
        .find(filters)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select("-__v");
      logger.info("Clients found in MongoDb", clients);
      return clients;
    } catch (error) {
      logger.error("Error finding clients in MongoDb", error);
      throw error;
    }
  }

  /**
   * Counts the number of clients in the database that match the provided filters.
   * @param {Object} filters - Query filters to count clients in the database. This parameter is optional and defaults to an empty object, which means it will count all clients if no filters are provided.
   * @returns {Promise<number>} - Returns a promise that resolves to the count of clients matching the provided filters.
   */
  async count(filters = {}) {
    try {
      const count = await this.model.countDocuments(filters);
      logger.info("Count of clients in MongoDb", { count });
      return count;
    } catch (error) {
      logger.error("Error counting clients in MongoDb", error);
      throw error;
    }
  }
}

export default new MongoClientRepo();
