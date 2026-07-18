"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsApi, type DashboardParams } from "@/lib/api/analytics";

export function useDashboard(params?: DashboardParams) {
  return useQuery({
    queryKey: ["dashboard", params],
    queryFn: () => analyticsApi.dashboard(params),
    placeholderData: (prev) => prev,
  });
}
