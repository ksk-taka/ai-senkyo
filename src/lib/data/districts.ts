export interface Prefecture {
  id: number;
  name: string;
  districts: number; // 小選挙区の数
}

export interface District {
  id: string;
  prefectureId: number;
  name: string;
  number: number;
}

export const prefectures: Prefecture[] = [
  { id: 1, name: "北海道", districts: 12 },
  { id: 2, name: "青森県", districts: 3 },
  { id: 3, name: "岩手県", districts: 3 },
  { id: 4, name: "宮城県", districts: 5 },
  { id: 5, name: "秋田県", districts: 3 },
  { id: 6, name: "山形県", districts: 3 },
  { id: 7, name: "福島県", districts: 5 },
  { id: 8, name: "茨城県", districts: 7 },
  { id: 9, name: "栃木県", districts: 5 },
  { id: 10, name: "群馬県", districts: 5 },
  { id: 11, name: "埼玉県", districts: 15 },
  { id: 12, name: "千葉県", districts: 13 },
  { id: 13, name: "東京都", districts: 30 },
  { id: 14, name: "神奈川県", districts: 20 },
  { id: 15, name: "新潟県", districts: 6 },
  { id: 16, name: "富山県", districts: 3 },
  { id: 17, name: "石川県", districts: 3 },
  { id: 18, name: "福井県", districts: 2 },
  { id: 19, name: "山梨県", districts: 2 },
  { id: 20, name: "長野県", districts: 5 },
  { id: 21, name: "岐阜県", districts: 5 },
  { id: 22, name: "静岡県", districts: 8 },
  { id: 23, name: "愛知県", districts: 15 },
  { id: 24, name: "三重県", districts: 5 },
  { id: 25, name: "滋賀県", districts: 4 },
  { id: 26, name: "京都府", districts: 6 },
  { id: 27, name: "大阪府", districts: 19 },
  { id: 28, name: "兵庫県", districts: 12 },
  { id: 29, name: "奈良県", districts: 3 },
  { id: 30, name: "和歌山県", districts: 3 },
  { id: 31, name: "鳥取県", districts: 2 },
  { id: 32, name: "島根県", districts: 2 },
  { id: 33, name: "岡山県", districts: 5 },
  { id: 34, name: "広島県", districts: 7 },
  { id: 35, name: "山口県", districts: 4 },
  { id: 36, name: "徳島県", districts: 2 },
  { id: 37, name: "香川県", districts: 3 },
  { id: 38, name: "愛媛県", districts: 4 },
  { id: 39, name: "高知県", districts: 2 },
  { id: 40, name: "福岡県", districts: 11 },
  { id: 41, name: "佐賀県", districts: 2 },
  { id: 42, name: "長崎県", districts: 4 },
  { id: 43, name: "熊本県", districts: 5 },
  { id: 44, name: "大分県", districts: 3 },
  { id: 45, name: "宮崎県", districts: 3 },
  { id: 46, name: "鹿児島県", districts: 5 },
  { id: 47, name: "沖縄県", districts: 4 },
];

export interface ProportionalBlock {
  id: string;
  name: string;
  seats: number;
  prefectures: number[];
}

export const proportionalBlocks: ProportionalBlock[] = [
  { id: "hokkaido", name: "北海道ブロック", seats: 8, prefectures: [1] },
  { id: "tohoku", name: "東北ブロック", seats: 13, prefectures: [2, 3, 4, 5, 6, 7] },
  { id: "kitakanto", name: "北関東ブロック", seats: 19, prefectures: [8, 9, 10, 11] },
  { id: "minamikanto", name: "南関東ブロック", seats: 22, prefectures: [12, 14, 19] },
  { id: "tokyo", name: "東京ブロック", seats: 17, prefectures: [13] },
  { id: "hokurikushinetsu", name: "北陸信越ブロック", seats: 11, prefectures: [15, 16, 17, 18, 20] },
  { id: "tokai", name: "東海ブロック", seats: 21, prefectures: [21, 22, 23, 24] },
  { id: "kinki", name: "近畿ブロック", seats: 28, prefectures: [25, 26, 27, 28, 29, 30] },
  { id: "chugoku", name: "中国ブロック", seats: 11, prefectures: [31, 32, 33, 34, 35] },
  { id: "shikoku", name: "四国ブロック", seats: 6, prefectures: [36, 37, 38, 39] },
  { id: "kyushu", name: "九州ブロック", seats: 20, prefectures: [40, 41, 42, 43, 44, 45, 46, 47] },
];

export function getPrefectureById(id: number): Prefecture | undefined {
  return prefectures.find((p) => p.id === id);
}

export function getBlockById(id: string): ProportionalBlock | undefined {
  return proportionalBlocks.find((b) => b.id === id);
}
