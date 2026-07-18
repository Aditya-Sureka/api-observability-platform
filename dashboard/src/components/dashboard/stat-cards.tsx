import type { DashboardStats } from "@/lib/api/dto";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/input";

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 p-5">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-2xl font-semibold tracking-tight">{value}</span>
        {hint}
      </CardContent>
    </Card>
  );
}

export function StatCards({ stats }: { stats: DashboardStats | null }) {
  if (!stats) return null;

  const errorRate = stats.errorRate;
  const errorVariant =
    errorRate >= 5 ? "destructive" : errorRate >= 1 ? "warning" : "success";

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
      <Stat label="Total Hits" value={stats.totalHits.toLocaleString()} />
      <Stat
        label="Success"
        value={stats.successHits.toLocaleString()}
        hint={<Badge variant="success">ok</Badge>}
      />
      <Stat
        label="Errors"
        value={stats.errorHits.toLocaleString()}
        hint={
          <Badge variant={errorVariant}>{errorRate}% error rate</Badge>
        }
      />
      <Stat
        label="Avg Latency"
        value={`${stats.avgLatency.toFixed(1)} ms`}
      />
      <Stat
        label="Services"
        value={stats.uniqueServices.toLocaleString()}
      />
      <Stat
        label="Endpoints"
        value={stats.uniqueEndpoints.toLocaleString()}
      />
    </div>
  );
}
