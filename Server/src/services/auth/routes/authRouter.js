import express from "express";
import rateLimit from "express-rate-limit";
import dependencies from "../Dependencies/dependencies.js";
import authorize from "../../../shared/middleware/authorize.js";
import authenticate from "../../../shared/middleware/authenticate.js";
import validate from "../../../shared/middleware/validate.js";
import requestLogger from "../../../shared/middleware/requestLogger.js";
import {
  onboardSuperAdminSchema,
  loginSchema,
  registrationSchema,
} from "../validation/authSchema.js";
import { APPLICATION_ROLES } from "../../../shared/constants/roles.js";

const router = express.Router();
const { controller } = dependencies;
const authController = controller.authController;

// Brute-force protection for credential endpoints.
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // 10 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    status: 429,
    error: "Too many authentication attempts, please try again later.",
  },
});

router.post(
  "/onboard-super-admin",
  requestLogger,
  authLimiter,
  validate(onboardSuperAdminSchema),
  (req, res, next) => authController.onboardSuperAdmin(req, res, next),
);

router.post(
  "/register",
  requestLogger,
  authenticate,
  authorize([APPLICATION_ROLES.SUPER_ADMIN]),
  validate(registrationSchema),
  (req, res, next) => authController.register(req, res, next),
);

router.post(
  "/login",
  requestLogger,
  authLimiter,
  validate(loginSchema),
  (req, res, next) => authController.login(req, res, next),
);

router.get("/profile", requestLogger, authenticate, (req, res, next) =>
  authController.getProfile(req, res, next),
);

router.post("/logout", requestLogger, (req, res, next) =>
  authController.logout(req, res, next)
);
export default router;
