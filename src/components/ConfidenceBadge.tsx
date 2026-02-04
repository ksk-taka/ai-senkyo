"use client";

interface ConfidenceBadgeProps {
  confidence: "high" | "medium" | "low";
  size?: "sm" | "md" | "lg";
}

export default function ConfidenceBadge({
  confidence,
  size = "md",
}: ConfidenceBadgeProps) {
  const styles = {
    high: "bg-green-100 text-green-800 border-green-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    low: "bg-red-100 text-red-800 border-red-200",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  const labels = {
    high: "高確信度",
    medium: "中確信度",
    low: "低確信度",
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${styles[confidence]} ${sizes[size]}`}
    >
      {labels[confidence]}
    </span>
  );
}
