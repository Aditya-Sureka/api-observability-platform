import ResponseFormatter from "../utils/responseFormatter.js";

/**
 * Middleware to validate the API key provided in the request headers.
 * @param {Array<string>} allowedRoles - An array of allowed roles for the API key.
 * @returns {Function} - A middleware function that validates the API key.
 * @throws {Error} - Throws an error if the API key is missing or invalid.
 * This middleware checks if the authenticated user has the necessary role to access the route.
 * If the user does not have the required role, it responds with a 403 Forbidden status.
 * If the user is authorized, it calls the next middleware in stack
 */

const authorize =
  (allowedRoles = []) =>
  (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res
          .status(403)
          .json(ResponseFormatter.error("Forbidden: No user role found", 403));
      }

      // skip
      if (allowedRoles.length === 0) {
        next();
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res
          .status(403)
          .json(
            ResponseFormatter.error(
              "Forbidden: You do not have access to this resource",
              403,
            ),
          );
      }
      next();
    } catch (error) {
      return res.status(403).json(ResponseFormatter.error("Forbidden", 403));
    }
  };

export default authorize;
