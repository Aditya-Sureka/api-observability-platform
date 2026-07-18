import { api } from "./client";
import type { DashboardData } from "./dto";

export type DashboardParams = {
  startTime?: string;
  endTime?: string;
  clientId?: string;
};

function withQuery(path: string, params?: DashboardParams) {
  if (!params) return path;
  const qs = new URLSearchParams();
  if (params.startTime) qs.set("startTime", params.startTime);
  if (params.endTime) qs.set("endTime", params.endTime);
  if (params.clientId) qs.set("clientId", params.clientId);
  const q = qs.toString();
  return q ? `${path}?${q}` : path;
}

export const analyticsApi = {
  dashboard: (params?: DashboardParams) =>
    api.get<DashboardData>(withQuery("/api/analytics/dashboard", params)),

  stats: (params?: DashboardParams) =>
    api.get<DashboardData["stats"]>(withQuery("/api/analytics/stats", params)),
};
