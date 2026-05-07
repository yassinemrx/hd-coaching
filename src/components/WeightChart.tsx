"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

type Point = { date: string; weightKg: number };

export default function WeightChart({ data }: { data: Point[] }) {
  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        No weight logs yet — log your first weight above.
      </div>
    );
  }
  const formatted = data.map((d) => ({
    date: d.date,
    label: format(new Date(d.date), "MMM d"),
    weightKg: d.weightKg,
  }));
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formatted} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748b" }} />
          <YAxis
            domain={["dataMin - 1", "dataMax + 1"]}
            tick={{ fontSize: 12, fill: "#64748b" }}
            width={40}
          />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
            formatter={(v: number) => [`${v} kg`, "Weight"]}
          />
          <Line
            type="monotone"
            dataKey="weightKg"
            stroke="#1f8253"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
