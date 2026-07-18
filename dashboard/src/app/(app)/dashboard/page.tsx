"use client";

import { useState } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import { useProfile } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api/client";
import { StatCards } from "@/components/dashboard/stat-cards";
import { TimeSeriesChart } from "@/components/dashboard/time-series-chart";
import { TopEndpointsChart } from "@/components/dashboard/top-endpoints-chart";
import {
  TimeRangeFilter,
  type RangeParams,
} from "@/components/dashboard/time-range-filter";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const DEFAULT_RANGE: RangeParams = {
  startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
};

export default function DashboardPage() {
  const { data: user } = useProfile();
  const [params, setParams] = useState<RangeParams>(DEFAULT_RANGE);

  const { data, isLoading, isError, error, refetch, isFetching } =
    useDashboard(params);

  const isAdmin = user?.role === "super_admin";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            API traffic, errors and latency across your services.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TimeRangeFilter
            value={params}
            onChange={setParams}
            showClientPicker={isAdmin}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? "Refreshing…" : "Refresh"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : isError ? (
        <Card>
          <CardContent className="flex flex-col gap-3 p-8">
            <p className="text-sm font-medium text-destructive">
              {error instanceof ApiError
                ? `Failed to load dashboard (${error.status}): ${error.message}`
                : "Failed to load dashboard."}
            </p>
            <p className="text-sm text-muted-foreground">
              Ensure the monitoring backend is running and you have the
              <code className="mx-1 rounded bg-muted px-1">canViewAnalytics</code>
              permission.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <StatCards stats={data?.stats ?? null} />

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle>Traffic over time</CardTitle>
                <CardDescription>
                  Total hits vs errors in the selected window.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TimeSeriesChart data={data?.recentActivity ?? []} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top endpoints</CardTitle>
                <CardDescription>By total hit count.</CardDescription>
              </CardHeader>
              <CardContent>
                <TopEndpointsChart data={data?.topEndpoints ?? []} />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl bg-muted"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="h-80 animate-pulse rounded-xl bg-muted xl:col-span-2" />
        <div className="h-80 animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  );
}
