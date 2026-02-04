export interface Party {
  id: string;
  name: string;
  shortName: string;
  color: string;
}

export const parties: Party[] = [
  { id: "ldp", name: "自民党", shortName: "自民", color: "#FF0000" },
  { id: "cdp", name: "立憲民主党", shortName: "立民", color: "#00529B" },
  { id: "ishin", name: "日本維新の会", shortName: "維新", color: "#00A651" },
  { id: "komeito", name: "公明党", shortName: "公明", color: "#F39800" },
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

export function getPartyByName(name: string): Party | undefined {
  return parties.find((p) => p.name === name || p.shortName === name);
}
