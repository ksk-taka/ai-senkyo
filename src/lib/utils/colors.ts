export const partyColors: Record<string, string> = {
  自民党: "#FF0000",
  中道改革連合: "#6A5ACD", // 立憲民主党+公明党の合同（紫系）
  日本維新の会: "#00A651",
  国民民主党: "#FF7F00",
  共産党: "#DB0027",
  れいわ新選組: "#ED6D8D",
  社民党: "#ED008C",
  参政党: "#FFA500",
  減税日本: "#1E90FF",
  諸派: "#A0A0A0",
  その他: "#C0C0C0",
  無所属: "#808080",
  // 旧政党（2026年1月に中道改革連合に合流）
  立憲民主党: "#00529B",
  公明党: "#F39800",
};

// 政党名の正規化マッピング（正式名 → 短縮名）
const partyNameAliases: Record<string, string> = {
  自由民主党: "自民党",
  日本共産党: "共産党",
  日本維新: "日本維新の会",
  維新の会: "日本維新の会",
  維新: "日本維新の会",
  国民民主: "国民民主党",
  れいわ: "れいわ新選組",
  社会民主党: "社民党",
  社民: "社民党",
  中道: "中道改革連合",
  公明: "公明党",
  // 旧政党 → 中道改革連合（2026年1月合流）
  立憲民主党: "中道改革連合",
  立憲: "中道改革連合",
  立民: "中道改革連合",
};

// 政党名を正規化する
export function normalizePartyName(party: string | null | undefined): string {
  if (!party) return "";
  // エイリアスがあれば変換（旧政党名 → 新政党名の変換を優先）
  if (partyNameAliases[party]) return partyNameAliases[party];
  // 完全一致があればそのまま返す
  if (partyColors[party]) return party;
  // 部分一致で検索
  for (const [alias, normalized] of Object.entries(partyNameAliases)) {
    if (party.includes(alias)) return normalized;
  }
  return party;
}

export function getPartyColor(party: string | null | undefined, opacity: number = 1): string {
  if (!party) return partyColors["無所属"];
  const normalizedParty = normalizePartyName(party);
  const color = partyColors[normalizedParty] || partyColors["無所属"];
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
