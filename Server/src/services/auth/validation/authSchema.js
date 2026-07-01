import { isValidRole } from "../../../shared/constants/roles.js";
import SecurityUtils from "../../../shared/utils/SecurityUtils.js";

/**
 * Validation schema for onboarding a super admin user
 */
export const onboardSuperAdminSchema = {
  username: {
    required: true,
  },
  email: {
    required: true,
  },
  password: {
    required: true,
    minLength: 8,
    custom: (value) => {
      const validation = SecurityUtils.validatePassword(value);
      return validation.success ? null : validation.errors.join(". ");
    },
  },
};

/**
 * Validation schema for user registration
 */
export const registrationSchema = {
  username: {
    required: true,
  },
  email: {
    required: true,
  },
  password: {
    required: true,
    minLength: 6,
  },
  role: {
    required: true,
    custom: (value) => {
      if (!value) return null;
      return isValidRole(value) ? null : "Invalid role provided";
    },
  },
};

/**
 * Validation schema for user login
 */
export const loginSchema = {
  username: { required: true },
  password: { required: true },
};
