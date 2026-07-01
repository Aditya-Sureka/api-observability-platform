/**
 * BaseRepository is an abstract class that defines the basic CRUD operations for a repository.
 * It serves as a base class for specific repository implementations that interact with different data models.
 */

export default class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    throw new Error("Method not implemented");
  }

  async findById(id) {
    throw new Error("Method not implemented");
  }

  async findByUsername(username) {
    throw new Error("Method not implemented");
  }

  async findByEmail(email) {
    throw new Error("Method not implemented");
  }

  async findAll() {
    throw new Error("Method not implemented");
  }
}
