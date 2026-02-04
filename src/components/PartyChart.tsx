"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { partyColors } from "@/lib/utils/colors";

interface PartyPrediction {
  party: string;
  seatRange: [number, number];
  change: number;
}

interface PartyChartProps {
  predictions: PartyPrediction[];
}

export default function PartyChart({ predictions }: PartyChartProps) {
  const data = predictions.map((p) => ({
    name: p.party,
    seats: Math.round((p.seatRange[0] + p.seatRange[1]) / 2),
    min: p.seatRange[0],
    max: p.seatRange[1],
    change: p.change,
  }));

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 80, right: 30 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, "dataMax + 20"]} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12 }}
            width={80}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-3 rounded shadow-lg border">
                    <p className="font-bold">{data.name}</p>
                    <p className="text-sm">
                      予測: {data.min}〜{data.max}議席
                    </p>
                    <p
                      className={`text-sm ${
                        data.change > 0
                          ? "text-green-600"
                          : data.change < 0
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      前回比: {data.change > 0 ? "+" : ""}
                      {data.change}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="seats" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={partyColors[entry.name] || "#808080"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
