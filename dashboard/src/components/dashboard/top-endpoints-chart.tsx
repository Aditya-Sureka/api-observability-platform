"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TopEndpoint } from "@/lib/api/dto";

const C = {
  primary: "#6366f1",
  destructive: "#f87171",
  border: "#1e293b",
  muted: "#94a3b8",
  card: "#0f172a",
  foreground: "#e2e8f0",
};

export function TopEndpointsChart({ data }: { data: TopEndpoint[] }) {
  const rows = data.map((e) => ({
    name: `${e.method} ${e.endpoint}`,
    value: e.totalHits,
    errors: e.errorHits,
  }));

  if (rows.length === 0) {
    return (
      <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
        No endpoints recorded yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(240, rows.length * 44)}>
      <BarChart
        data={rows}
        layout="vertical"
        margin={{ left: 8, right: 16 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
        <XAxis
          type="number"
          stroke={C.muted}
          fontSize={12}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          stroke={C.muted}
          fontSize={12}
          width={170}
        />
        <Tooltip
          cursor={{ fill: C.border, opacity: 0.3 }}
          contentStyle={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            color: C.foreground,
            fontSize: 12,
          }}
        />
        <Bar dataKey="value" name="Hits" fill={C.primary} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
