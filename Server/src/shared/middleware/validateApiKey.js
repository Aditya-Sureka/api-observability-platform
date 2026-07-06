import ResponseFormatter from "../utils/responseFormatter.js";
import logger from "../config/logger.js";
import clientContainer from "../../services/client/Dependencies/dependencies.js";

/**
 * Middleware to validate API keys against database
 * Used for external services posting events
 */
const validateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
      logger.warn("API request without API Key", {
        path: req.path,
        ip: req.ip,
      });
      return res
        .status(401)
        .json(ResponseFormatter.error("API key is missing", 401));
    }

    // Get client and API key from database
    const result = await clientContainer.services.clientService.getClientByApiKey(
      apiKey,
    );
    if (!result) {
      logger.warn("Invalid API Key", {
        path: req.path,
        ip: req.ip,
        apiKey: apiKey.substring(0, 8) + "...", // Log only the first 8 characters for security
      });
      return res
        .status(403)
        .json(ResponseFormatter.error("Invalid API key", 403));
    }

    const { client, apiKey: apiKeyObj } = result;

    // Check if client is active
    if (!client.isActive) {
      logger.warn("Inactive client attempted to access API", {
        path: req.path,
        ip: req.ip,
        clientId: client._id,
      });
      return res
        .status(403)
        .json(ResponseFormatter.error("Inactive client", 403));
    }

    // Usage limits removed — no monthly usage checks

    // Check API key permissions
    if (!apiKeyObj.permissions?.canIngest) {
      logger.warn("Client without ingest permission attempted to access API", {
        path: req.path,
        ip: req.ip,
        apiKeyId: apiKeyObj._id,
      });
      return res
        .status(403)
        .json(ResponseFormatter.error("Insufficient permissions", 403));
    }

    // No API key usage tracking required

    // Add client and API key info to request
    req.client = client;
    req.apiKey = apiKeyObj;

    logger.debug("API Key validated successfully", {
      clientId: client._id,
      clientName: client.name,
      apiKeyId: apiKeyObj._id,
    });
    next();
  } catch (error) {
    logger.error("Error validating API key:", error);
    return res
      .status(500)
      .json(ResponseFormatter.error("Internal server error", 500));
  }
};

export default validateApiKey;
