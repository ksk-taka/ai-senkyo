"use client";

import { partyColors } from "@/lib/utils/colors";

interface PredictionCardProps {
  title: string;
  party: string;
  confidence: "high" | "medium" | "low";
  description?: string;
  onClick?: () => void;
}

export default function PredictionCard({
  title,
  party,
  confidence,
  description,
  onClick,
}: PredictionCardProps) {
  const confidenceLabel = {
    high: { text: "高", color: "bg-green-100 text-green-800" },
    medium: { text: "中", color: "bg-yellow-100 text-yellow-800" },
    low: { text: "低", color: "bg-red-100 text-red-800" },
  };

  const partyColor = partyColors[party] || "#808080";

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border p-4 ${
        onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-gray-900">{title}</h3>
          <div className="flex items-center mt-2 space-x-2">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: partyColor }}
            />
            <span className="text-sm font-medium">{party}</span>
          </div>
        </div>
        <span
          className={`px-2 py-1 text-xs font-medium rounded ${confidenceLabel[confidence].color}`}
        >
          確信度: {confidenceLabel[confidence].text}
        </span>
      </div>
      {description && (
        <p className="mt-2 text-sm text-gray-600">{description}</p>
      )}
    </div>
  );
}
