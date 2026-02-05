import { GoogleGenerativeAI } from "@google/generative-ai";

export interface Candidate {
  name: string;
  party: string;
  isIncumbent: boolean;
  predictedVoteShare?: number;
}

export interface DistrictPrediction {
  districtNumber: number;
  districtName: string;
  candidates: Candidate[];
  leadingCandidate: string;
  confidence: "high" | "medium" | "low";
}

export interface IntegratedPrediction {
  prefectureId: number;
  prefectureName: string;
  leadingParty: string;
  confidence: "high" | "medium" | "low";
  seatPrediction: {
    party: string;
    seats: number;
  }[];
  districts?: DistrictPrediction[];
}

export interface FinalPrediction {
  timestamp: string;
  nationalSummary: {
    totalSeats: number;
    predictions: {
      party: string;
      seatRange: [number, number];
      change: number;
    }[];
  };
  prefecturePredictions: IntegratedPrediction[];
  keyBattlegrounds: string[];
}

/**
 * Perplexityから収集したニュースデータと候補者データを分析し、選挙予測を生成
 */
export async function analyzeAndPredict(
  newsData: string,
  prefectureId?: number,
  candidatesData?: string
): Promise<FinalPrediction> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_AI_API_KEY is not set");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const targetScope = prefectureId
    ? `都道府県ID ${prefectureId} を中心に`
    : "全国の";

  const candidatesSection = candidatesData
    ? `\n${candidatesData}\n`
    : "";

  const prompt = `あなたは日本の選挙分析の専門家です。2026年2月8日投票の第51回衆議院選挙について、以下の候補者データとニュースデータを分析し、${targetScope}予測を作成してください。
${candidatesSection}
## 収集されたニュース・世論調査データ:
${newsData}

## 分析タスク:
1. 各政党の支持率トレンドを分析
2. 選挙区ごとの情勢と主要候補者を特定
3. 接戦区を特定
4. 最終的な議席予測を作成

## 出力形式（必ずこのJSON形式で出力）:
{
  "timestamp": "${new Date().toISOString()}",
  "nationalSummary": {
    "totalSeats": 465,
    "predictions": [
      {"party": "自民党", "seatRange": [最小, 最大], "change": 前回比},
      {"party": "中道改革連合", "seatRange": [最小, 最大], "change": 増減},
      {"party": "日本維新の会", "seatRange": [最小, 最大], "change": 増減},
      {"party": "公明党", "seatRange": [最小, 最大], "change": 増減},
      {"party": "国民民主党", "seatRange": [最小, 最大], "change": 増減},
      {"party": "共産党", "seatRange": [最小, 最大], "change": 増減},
      {"party": "れいわ新選組", "seatRange": [最小, 最大], "change": 増減},
      {"party": "その他", "seatRange": [最小, 最大], "change": 増減}
    ]
  },
  "prefecturePredictions": [
    {
      "prefectureId": 13,
      "prefectureName": "東京都",
      "leadingParty": "優勢な政党",
      "confidence": "high/medium/low",
      "seatPrediction": [{"party": "政党名", "seats": 数}],
      "districts": [
        {
          "districtNumber": 1,
          "districtName": "東京1区",
          "candidates": [
            {"name": "山田太郎", "party": "自民党", "isIncumbent": true, "predictedVoteShare": 35},
            {"name": "鈴木花子", "party": "中道改革連合", "isIncumbent": false, "predictedVoteShare": 32},
            {"name": "田中一郎", "party": "日本維新の会", "isIncumbent": false, "predictedVoteShare": 20}
          ],
          "leadingCandidate": "山田太郎",
          "confidence": "low"
        }
      ]
    }
  ],
  "keyBattlegrounds": ["注目選挙区1", "注目選挙区2", "注目選挙区3", "注目選挙区4", "注目選挙区5"]
}

重要:
- 候補者データに記載されている実際の候補者名・政党名を必ず使用してください
- isIncumbent: 候補者データのstatus が「前職」ならtrue、「新人」「元職」ならfalse
- predictedVoteShare: 予測得票率（%）、候補者全員の合計が100%になるように
- 主要な都道府県（東京、大阪、愛知、神奈川、埼玉、千葉、北海道、福岡）は必ず全選挙区のdistrictsを含めてください
- 確信度: high=優勢明確, medium=接戦, low=予測困難
- 政党名は候補者データの表記に合わせてください（例：「中道改革連合」「自由民主党」「日本維新の会」など）`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }
    return JSON.parse(jsonMatch[0]) as FinalPrediction;
  } catch {
    return {
      timestamp: new Date().toISOString(),
      nationalSummary: {
        totalSeats: 465,
        predictions: [],
      },
      prefecturePredictions: [],
      keyBattlegrounds: [],
    };
  }
}
