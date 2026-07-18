import { z } from "zod";

export const roleSchema = z.enum(["super_admin", "client_admin", "client_viewer"]);
export type Role = z.infer<typeof roleSchema>;

export const permissionsSchema = z.object({
  canCreateApiKeys: z.boolean().optional(),
  canManagerUsers: z.boolean().optional(),
  canViewAnalytics: z.boolean().optional(),
  canExportData: z.boolean().optional(),
});

export const userSchema = z.object({
  _id: z.string(),
  username: z.string(),
  email: z.string(),
  role: roleSchema,
  clientId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  permissions: permissionsSchema.optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type User = z.infer<typeof userSchema>;

export const topEndpointSchema = z.object({
  serviceName: z.string(),
  endpoint: z.string(),
  method: z.string(),
  totalHits: z.number(),
  errorHits: z.number(),
  avgLatency: z.union([z.number(), z.string()]),
  errorRate: z.union([z.number(), z.string()]),
});
export type TopEndpoint = z.infer<typeof topEndpointSchema>;

export const timeSeriesPointSchema = z.object({
  serviceName: z.string().optional(),
  endpoint: z.string().optional(),
  method: z.string().optional(),
  totalHits: z.number(),
  errorHits: z.number(),
  avgLatency: z.union([z.number(), z.string()]),
  minLatency: z.union([z.number(), z.string()]).optional(),
  maxLatency: z.union([z.number(), z.string()]).optional(),
  timeBucket: z.union([z.string(), z.number()]),
});
export type TimeSeriesPoint = z.infer<typeof timeSeriesPointSchema>;

export const dashboardStatsSchema = z.object({
  totalHits: z.number(),
  errorHits: z.number(),
  successHits: z.number(),
  errorRate: z.number(),
  avgLatency: z.number(),
  uniqueServices: z.number(),
  uniqueEndpoints: z.number(),
  timeRange: z
    .object({ start: z.unknown(), end: z.unknown() })
    .optional(),
});
export type DashboardStats = z.infer<typeof dashboardStatsSchema>;

export const dashboardSchema = z.object({
  stats: dashboardStatsSchema.nullable(),
  topEndpoints: z.array(topEndpointSchema).nullable(),
  recentActivity: z.array(timeSeriesPointSchema).nullable(),
});
export type DashboardData = z.infer<typeof dashboardSchema>;

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const onboardSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers and underscores only"),
    email: z.string().min(1, "Email is required"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });
export type OnboardInput = z.infer<typeof onboardSchema>;
