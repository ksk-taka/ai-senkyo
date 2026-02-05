"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  PieChart,
  Pie,
} from "recharts";
import { getPartyColor } from "@/lib/utils/colors";

interface PartyPrediction {
  party: string;
  seatRange: [number, number];
  change: number;
}

interface StackedData {
  name: string;
  single: number;  // 小選挙区
  proportional: number;  // 比例
  total: number;
  change: number;
}

interface PartyChartProps {
  predictions: PartyPrediction[];
  singleMemberData?: PartyPrediction[];
  proportionalData?: PartyPrediction[];
  mode?: "total" | "single" | "proportional";
  onPartyClick?: (party: string) => void;
  selectedParty?: string | null;
  showPieChart?: boolean;
}

export default function PartyChart({
  predictions,
  singleMemberData,
  proportionalData,
  mode = "total",
  onPartyClick,
  selectedParty,
  showPieChart = true,
}: PartyChartProps) {
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");
  // 積み上げデータの生成（totalモード用）
  const stackedData: StackedData[] = predictions.map((p) => {
    const singleSeats = singleMemberData?.find(s => s.party === p.party);
    const propSeats = proportionalData?.find(s => s.party === p.party);

    const singleValue = singleSeats
      ? Math.round((singleSeats.seatRange[0] + singleSeats.seatRange[1]) / 2)
      : 0;
    const propValue = propSeats
      ? Math.round((propSeats.seatRange[0] + propSeats.seatRange[1]) / 2)
      : 0;

    return {
      name: p.party,
      single: singleValue,
      proportional: propValue,
      total: singleValue + propValue,
      change: p.change,
    };
  });

  // 通常モード用データ
  const simpleData = predictions.map((p) => ({
    name: p.party,
    seats: Math.round((p.seatRange[0] + p.seatRange[1]) / 2),
    min: p.seatRange[0],
    max: p.seatRange[1],
    change: p.change,
  }));

  // 合計モードで積み上げデータがあるか
  const useStacked = mode === "total" && singleMemberData && proportionalData;

  // 円グラフ用データ（積み上げモードの場合はstackedDataを使用）
  const pieData = useStacked
    ? stackedData
        .filter(d => d.total > 0)
        .map(d => ({
          name: d.name,
          value: d.total,
          color: getPartyColor(d.name),
        }))
    : simpleData
        .filter(d => d.seats > 0)
        .map(d => ({
          name: d.name,
          value: d.seats,
          color: getPartyColor(d.name),
        }));

  // 総議席数
  const totalSeats = pieData.reduce((sum, d) => sum + d.value, 0);

  // カスタムラベル（議席数表示）
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    value,
    name,
  }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    value: number;
    name: string;
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const percent = (value / totalSeats) * 100;

    // 小さいセグメントはラベルを表示しない
    if (percent < 3) return null;

    return (
      <text
        x={x}
        y={y}
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={percent < 5 ? 10 : 12}
        fontWeight="bold"
      >
        {value}
      </text>
    );
  };

  // 色を薄くするヘルパー関数
  const lightenColor = (hex: string, amount: number = 0.4): string => {
    const color = hex.replace("#", "");
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);

    const newR = Math.round(r + (255 - r) * amount);
    const newG = Math.round(g + (255 - g) * amount);
    const newB = Math.round(b + (255 - b) * amount);

    return `rgb(${newR}, ${newG}, ${newB})`;
  };

  // 円グラフコンポーネント
  const PieChartView = () => (
    <div className="w-full h-80 flex flex-col items-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={120}
            innerRadius={40}
            dataKey="value"
            onClick={(data) => onPartyClick?.(data.name)}
            style={{ cursor: onPartyClick ? "pointer" : "default" }}
          >
            {pieData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke={selectedParty === entry.name ? "#000" : "#fff"}
                strokeWidth={selectedParty === entry.name ? 3 : 1}
              />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                const percent = ((data.value / totalSeats) * 100).toFixed(1);
                return (
                  <div className="bg-white p-3 rounded shadow-lg border">
                    <p className="font-bold text-gray-900">{data.name}</p>
                    <p className="text-sm text-gray-800">
                      <strong>{data.value}議席</strong> ({percent}%)
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            formatter={(value) => (
              <span className="text-xs text-gray-700">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      <p className="text-center text-sm text-gray-500 -mt-2">
        合計: {totalSeats}議席
      </p>
    </div>
  );

  // チャートタイプ切り替えボタン
  const ChartToggle = () => (
    <div className="flex justify-end mb-2 gap-1">
      <button
        onClick={() => setChartType("bar")}
        className={`px-3 py-1 text-xs rounded ${
          chartType === "bar"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        棒グラフ
      </button>
      <button
        onClick={() => setChartType("pie")}
        className={`px-3 py-1 text-xs rounded ${
          chartType === "pie"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        円グラフ
      </button>
    </div>
  );

  if (useStacked) {
    return (
      <div className="w-full">
        {showPieChart && <ChartToggle />}
        {chartType === "pie" && showPieChart ? (
          <PieChartView />
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stackedData}
                layout="vertical"
                margin={{ left: 100, right: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 250]} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12, fill: "#374151" }}
              width={100}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as StackedData;
                  return (
                    <div className="bg-white p-3 rounded shadow-lg border">
                      <p className="font-bold text-gray-900">{data.name}</p>
                      <p className="text-sm text-gray-800">
                        合計: <strong>{data.total}議席</strong>
                      </p>
                      <p className="text-sm text-gray-600">
                        小選挙区: {data.single}議席
                      </p>
                      <p className="text-sm text-gray-600">
                        比例代表: {data.proportional}議席
                      </p>
                      {data.change !== 0 && (
                        <p
                          className={`text-sm font-medium ${
                            data.change > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          前回比: {data.change > 0 ? "+" : ""}
                          {data.change}
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value) => (
                <span className="text-sm text-gray-600">
                  {value === "single" ? "小選挙区" : "比例代表"}
                </span>
              )}
            />
            {/* 小選挙区（濃い色） */}
            <Bar
              dataKey="single"
              stackId="a"
              radius={[0, 0, 0, 0]}
              onClick={(data) => onPartyClick?.(data.name)}
              style={{ cursor: onPartyClick ? "pointer" : "default" }}
            >
              {stackedData.map((entry, index) => (
                <Cell
                  key={`cell-single-${index}`}
                  fill={getPartyColor(entry.name)}
                  stroke={selectedParty === entry.name ? "#000" : "transparent"}
                  strokeWidth={selectedParty === entry.name ? 2 : 0}
                />
              ))}
            </Bar>
            {/* 比例代表（薄い色） */}
            <Bar
              dataKey="proportional"
              stackId="a"
              radius={[0, 4, 4, 0]}
              onClick={(data) => onPartyClick?.(data.name)}
              style={{ cursor: onPartyClick ? "pointer" : "default" }}
            >
              {stackedData.map((entry, index) => (
                <Cell
                  key={`cell-prop-${index}`}
                  fill={lightenColor(getPartyColor(entry.name))}
                  stroke={selectedParty === entry.name ? "#000" : "transparent"}
                  strokeWidth={selectedParty === entry.name ? 2 : 0}
                />
              ))}
            </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  }

  // 通常モード（single / proportional）
  return (
    <div className="w-full">
      {showPieChart && <ChartToggle />}
      {chartType === "pie" && showPieChart ? (
        <PieChartView />
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={simpleData} layout="vertical" margin={{ left: 100, right: 30 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 250]} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12, fill: "#374151" }}
            width={100}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-3 rounded shadow-lg border">
                    <p className="font-bold text-gray-900">{data.name}</p>
                    <p className="text-sm text-gray-800">
                      予測: {data.min}〜{data.max}議席
                    </p>
                    {data.change !== 0 && (
                      <p
                        className={`text-sm font-medium ${
                          data.change > 0
                            ? "text-green-600"
                            : data.change < 0
                            ? "text-red-600"
                            : "text-gray-700"
                        }`}
                      >
                        前回比: {data.change > 0 ? "+" : ""}
                        {data.change}
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="seats"
            radius={[0, 4, 4, 0]}
            onClick={(data) => onPartyClick?.(data.name)}
            style={{ cursor: onPartyClick ? "pointer" : "default" }}
          >
            {simpleData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getPartyColor(entry.name)}
                stroke={selectedParty === entry.name ? "#000" : "transparent"}
                strokeWidth={selectedParty === entry.name ? 2 : 0}
              />
            ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      )}
    </div>
  );
}
