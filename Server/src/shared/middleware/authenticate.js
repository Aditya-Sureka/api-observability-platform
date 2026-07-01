import config from "../config/index.js";
import ResponseFormatter from "../utils/responseFormatter.js";
import jwt from "jsonwebtoken";
import logger from "../config/logger.js";

/**
 * Middleware to validate the API key provided in the request headers.
 * It checks for the presence of the 'x-api-key' header and verifies its validity.
 * If the API key is valid, it allows the request to proceed to the next middleware or route handler.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - A promise that resolves when the middleware has completed its execution.
 */

const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies.authToken) {
      token = req.cookies.authToken;
    }

    if (!token) {
      return res
        .status(401)
        .json(ResponseFormatter.error("Unauthorized: No token provided", 401));
    }
    const decoded = jwt.verify(token, config.jwt.secret);

    const { userId, email, username, role, clientId } = decoded;
    req.user = { userId, email, username, role, clientId };
    
    next();
  } catch (error) {
    logger.error("Error occurred while authenticating user:", {
      error: error.message,
      path: req.path,
    });

    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json(ResponseFormatter.error("Unauthorized: Token expired", 401));
    }

    return res
      .status(401)
      .json(ResponseFormatter.error("Unauthorized: Invalid token", 401));
  }
};

export default authenticate;
