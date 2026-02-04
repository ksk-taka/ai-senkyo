import { getElectionNews } from "./perplexity";
import { analyzeAndPredict, FinalPrediction } from "./gemini";
import candidatesData from "@/data/candidates.json";
import {
  loadNationalPrediction,
  saveNationalPrediction,
  loadPrefecturePrediction,
  savePrefecturePrediction,
} from "../cache/predictionCache";

export interface PredictionRequest {
  prefectureId?: number;
  forceRefresh?: boolean;
  fastMode?: boolean; // Perplexityをスキップして高速化
}

// 主要都道府県のID（全国予測時はこれらのみ使用）
const MAJOR_PREFECTURE_IDS = [1, 4, 11, 12, 13, 14, 23, 27, 28, 40]; // 北海道、宮城、埼玉、千葉、東京、神奈川、愛知、大阪、兵庫、福岡

// 候補者データを整形する関数
function formatCandidatesData(prefectureId?: number): string {
  let prefectures;

  if (prefectureId) {
    // 特定の都道府県が指定された場合はその県のみ
    prefectures = candidatesData.prefectures.filter(p => p.id === prefectureId);
  } else {
    // 全国予測の場合は主要都道府県のみ（トークン制限対策）
    prefectures = candidatesData.prefectures.filter(p => MAJOR_PREFECTURE_IDS.includes(p.id));
  }

  let result = `## 候補者データ（${candidatesData.election.name}）\n`;
  result += `投票日: ${candidatesData.election.date}\n\n`;

  for (const pref of prefectures) {
    result += `### ${pref.name}\n`;
    for (const district of pref.districts) {
      result += `#### ${pref.name}${district.number}区\n`;
      for (const candidate of district.candidates) {
        result += `- ${candidate.name}（${candidate.party}、${candidate.status}）\n`;
      }
    }
    result += "\n";
  }

  return result;
}

export async function getElectionPrediction(
  request: PredictionRequest = {}
): Promise<FinalPrediction> {
  // forceRefresh でない場合は、まずファイルキャッシュから読み込み（即座に返す）
  if (!request.forceRefresh) {
    if (request.prefectureId) {
      const cached = loadPrefecturePrediction(request.prefectureId);
      if (cached) {
        return cached;
      }
      // キャッシュがない場合はモックデータを返す（APIを呼ばない）
      return getMockPrediction();
    } else {
      const cached = loadNationalPrediction();
      if (cached) {
        return cached;
      }
      // キャッシュがない場合はモックデータを返す（APIを呼ばない）
      return getMockPrediction();
    }
  }

  // forceRefresh の場合のみAPIを呼び出す
  try {
    const candidatesInfo = formatCandidatesData(request.prefectureId);
    let newsContent: string;

    if (request.fastMode) {
      // 高速モード: Perplexityをスキップ、候補者データのみで予測
      newsContent = "（高速モード：リアルタイムニュースなし。候補者データと一般的な選挙トレンドに基づいて予測してください）";
    } else {
      // 通常モード: Perplexityでニュースを取得
      const newsResult = await getElectionNews(
        request.prefectureId ? `都道府県ID: ${request.prefectureId}` : undefined
      );
      newsContent = newsResult.content;
    }

    // Gemini で予測を生成
    const finalPrediction = await analyzeAndPredict(
      newsContent,
      request.prefectureId,
      candidatesInfo
    );

    // ファイルキャッシュに保存
    if (request.prefectureId) {
      savePrefecturePrediction(request.prefectureId, finalPrediction);
    } else {
      saveNationalPrediction(finalPrediction);
    }

    return finalPrediction;
  } catch (error) {
    console.error("Error getting election prediction:", error);

    // エラー時はキャッシュから読み込み（期限切れでも使用）
    if (request.prefectureId) {
      const cached = loadPrefecturePrediction(request.prefectureId);
      if (cached) return cached;
    } else {
      const cached = loadNationalPrediction();
      if (cached) return cached;
    }

    // キャッシュもない場合はモックデータを返す
    return getMockPrediction();
  }
}

function getMockPrediction(): FinalPrediction {
  return {
    timestamp: "", // 空文字 = モックデータ（キャッシュ未取得）
    nationalSummary: {
      totalSeats: 465,
      predictions: [
        { party: "自民党", seatRange: [180, 210], change: -30 },
        { party: "立憲民主党", seatRange: [100, 130], change: 20 },
        { party: "日本維新の会", seatRange: [50, 70], change: 10 },
        { party: "公明党", seatRange: [25, 35], change: -5 },
        { party: "国民民主党", seatRange: [15, 25], change: 5 },
        { party: "共産党", seatRange: [10, 15], change: 0 },
        { party: "れいわ新選組", seatRange: [5, 10], change: 3 },
        { party: "その他", seatRange: [10, 20], change: 0 },
      ],
    },
    prefecturePredictions: [
      {
        prefectureId: 13,
        prefectureName: "東京都",
        leadingParty: "立憲民主党",
        confidence: "medium",
        seatPrediction: [
          { party: "自民党", seats: 10 },
          { party: "立憲民主党", seats: 12 },
          { party: "日本維新の会", seats: 5 },
          { party: "公明党", seats: 2 },
          { party: "その他", seats: 1 },
        ],
      },
      {
        prefectureId: 27,
        prefectureName: "大阪府",
        leadingParty: "日本維新の会",
        confidence: "high",
        seatPrediction: [
          { party: "日本維新の会", seats: 14 },
          { party: "自民党", seats: 3 },
          { party: "公明党", seats: 2 },
        ],
      },
    ],
    keyBattlegrounds: [
      "東京1区",
      "神奈川18区",
      "愛知1区",
      "大阪10区",
      "福岡2区",
    ],
  };
}
