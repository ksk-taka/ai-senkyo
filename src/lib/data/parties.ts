export interface Party {
  id: string;
  name: string;
  shortName: string;
  color: string;
}

export const parties: Party[] = [
  { id: "ldp", name: "自民党", shortName: "自民", color: "#FF0000" },
  { id: "chudo", name: "中道改革連合", shortName: "中道", color: "#6A5ACD" }, // 立憲民主党+公明党の合同
  { id: "ishin", name: "日本維新の会", shortName: "維新", color: "#00A651" },
  { id: "dpfp", name: "国民民主党", shortName: "国民", color: "#FF7F00" },
  { id: "jcp", name: "共産党", shortName: "共産", color: "#DB0027" },
  { id: "reiwa", name: "れいわ新選組", shortName: "れいわ", color: "#ED6D8D" },
  { id: "sdp", name: "社民党", shortName: "社民", color: "#ED008C" },
  { id: "sansei", name: "参政党", shortName: "参政", color: "#FFA500" },
  { id: "independent", name: "無所属", shortName: "無", color: "#808080" },
];

export function getPartyById(id: string): Party | undefined {
  return parties.find((p) => p.id === id);
}

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
function normalizePartyName(party: string | null | undefined): string {
  if (!party) return "";
  // エイリアスがあれば変換
  if (partyNameAliases[party]) return partyNameAliases[party];
  // 部分一致で検索
  for (const [alias, normalized] of Object.entries(partyNameAliases)) {
    if (party.includes(alias)) return normalized;
  }
  return party;
}

export function getPartyByName(name: string | null | undefined): Party | undefined {
  if (!name) return undefined;
  const normalizedName = normalizePartyName(name);
  return parties.find((p) => p.name === normalizedName || p.shortName === normalizedName || p.name === name || p.shortName === name);
}
