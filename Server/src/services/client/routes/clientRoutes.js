import express from "express";
import clientDependencies from "../Dependencies/dependencies.js";
import authenticate from "../../../shared/middleware/authenticate.js";

// Create a new router instance for client-related routes
const router = express.Router();

// Destructure the clientController from the initialized dependencies
const { clientController } = clientDependencies.controller;

// Apply authentication middleware to all routes in this router
router.use(authenticate);

// Onboard a new client (accessible only to super admins)
router.post("/admin/clients/onboard", (req, res, next) =>
  clientController.createClient(req, res, next),
);

// Create a user for a client (accessible only to super admins)
router.post("/admin/clients/:clientId/users", (req, res, next) =>
  clientController.createClientUser(req, res, next),
);

// Create an API Key for a client (accessible only to super admins)
router.post("/admin/clients/:clientId/api-keys", (req, res, next) =>
  clientController.createClientApiKey(req, res, next),
);

// Get all API keys for a client (accessible only to super admins)
router.get("/admin/clients/:clientId/api-keys", (req, res, next) =>
  clientController.getClientApiKeys(req, res, next),
);

export default router;
