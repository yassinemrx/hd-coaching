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
      <div className="flex h-64 items-center justify-center text-sm text-ink-400">
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
          <CartesianGrid stroke="#2e2e2e" strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#a1a1aa" }} stroke="#3f3f46" />
          <YAxis
            domain={["dataMin - 1", "dataMax + 1"]}
            tick={{ fontSize: 12, fill: "#a1a1aa" }}
            stroke="#3f3f46"
            width={40}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #2e2e2e",
              background: "#171717",
              color: "#fafafa",
            }}
            labelStyle={{ color: "#a1a1aa" }}
            itemStyle={{ color: "#d4af37" }}
            formatter={(v: number) => [`${v} kg`, "Weight"]}
          />
          <Line
            type="monotone"
            dataKey="weightKg"
            stroke="#d4af37"
            strokeWidth={2}
            dot={{ r: 3, fill: "#d4af37" }}
            activeDot={{ r: 5, fill: "#f0c649" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
