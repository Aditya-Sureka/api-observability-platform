"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TimeSeriesPoint } from "@/lib/api/dto";

const C = {
  primary: "#6366f1",
  destructive: "#f87171",
  border: "#1e293b",
  muted: "#94a3b8",
  card: "#0f172a",
  foreground: "#e2e8f0",
};

function fmt(bucket: string | number) {
  const n = typeof bucket === "number" ? bucket : Number(bucket);
  const d = new Date(n);
  if (isNaN(d.getTime())) return String(bucket);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function TimeSeriesChart({ data }: { data: TimeSeriesPoint[] }) {
  const rows = data.map((p) => ({
    label: fmt(p.timeBucket),
    total: p.totalHits,
    errors: p.errorHits,
  }));

  if (rows.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
        No activity in the selected range.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={rows} margin={{ left: 0, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={C.primary} stopOpacity={0.4} />
            <stop offset="95%" stopColor={C.primary} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gErr" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={C.destructive} stopOpacity={0.4} />
            <stop offset="95%" stopColor={C.destructive} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
        <XAxis dataKey="label" stroke={C.muted} fontSize={12} />
        <YAxis stroke={C.muted} fontSize={12} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            color: C.foreground,
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey="total"
          name="Total hits"
          stroke={C.primary}
          fill="url(#gTotal)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="errors"
          name="Errors"
          stroke={C.destructive}
          fill="url(#gErr)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
