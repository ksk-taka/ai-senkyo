export const partyColors: Record<string, string> = {
  自民党: "#FF0000",
  立憲民主党: "#00529B",
  日本維新の会: "#00A651",
  公明党: "#F39800",
  国民民主党: "#FF7F00",
  共産党: "#DB0027",
  れいわ新選組: "#ED6D8D",
  社民党: "#ED008C",
  参政党: "#FFA500",
  無所属: "#808080",
};

export function getPartyColor(party: string, opacity: number = 1): string {
  const color = partyColors[party] || partyColors["無所属"];
  if (opacity === 1) return color;

  // Convert hex to rgba
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export function getConfidenceOpacity(confidence: "high" | "medium" | "low"): number {
  switch (confidence) {
    case "high":
      return 1;
    case "medium":
      return 0.7;
    case "low":
      return 0.4;
    default:
      return 0.5;
  }
}
