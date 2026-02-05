import { FinalPrediction } from "../ai/gemini";
import { prefectures } from "../data/districts";
import fs from "fs";
import path from "path";

const CACHE_DIR = path.join(process.cwd(), ".cache");
const NATIONAL_CACHE_FILE = path.join(CACHE_DIR, "national-prediction.json");
const PREFECTURE_CACHE_DIR = path.join(CACHE_DIR, "prefectures");

// キャッシュディレクトリを作成
function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
  if (!fs.existsSync(PREFECTURE_CACHE_DIR)) {
    fs.mkdirSync(PREFECTURE_CACHE_DIR, { recursive: true });
  }
}

// 全国予測をファイルから読み込み
export function loadNationalPrediction(): FinalPrediction | null {
  try {
    if (fs.existsSync(NATIONAL_CACHE_FILE)) {
      const data = fs.readFileSync(NATIONAL_CACHE_FILE, "utf-8");
      return JSON.parse(data) as FinalPrediction;
    }
  } catch (error) {
    console.error("Failed to load national prediction cache:", error);
  }
  return null;
}

// 全国予測をファイルに保存
export function saveNationalPrediction(prediction: FinalPrediction): void {
  try {
    ensureCacheDir();
    fs.writeFileSync(NATIONAL_CACHE_FILE, JSON.stringify(prediction, null, 2));
  } catch (error) {
    console.error("Failed to save national prediction cache:", error);
  }
}

// 都道府県予測をファイルから読み込み
export function loadPrefecturePrediction(prefectureId: number): FinalPrediction | null {
  try {
    const filePath = path.join(PREFECTURE_CACHE_DIR, `prefecture-${prefectureId}.json`);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data) as FinalPrediction;
    }
  } catch (error) {
    console.error(`Failed to load prefecture ${prefectureId} cache:`, error);
  }
  return null;
}

// 都道府県予測をファイルに保存
export function savePrefecturePrediction(prefectureId: number, prediction: FinalPrediction): void {
  try {
    ensureCacheDir();
    const filePath = path.join(PREFECTURE_CACHE_DIR, `prefecture-${prefectureId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(prediction, null, 2));
  } catch (error) {
    console.error(`Failed to save prefecture ${prefectureId} cache:`, error);
  }
}

// 政党名の表記揺れを正規化するマッピング
const PARTY_NAME_NORMALIZATION: Record<string, string> = {
  "自由民主党": "自民党",
  "日本共産党": "共産党",
  "立憲民主党": "中道改革連合", // 2026年1月に合流
  "公明党": "中道改革連合",     // 2026年1月に合流
};

// 政党名を正規化する関数
function normalizePartyName(party: string): string {
  return PARTY_NAME_NORMALIZATION[party] || party;
}

// 全47都道府県のデータを集計して全国予測を生成
export function aggregateNationalPrediction(): FinalPrediction | null {
  const partySeats: Map<string, number> = new Map();
  const prefecturePredictions: FinalPrediction["prefecturePredictions"] = [];
  let oldestTimestamp = "";
  let validPrefectureCount = 0;

  for (let prefId = 1; prefId <= 47; prefId++) {
    const prediction = loadPrefecturePrediction(prefId);
    if (!prediction || !prediction.timestamp || prediction.timestamp === "") {
      continue; // キャッシュがない、または空データの県はスキップ
    }

    validPrefectureCount++;

    // タイムスタンプを追跡（最も古いものを使用）
    if (!oldestTimestamp || prediction.timestamp < oldestTimestamp) {
      oldestTimestamp = prediction.timestamp;
    }

    // 都道府県別の予測を追加（政党名を正規化、ID/名前をファイル名から補正）
    if (prediction.prefecturePredictions && prediction.prefecturePredictions.length > 0) {
      const prefInfo = prefectures.find(p => p.id === prefId);
      const prefPrediction = {
        ...prediction.prefecturePredictions[0],
        prefectureId: prefId, // ファイル名のIDを使用（キャッシュ内のIDは不正確な場合がある）
        prefectureName: prefInfo?.name || prediction.prefecturePredictions[0].prefectureName,
        leadingParty: normalizePartyName(prediction.prefecturePredictions[0].leadingParty),
      };
      prefecturePredictions.push(prefPrediction);

      // 議席数を政党ごとに集計（政党名を正規化）
      if (prefPrediction.seatPrediction) {
        for (const seat of prefPrediction.seatPrediction) {
          const normalizedParty = normalizePartyName(seat.party);
          const current = partySeats.get(normalizedParty) || 0;
          partySeats.set(normalizedParty, current + seat.seats);
        }
      }
    }
  }

  // 有効なデータが少なすぎる場合はnullを返す
  // 全県更新中の途中経過を表示するため、3県以上あれば集計する
  if (validPrefectureCount < 3) {
    console.log(`Not enough prefecture data for aggregation: ${validPrefectureCount}/47`);
    return null;
  }

  // 政党別議席数を配列に変換してソート
  const sortedParties = Array.from(partySeats.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([party, seats]) => ({
      party,
      seatRange: [Math.max(0, seats - 10), seats + 10] as [number, number],
      change: 0, // 前回比は計算できないので0
    }));

  // 優勢政党をカウント
  const leadingPartyCount: Map<string, number> = new Map();
  for (const pref of prefecturePredictions) {
    if (pref.leadingParty) {
      const count = leadingPartyCount.get(pref.leadingParty) || 0;
      leadingPartyCount.set(pref.leadingParty, count + 1);
    }
  }

  // 注目選挙区を抽出（confidence が low の選挙区）
  const keyBattlegrounds: string[] = [];
  for (const pref of prefecturePredictions) {
    if (pref.confidence === "low" || pref.confidence === "medium") {
      keyBattlegrounds.push(`${pref.prefectureName}`);
    }
  }

  return {
    timestamp: new Date().toISOString(),
    nationalSummary: {
      totalSeats: 465,
      predictions: sortedParties,
    },
    prefecturePredictions: prefecturePredictions, // 全47都道府県
    keyBattlegrounds: keyBattlegrounds.slice(0, 10),
  };
}

// 都道府県キャッシュをすべてクリア（全県更新開始時に使用）
export function clearPrefectureCache(): void {
  try {
    if (fs.existsSync(PREFECTURE_CACHE_DIR)) {
      const files = fs.readdirSync(PREFECTURE_CACHE_DIR);
      for (const file of files) {
        if (file.startsWith("prefecture-") && file.endsWith(".json")) {
          fs.unlinkSync(path.join(PREFECTURE_CACHE_DIR, file));
        }
      }
      console.log(`Cleared ${files.length} prefecture cache files`);
    }
  } catch (error) {
    console.error("Failed to clear prefecture cache:", error);
  }
}

// キャッシュのメタ情報を取得
export function getCacheInfo(): { national: string | null; prefectures: number[] } {
  const info: { national: string | null; prefectures: number[] } = {
    national: null,
    prefectures: [],
  };

  try {
    if (fs.existsSync(NATIONAL_CACHE_FILE)) {
      const stat = fs.statSync(NATIONAL_CACHE_FILE);
      info.national = stat.mtime.toISOString();
    }

    if (fs.existsSync(PREFECTURE_CACHE_DIR)) {
      const files = fs.readdirSync(PREFECTURE_CACHE_DIR);
      info.prefectures = files
        .filter((f) => f.startsWith("prefecture-") && f.endsWith(".json"))
        .map((f) => parseInt(f.replace("prefecture-", "").replace(".json", "")))
        .sort((a, b) => a - b);
    }
  } catch (error) {
    console.error("Failed to get cache info:", error);
  }

  return info;
}
