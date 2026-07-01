import config from "../../../shared/config/index.js";
import AppError from "../../../shared/utils/AppError.js";
import jwt from "jsonwebtoken";
import logger from "../../../shared/config/logger.js";
import bcrypt from "bcryptjs";

/**
 * AuthService handles user authentication and authorization related operations such as onboarding super admin, generating tokens, and formatting user responses.
 * It interacts with the user repository to perform database operations and uses JWT for token generation.
 */

export class AuthService {
  constructor(userRepository) {
    if (!userRepository) {
      throw new Error("User repository is required");
    }
    this.userRepository = userRepository;
  }

  /**
   * Generates a JWT token for the given user.
   * @param {Object} user - The user object containing user details.
   * @returns {string} The generated JWT token.
   */
  generateToken(user) {
    const { _id, email, username, role, clientId } = user;

    const payload = {
      userId: _id,
      username,
      email,
      role,
      clientId,
    };
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  /**
   * Formats a user object for response purposes, removing sensitive information.
   * @param {Object} user - The user object to format.
   * @returns {Object} The formatted user object.
   */
  formatUserForResponse(user) {
    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;
    return userObj;
  }

  /**
   * Compares a user-entered password with a hashed password.
   * @param {string} userEnteredPassword - The password entered by the user.
   * @param {string} hashedPassword - The hashed password stored in the database.
   * @returns {Promise<boolean>} A promise that resolves to true if the passwords match, false otherwise.
   */
  async comparePassword(userEnteredPassword, hashedPassword) {
    return await bcrypt.compare(userEnteredPassword, hashedPassword);
  }

  /**
   * Onboards a new super admin user.
   * @param {Object} superAdminData - The data for the new super admin user.
   * @returns {Promise<Object>} A promise that resolves to the created user object and authentication token.
   */
  async onboardSuperAdmin(superAdminData) {
    try {
      const existingUser = await this.userRepository.findAll();

      if (existingUser && existingUser.length > 0) {
        throw new AppError("Super admin onboarding is disabled", 403);
      }

      const user = await this.userRepository.create(superAdminData);
      const token = this.generateToken(user);

      logger.info("Super admin onboarded successfully", {
        username: user.username,
      });

      return {
        user: this.formatUserForResponse(user),
        token,
      };
    } catch (error) {
      logger.error("Error onboarding super admin", error);
      throw error;
    }
  }

  /**
   * Registers a new user with the provided user data.
   * @param {Object} userData - The data of the user to be registered
   * @returns {Promise<Object>} A promise that resolves to the created user object and authentication token.
   */
  async register(userData) {
    try {
      const existingUser = await this.userRepository.findByUsername(
        userData.username,
      );
      if (existingUser) {
        throw new AppError("Username already exists", 409);
      }

      const existingEmail = await this.userRepository.findByEmail(
        userData.email,
      );
      if (existingEmail) {
        throw new AppError("Email already exists", 409);
      }

      const user = await this.userRepository.create(userData);
      const token = this.generateToken(user);

      logger.info("User registered successfully", {
        username: user.username,
      });

      return {
        user: this.formatUserForResponse(user),
        token,
      };
    } catch (error) {
      logger.error("Error registering user", error);
      throw error;
    }
  }

  /**
   *
   * @param {string} username - The username of the user attempting to log in.
   * @param {string} password - The password of the user attempting to log in.
   * @returns {Promise<Object>} - Returns an object containing the user details and a JWT token if login is successful.
   */
  async login(username, password) {
    try {
      const user = await this.userRepository.findByUsername(username);

      if (!user) {
        throw new AppError("Invalid username or password", 401);
      }

      if (!user.isActive) {
        throw new AppError("User account is inactive", 403);
      }

      const isPasswordValid = await this.comparePassword(
        password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new AppError("Invalid username or password", 401);
      }

      const token = this.generateToken(user);

      logger.info("User logged in successfully", {
        username: user.username,
      });

      return {
        user: this.formatUserForResponse(user),
        token,
      };
    } catch (error) {
      logger.error("Error logging in user", error);
      throw error;
    }
  }

  /**
   *
   * @param {string} userId - The ID of the user
   * @returns {Promise<Object>} - Returns an object containing the user profile details if found.
   */
  async getProfile(userId) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      return this.formatUserForResponse(user);
    } catch (error) {
      logger.error("Error fetching user profile", error);
      throw error;
    }
  }

  async checkSuperAdminPermissions(userId) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      return user.role === APPLICATION_ROLES.SUPER_ADMIN;
    } catch (error) {
      logger.error("Error checking super admin permissions", error);
      throw error;
    }
  }
}
