/**
 * BaseClientRepo is an abstract class that defines the interface for client repository implementations.
 * It provides method signatures for common operations such as creating a client, finding a client by ID or slug, finding clients based on filters, and counting clients based on filters.
 */

export default class BaseClientRepo {
    /**
     * Constructor for the BaseClientRepo class.
     * @param {*} model - The model representing the client entity in the database. This model is used to perform database operations related to clients.
     */
  constructor(model) {
    this.model = model;
  }

  async create(clientData) {
    throw new Error("Method not implemented.");
  }

  async findById(clientId) {
    throw new Error("Method not implemented.");
  }

  async findBySlug(slug) {
    throw new Error("Method not implemented.");
  }

  async find(filters, options) {
    throw new Error("Method not implemented.");
  }

  async count(filters) {
    throw new Error("Method not implemented.");
  }
}
