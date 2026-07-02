/**
 * BaseApiKeyRepo is an abstract class that defines the interface for API key repository implementations. It provides method signatures for creating, finding, and counting API keys in the database. Subclasses should implement these methods to interact with the underlying data store.
 * This class serves as a base for concrete implementations that handle API key entities, allowing for consistent interaction with the database across different implementations.
 */

export default class BaseApiKeyRepo {
  /**
   * Constructor for the BaseApiKeyRepo class.
   * @param {*} model - The model representing the API key entity in the database. This model is used to perform database operations related to API keys.
   */
  constructor(model) {
    this.model = model;
  }

  async create(apiKeyData) {
    throw new Error("Method not implemented.");
  }

  async findByKeyValue(keyValue, includeInactive) {
    throw new Error("Method not implemented.");
  }

  async findByClientId(clientId, filters) {
    throw new Error("Method not implemented.");
  }

  async countByClientId(clientId, filters) {
    throw new Error("Method not implemented.");
  }
}
