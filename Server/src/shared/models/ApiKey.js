import mongoose from "mongoose";
import SecurityUtils from "../utils/SecurityUtils.js";

const apiKeySchema = new mongoose.Schema(
  {
    keyId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    keyValue: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100,
    },
    description: {
      type: String,
      maxLength: 500,
      default: "",
    },
    environment: {
      type: String,
      enum: ["development", "staging", "production", "testing"],
      default: "production",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    permissions: {
      canIngest: {
        type: Boolean,
        default: true,
      },
      canReadAnalytics: {
        type: Boolean,
        default: true,
      },
      allowedServices: [
        {
          type: String,
          trim: true,
        },
      ],
    },
    // usage and per-key rate limiting removed
    security: {
      allowedIPs: [
        {
          type: String,
          validate: {
            validator: function (v) {
              // Validate IP address format (IPv4 and IPv6)
              return (
                /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-fA-F0-9:]+)$/.test(
                  v,
                ) || v === "0.0.0.0/0"
              );
            },
            message: (props) => `${props.value} is not a valid IP address!`,
          },
        },
      ],
      allowedOrigins: [
        {
          type: String,
          validate: {
            validator: function (v) {
              // Validate URL format
              return (
                /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(
                  v,
                ) || v === "*"
              );
            },
            message: (props) => `${props.value} is not a valid URL!`,
          },
        },
      ],
      lastRotated: {
        type: Date,
        default: Date.now,
      },
      rotationWarningDays: {
        type: Number,
        default: 30,
      },
    },
    expiresAt: {
      type: Date,
      default: () => {
        const days = parseInt(process.env.API_KEY_EXPIRY_DAYS || "365");
        return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      },
      index: true,
    },
    metadata: {
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      purpose: {
        type: String,
        trim: true,
        maxLength: 200,
      },
      tags: [
        {
          type: String,
          trim: true,
          maxLength: 50,
        },
      ],
    },
    createdAt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "api_keys",
  },
);

apiKeySchema.index({ clientId: 1, isActive: 1 });
apiKeySchema.index({ keyValue: 1, isActive: 1 });
apiKeySchema.index({ environment: 1, clientId: 1 });
apiKeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

apiKeySchema.methods.isExpired = function () {
  if (!this.expiresAt) return false;
  return new Date(this.expiresAt) < new Date();
};

const ApiKey = mongoose.model("ApiKey", apiKeySchema);

export default ApiKey;
