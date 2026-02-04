import { FinalPrediction } from "../ai/gemini";
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
