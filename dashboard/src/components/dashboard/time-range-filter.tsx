"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type RangeParams = {
  startTime?: string;
  endTime?: string;
  clientId?: string;
};

const PRESETS: { key: string; label: string; ms: number }[] = [
  { key: "1h", label: "1h", ms: 60 * 60 * 1000 },
  { key: "24h", label: "24h", ms: 24 * 60 * 60 * 1000 },
  { key: "7d", label: "7d", ms: 7 * 24 * 60 * 60 * 1000 },
  { key: "30d", label: "30d", ms: 30 * 24 * 60 * 60 * 1000 },
];

function startFromNow(ms: number) {
  return new Date(Date.now() - ms).toISOString();
}

export function TimeRangeFilter({
  value,
  onChange,
  showClientPicker = false,
}: {
  value: RangeParams;
  onChange: (next: RangeParams) => void;
  showClientPicker?: boolean;
}) {
  const [preset, setPreset] = useState("24h");
  const [clientId, setClientId] = useState(value.clientId ?? "");

  function selectPreset(key: string, ms: number) {
    setPreset(key);
    onChange({
      startTime: startFromNow(ms),
      clientId: clientId || undefined,
    });
  }

  function onClientChange(v: string) {
    setClientId(v);
    onChange({ ...value, clientId: v || undefined });
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex gap-1">
        {PRESETS.map((p) => (
          <Button
            key={p.key}
            size="sm"
            variant={preset === p.key ? "default" : "outline"}
            onClick={() => selectPreset(p.key, p.ms)}
            className={cn(preset === p.key && "ring-2 ring-primary/40")}
          >
            {p.label}
          </Button>
        ))}
      </div>

      {showClientPicker && (
        <div className="flex flex-col gap-1">
          <Label htmlFor="clientId">Client ID (admin)</Label>
          <Input
            id="clientId"
            placeholder="All clients"
            value={clientId}
            onChange={(e) => onClientChange(e.target.value)}
            className="w-56"
          />
        </div>
      )}
    </div>
  );
}
