import BaseRepository from "./BaseRepository.js";
import User from "../../../shared/models/User.js";
import logger from "../../../shared/config/logger.js";
import AppError from "../../../shared/utils/AppError.js";

/**
 * MongoDB implementation of the UserRepository.
 * This class provides methods to interact with the User collection in MongoDB.
 * It extends the BaseRepository class and implements user-specific operations.
 */
class MongoUserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  /**
   * Creates a new user.
   * @param {Object} userData - The data for the user to create.
   * @returns {Promise<Object>} - Returns the created user object.
   */
  async create(userData) {
    try {
      let data = { ...userData };
      if (data.role === "super_admin" && !data.permissions) {
        data.permissions = {
          canCreateApiKeys: true,
          canManagerUsers: true,
          canViewAnalytics: true,
          canExportData: true,
        };
      }

      const user = new this.model(data);
      await user.save();

      logger.info("User created", { username: user.username });
      return user;
    } catch (error) {
      logger.error("Error creating user", error);

      if (error?.name === "MongoServerError" && error?.code === 11000) {
        const duplicateFields = Object.keys(error.keyValue || {});
        const fieldLabel = duplicateFields.length > 0 ? duplicateFields.join(", ") : "field";
        throw new AppError(
          `A user with the same ${fieldLabel} already exists.`,
          409,
        );
      }

      throw error;
    }
  }

  /**
   * Finds a user by their ID.
   * @param {string} userId - The ID of the user to find.
   * @returns {Promise<Object>} - Returns the user object if found.
   */

  async findById(userId) {
    try {
      const user = await this.model.findById(userId);
      return user;
    } catch (error) {
      logger.error("Error finding user by ID", error);
      throw error;
    }
  }

  /**
   * Finds a user by their username.
   * @param {string} username - The username of the user to find.
   * @returns {Promise<Object|null>} - Returns the user object if found, otherwise null.
   */

  async findByUsername(username) {
    try {
      const user = await this.model.findOne({ username });
      return user;
    } catch (error) {
      logger.error("Error finding by username", error);
      throw error;
    }
  }

  /**
   * Finds a user by their email address.
   * @param {string} email - The email address of the user to find.
   * @returns {Promise<Object|null>} - Returns the user object if found, otherwise null.
   */
  async findByEmail(email) {
    try {
      const user = await this.model.findOne({ email });
      return user;
    } catch (error) {
      logger.error("Error finding by email", error);
      throw error;
    }
  }

  /**
   * Finds all active users
   * @returns {Promise<Array>} - Returns an array of active user objects.
   */

  async findAll() {
    try {
      const users = await this.model
        .find({ isActive: true })
        .select("-password");
      return users;
    } catch (error) {
      logger.error("Error finding all users", error);
      throw error;
    }
  }
}

export default new MongoUserRepository();
