// Geminiの代わりにローカルOllamaを使用
// 型定義はgemini.tsからエクスポートされているものを再利用

import candidatesJson from "@/data/candidates.json";

// 47都道府県データ（名前、選挙区数、地域傾向）
const PREFECTURE_DATA: {
  [id: number]: {
    name: string;
    districts: number;
    region: "hokkaido" | "tohoku" | "kanto" | "chubu" | "kinki" | "chugoku" | "shikoku" | "kyushu";
  };
} = {
  1: { name: "北海道", districts: 12, region: "hokkaido" },
  2: { name: "青森県", districts: 3, region: "tohoku" },
  3: { name: "岩手県", districts: 3, region: "tohoku" },
  4: { name: "宮城県", districts: 6, region: "tohoku" },
  5: { name: "秋田県", districts: 3, region: "tohoku" },
  6: { name: "山形県", districts: 3, region: "tohoku" },
  7: { name: "福島県", districts: 5, region: "tohoku" },
  8: { name: "茨城県", districts: 7, region: "kanto" },
  9: { name: "栃木県", districts: 5, region: "kanto" },
  10: { name: "群馬県", districts: 5, region: "kanto" },
  11: { name: "埼玉県", districts: 15, region: "kanto" },
  12: { name: "千葉県", districts: 13, region: "kanto" },
  13: { name: "東京都", districts: 30, region: "kanto" },
  14: { name: "神奈川県", districts: 20, region: "kanto" },
  15: { name: "新潟県", districts: 6, region: "chubu" },
  16: { name: "富山県", districts: 3, region: "chubu" },
  17: { name: "石川県", districts: 3, region: "chubu" },
  18: { name: "福井県", districts: 2, region: "chubu" },
  19: { name: "山梨県", districts: 2, region: "chubu" },
  20: { name: "長野県", districts: 5, region: "chubu" },
  21: { name: "岐阜県", districts: 5, region: "chubu" },
  22: { name: "静岡県", districts: 8, region: "chubu" },
  23: { name: "愛知県", districts: 16, region: "chubu" },
  24: { name: "三重県", districts: 4, region: "kinki" },
  25: { name: "滋賀県", districts: 4, region: "kinki" },
  26: { name: "京都府", districts: 6, region: "kinki" },
  27: { name: "大阪府", districts: 19, region: "kinki" },
  28: { name: "兵庫県", districts: 12, region: "kinki" },
  29: { name: "奈良県", districts: 3, region: "kinki" },
  30: { name: "和歌山県", districts: 3, region: "kinki" },
  31: { name: "鳥取県", districts: 2, region: "chugoku" },
  32: { name: "島根県", districts: 2, region: "chugoku" },
  33: { name: "岡山県", districts: 5, region: "chugoku" },
  34: { name: "広島県", districts: 7, region: "chugoku" },
  35: { name: "山口県", districts: 4, region: "chugoku" },
  36: { name: "徳島県", districts: 2, region: "shikoku" },
  37: { name: "香川県", districts: 3, region: "shikoku" },
  38: { name: "愛媛県", districts: 4, region: "shikoku" },
  39: { name: "高知県", districts: 2, region: "shikoku" },
  40: { name: "福岡県", districts: 11, region: "kyushu" },
  41: { name: "佐賀県", districts: 2, region: "kyushu" },
  42: { name: "長崎県", districts: 4, region: "kyushu" },
  43: { name: "熊本県", districts: 5, region: "kyushu" },
  44: { name: "大分県", districts: 3, region: "kyushu" },
  45: { name: "宮崎県", districts: 3, region: "kyushu" },
  46: { name: "鹿児島県", districts: 5, region: "kyushu" },
  47: { name: "沖縄県", districts: 4, region: "kyushu" },
};

// 地域別の政党傾向（高速モード用テンプレート）
function getPrefecturePrediction(prefId: number): {
  leadingParty: string;
  confidence: "high" | "medium" | "low";
  seatDistribution: { party: string; ratio: number }[];
} {
  const pref = PREFECTURE_DATA[prefId];
  if (!pref) {
    return {
      leadingParty: "自民党",
      confidence: "medium",
      seatDistribution: [
        { party: "自民党", ratio: 0.5 },
        { party: "中道改革連合", ratio: 0.3 },
        { party: "その他", ratio: 0.2 },
      ],
    };
  }

  // 地域別の傾向を設定
  switch (pref.region) {
    case "kinki":
      // 近畿は維新が強い（特に大阪）
      if (prefId === 27) {
        return {
          leadingParty: "日本維新の会",
          confidence: "high",
          seatDistribution: [
            { party: "日本維新の会", ratio: 0.65 },
            { party: "自民党", ratio: 0.2 },
            { party: "公明党", ratio: 0.15 },
          ],
        };
      }
      return {
        leadingParty: "日本維新の会",
        confidence: "medium",
        seatDistribution: [
          { party: "日本維新の会", ratio: 0.4 },
          { party: "自民党", ratio: 0.35 },
          { party: "中道改革連合", ratio: 0.15 },
          { party: "公明党", ratio: 0.1 },
        ],
      };

    case "kanto":
      // 関東は接戦（東京は特に多様）
      if (prefId === 13) {
        return {
          leadingParty: "自民党",
          confidence: "medium",
          seatDistribution: [
            { party: "自民党", ratio: 0.35 },
            { party: "中道改革連合", ratio: 0.3 },
            { party: "日本維新の会", ratio: 0.15 },
            { party: "公明党", ratio: 0.1 },
            { party: "共産党", ratio: 0.05 },
            { party: "その他", ratio: 0.05 },
          ],
        };
      }
      return {
        leadingParty: "自民党",
        confidence: "medium",
        seatDistribution: [
          { party: "自民党", ratio: 0.45 },
          { party: "中道改革連合", ratio: 0.3 },
          { party: "日本維新の会", ratio: 0.1 },
          { party: "公明党", ratio: 0.1 },
          { party: "その他", ratio: 0.05 },
        ],
      };

    case "hokkaido":
      // 北海道は立憲が比較的強い
      return {
        leadingParty: "中道改革連合",
        confidence: "medium",
        seatDistribution: [
          { party: "中道改革連合", ratio: 0.45 },
          { party: "自民党", ratio: 0.4 },
          { party: "日本維新の会", ratio: 0.1 },
          { party: "その他", ratio: 0.05 },
        ],
      };

    case "tohoku":
      // 東北は自民が強いが立憲もそれなり
      return {
        leadingParty: "自民党",
        confidence: "medium",
        seatDistribution: [
          { party: "自民党", ratio: 0.5 },
          { party: "中道改革連合", ratio: 0.35 },
          { party: "その他", ratio: 0.15 },
        ],
      };

    case "chubu":
      // 中部は自民優勢（愛知は国民民主も強い）
      if (prefId === 23) {
        return {
          leadingParty: "自民党",
          confidence: "medium",
          seatDistribution: [
            { party: "自民党", ratio: 0.4 },
            { party: "中道改革連合", ratio: 0.25 },
            { party: "国民民主党", ratio: 0.2 },
            { party: "日本維新の会", ratio: 0.1 },
            { party: "その他", ratio: 0.05 },
          ],
        };
      }
      return {
        leadingParty: "自民党",
        confidence: "high",
        seatDistribution: [
          { party: "自民党", ratio: 0.55 },
          { party: "中道改革連合", ratio: 0.25 },
          { party: "日本維新の会", ratio: 0.1 },
          { party: "その他", ratio: 0.1 },
        ],
      };

    case "chugoku":
    case "shikoku":
      // 中国・四国は自民が強い
      return {
        leadingParty: "自民党",
        confidence: "high",
        seatDistribution: [
          { party: "自民党", ratio: 0.6 },
          { party: "中道改革連合", ratio: 0.2 },
          { party: "日本維新の会", ratio: 0.1 },
          { party: "その他", ratio: 0.1 },
        ],
      };

    case "kyushu":
      // 九州は自民優勢（沖縄は独自）
      if (prefId === 47) {
        return {
          leadingParty: "中道改革連合",
          confidence: "low",
          seatDistribution: [
            { party: "中道改革連合", ratio: 0.35 },
            { party: "自民党", ratio: 0.3 },
            { party: "れいわ新選組", ratio: 0.15 },
            { party: "その他", ratio: 0.2 },
          ],
        };
      }
      return {
        leadingParty: "自民党",
        confidence: "high",
        seatDistribution: [
          { party: "自民党", ratio: 0.55 },
          { party: "中道改革連合", ratio: 0.25 },
          { party: "公明党", ratio: 0.1 },
          { party: "その他", ratio: 0.1 },
        ],
      };

    default:
      return {
        leadingParty: "自民党",
        confidence: "medium",
        seatDistribution: [
          { party: "自民党", ratio: 0.5 },
          { party: "中道改革連合", ratio: 0.3 },
          { party: "その他", ratio: 0.2 },
        ],
      };
  }
}

// 高速モードで個別県用のテンプレートデータを生成
function generatePrefectureFastModeData(prefId: number): FinalPrediction {
  const pref = PREFECTURE_DATA[prefId];
  if (!pref) {
    throw new Error(`Invalid prefecture ID: ${prefId}`);
  }

  const prediction = getPrefecturePrediction(prefId);
  const totalSeats = pref.districts;

  // 議席配分を計算
  const seatPrediction = prediction.seatDistribution.map((dist) => ({
    party: dist.party,
    seats: Math.round(totalSeats * dist.ratio),
  }));

  // 合計が選挙区数と一致するよう調整
  const totalAllocated = seatPrediction.reduce((sum, s) => sum + s.seats, 0);
  if (totalAllocated !== totalSeats && seatPrediction.length > 0) {
    seatPrediction[0].seats += totalSeats - totalAllocated;
  }

  // 0議席の政党を除外
  const filteredSeatPrediction = seatPrediction.filter((s) => s.seats > 0);

  return {
    timestamp: new Date().toISOString(),
    nationalSummary: {
      totalSeats: 465,
      predictions: [
        { party: "自民党", seatRange: [170, 200] as [number, number], change: -15 },
        { party: "中道改革連合", seatRange: [85, 105] as [number, number], change: 12 },
        { party: "日本維新の会", seatRange: [50, 65] as [number, number], change: 8 },
        { party: "公明党", seatRange: [25, 32] as [number, number], change: -2 },
        { party: "国民民主党", seatRange: [15, 22] as [number, number], change: 4 },
        { party: "共産党", seatRange: [8, 12] as [number, number], change: -1 },
        { party: "れいわ新選組", seatRange: [5, 10] as [number, number], change: 3 },
        { party: "その他", seatRange: [8, 15] as [number, number], change: 0 },
      ],
    },
    prefecturePredictions: [
      {
        prefectureId: prefId,
        prefectureName: pref.name,
        leadingParty: prediction.leadingParty,
        confidence: prediction.confidence,
        seatPrediction: filteredSeatPrediction,
      },
    ],
    keyBattlegrounds: [`${pref.name}1区`],
  };
}

/**
 * 候補者の得票率を正規化（0.45 → 45 など）
 * LLMが小数（0〜1）で返す場合があるため、0〜100に変換
 */
function normalizeVoteShare(candidates: Candidate[]): Candidate[] {
  if (!candidates || candidates.length === 0) return candidates;

  // 全候補者の得票率が1以下かチェック（小数形式かどうか）
  const allLessThanOne = candidates.every(c => (c.predictedVoteShare || 0) <= 1);

  if (allLessThanOne) {
    // 小数形式 → パーセンテージに変換
    return candidates.map(c => ({
      ...c,
      predictedVoteShare: Math.round((c.predictedVoteShare || 0) * 100),
    }));
  }

  // 既にパーセンテージ形式の場合はそのまま
  return candidates.map(c => ({
    ...c,
    predictedVoteShare: Math.round(c.predictedVoteShare || 0),
  }));
}

/**
 * 選挙区データの得票率を正規化
 */
function normalizeDistrictVoteShares(districts: DistrictPrediction[]): DistrictPrediction[] {
  return districts.map(d => ({
    ...d,
    candidates: normalizeVoteShare(d.candidates),
  }));
}

/**
 * LLMの出力した議席予測を正規化
 * 合計が選挙区数と一致しない場合、比率を保ったまま調整
 */
function normalizeSeatPrediction(
  seatPrediction: { party: string; seats: number }[],
  targetTotal: number
): { party: string; seats: number }[] {
  if (!seatPrediction || seatPrediction.length === 0) {
    return seatPrediction;
  }

  // 現在の合計を計算
  const currentTotal = seatPrediction.reduce((sum, s) => sum + (s.seats || 0), 0);

  // 既に正しい場合はそのまま返す
  if (currentTotal === targetTotal) {
    return seatPrediction;
  }

  console.log(`[正規化] 議席合計 ${currentTotal} → ${targetTotal} に調整`);

  // 比率を保って調整
  const ratio = targetTotal / currentTotal;
  let normalized = seatPrediction.map((s) => ({
    party: s.party,
    seats: Math.round((s.seats || 0) * ratio),
  }));

  // 丸め誤差を調整（最大議席の政党で吸収）
  const newTotal = normalized.reduce((sum, s) => sum + s.seats, 0);
  const diff = targetTotal - newTotal;
  if (diff !== 0) {
    // 最大議席の政党を見つけて調整
    const maxIdx = normalized.reduce(
      (maxI, s, i, arr) => (s.seats > arr[maxI].seats ? i : maxI),
      0
    );
    normalized[maxIdx].seats += diff;
  }

  // 0議席以下を除外
  normalized = normalized.filter((s) => s.seats > 0);

  return normalized;
}

/**
 * 選挙区データから政党別議席数を計算
 * 各選挙区の最高得票率候補者の政党をカウント
 */
function calculateSeatPredictionFromDistricts(
  districts: DistrictPrediction[]
): { party: string; seats: number }[] {
  const partyCounts: Record<string, number> = {};

  for (const district of districts) {
    if (!district.candidates || district.candidates.length === 0) continue;

    // 最高得票率の候補者を見つける
    const winner = district.candidates.reduce((best, current) => {
      const bestShare = best.predictedVoteShare || 0;
      const currentShare = current.predictedVoteShare || 0;
      return currentShare > bestShare ? current : best;
    }, district.candidates[0]);

    if (winner && winner.party) {
      partyCounts[winner.party] = (partyCounts[winner.party] || 0) + 1;
    }
  }

  // 議席数の多い順にソート
  return Object.entries(partyCounts)
    .map(([party, seats]) => ({ party, seats }))
    .sort((a, b) => b.seats - a.seats);
}

/**
 * 議席予測から優勢政党を取得
 */
function getLeadingPartyFromSeats(seatPrediction: { party: string; seats: number }[]): string {
  if (!seatPrediction || seatPrediction.length === 0) return "自民党";

  // 最多議席の政党を返す（既にソート済みなら先頭）
  const sorted = [...seatPrediction].sort((a, b) => b.seats - a.seats);
  return sorted[0].party;
}

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
  commentary?: string; // LLMによる情勢分析コメント
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

interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

// 大きな県の選挙区を分割して生成するための閾値
const LARGE_PREFECTURE_THRESHOLD = 10;
const BATCH_SIZE = 5; // 1回のリクエストで生成する選挙区数

/**
 * candidates.jsonから特定の県・区の候補者データを取得
 * 現職には得票率ボーナスを与え、より現実的な予測を生成
 */
function getCandidatesFromJson(prefectureId: number, districtNumber: number): Candidate[] {
  const prefData = candidatesJson.prefectures.find(p => p.id === prefectureId);
  if (!prefData) return [];

  const districtData = prefData.districts.find(d => d.number === districtNumber);
  if (!districtData) return [];

  // 候補者ごとの基礎ポイントを計算
  // 現職: 15pt、元職: 10pt、新人: 5pt
  // 主要政党（自民・中道・維新・国民）: +5pt
  const majorParties = ["自由民主党", "自民党", "中道改革連合", "日本維新の会", "国民民主党", "公明党"];

  const candidatesWithPoints = districtData.candidates.map(c => {
    let points = 5; // 新人の基礎ポイント

    // 現職・元職ボーナス
    if (c.status === "前職") {
      points = 15;
    } else if (c.status === "元職") {
      points = 10;
    }

    // 主要政党ボーナス
    if (majorParties.includes(c.party)) {
      points += 5;
    }

    return {
      name: c.name,
      party: c.party,
      isIncumbent: c.status === "前職",
      points,
    };
  });

  // ポイントを得票率に変換（合計100%になるよう正規化）
  const totalPoints = candidatesWithPoints.reduce((sum, c) => sum + c.points, 0);

  return candidatesWithPoints.map(c => ({
    name: c.name,
    party: c.party,
    isIncumbent: c.isIncumbent,
    predictedVoteShare: Math.round((c.points / totalPoints) * 100),
  }));
}

/**
 * candidates.jsonのデータを使って選挙区予測を生成
 */
function createDistrictFromCandidatesJson(
  prefectureId: number,
  districtNumber: number,
  prefectureName: string
): DistrictPrediction {
  const candidates = getCandidatesFromJson(prefectureId, districtNumber);

  if (candidates.length === 0) {
    // candidates.jsonにもデータがない場合のみダミー
    return {
      districtNumber,
      districtName: `${prefectureName}${districtNumber}区`,
      candidates: [
        { name: "候補者未詳", party: "無所属", isIncumbent: false, predictedVoteShare: 100 },
      ],
      leadingCandidate: "候補者未詳",
      confidence: "low" as const,
    };
  }

  // 最高得票率の候補者を見つける
  const leadingCandidate = candidates.reduce((best, current) =>
    (current.predictedVoteShare || 0) > (best.predictedVoteShare || 0) ? current : best
  );

  return {
    districtNumber,
    districtName: `${prefectureName}${districtNumber}区`,
    candidates,
    leadingCandidate: leadingCandidate.name,
    confidence: "medium" as const, // データはあるが予測は未確定
  };
}

/**
 * 得票率が均等すぎるかチェック（LLMが意味のある予測を返さなかった場合）
 */
function isVoteShareTooUniform(candidates: Candidate[]): boolean {
  if (!candidates || candidates.length < 2) return false;

  const shares = candidates.map(c => c.predictedVoteShare || 0);
  const uniqueShares = new Set(shares);

  // 全員同じ得票率 = 明らかに失敗
  if (uniqueShares.size === 1) return true;

  // 最大と最小の差が5%以下 = ほぼ均等で意味がない
  const min = Math.min(...shares);
  const max = Math.max(...shares);
  if (max - min <= 5) return true;

  return false;
}

/**
 * LLMを使用して選挙区予測を生成（リトライ機能付き）
 * 小さい県でも使用可能
 */
async function generateDistrictsWithLLM(
  prefectureId: number,
  newsData: string,
  maxRetries: number = 3
): Promise<DistrictPrediction[]> {
  const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
  const model = process.env.OLLAMA_MODEL || "gemma3:4b";
  const pref = PREFECTURE_DATA[prefectureId];
  if (!pref) return [];

  const totalDistricts = pref.districts;

  // candidates.jsonから候補者情報を取得してプロンプトに含める
  let candidatesInfo = "";
  const prefData = candidatesJson.prefectures.find(p => p.id === prefectureId);
  if (prefData) {
    for (const dist of prefData.districts) {
      candidatesInfo += `### ${pref.name}${dist.number}区\n`;
      for (const c of dist.candidates) {
        candidatesInfo += `- ${c.name}（${c.party}、${c.status}）\n`;
      }
      candidatesInfo += "\n";
    }
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`[Ollama] ${pref.name}: LLM予測生成 試行${attempt}/${maxRetries}...`);

    // 温度を試行ごとに上げて、より多様な結果を得る
    const temperature = 0.5 + (attempt - 1) * 0.2;

    const prompt = `## タスク
${pref.name}の2026年衆議院選挙の候補者別得票率を予測してください。
選挙区数: ${totalDistricts}区

## 重要な指示
- 各候補者の得票率(predictedVoteShare)は、現職・知名度・政党支持率などを考慮して現実的に予測
- 全候補者で100%になるように配分
- 接戦区は差を小さく、優勢な候補がいる場合は差を大きく
- **得票率を候補者ごとに変えること（全員同じ数値は不可）**

## 候補者データ
${candidatesInfo}

## 参考: 最新ニュース
${newsData.substring(0, 800)}

## 出力形式
以下のJSON配列を正確に出力。候補者名は上記データから正確に使用すること。
[
  {
    "districtNumber": 1,
    "districtName": "${pref.name}1区",
    "candidates": [
      {"name": "候補者名", "party": "政党名", "isIncumbent": true/false, "predictedVoteShare": 38},
      {"name": "候補者名", "party": "政党名", "isIncumbent": true/false, "predictedVoteShare": 35},
      {"name": "候補者名", "party": "政党名", "isIncumbent": false, "predictedVoteShare": 27}
    ],
    "leadingCandidate": "1位候補者名",
    "confidence": "medium"
  }
  // ... ${totalDistricts}区まで全て出力
]

JSONのみ出力。説明不要。`;

    try {
      const response = await fetch(`${ollamaUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          options: { temperature, num_predict: 4096, num_ctx: 8192 },
        }),
      });

      if (!response.ok) {
        console.log(`[Ollama] ${pref.name}: API エラー ${response.status}`);
        continue;
      }

      const data = (await response.json()) as OllamaResponse;
      let text = data.response;

      // JSONを抽出
      const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) text = codeBlockMatch[1];

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.log(`[Ollama] ${pref.name}: JSONが見つからない（試行${attempt}）`);
        continue;
      }

      const districts = JSON.parse(jsonMatch[0]) as DistrictPrediction[];

      // 得票率が均等すぎないかチェック
      let uniformCount = 0;
      for (const d of districts) {
        if (isVoteShareTooUniform(d.candidates)) {
          uniformCount++;
        }
      }

      // 半分以上の選挙区が均等な得票率なら再試行
      if (uniformCount > districts.length / 2) {
        console.log(`[Ollama] ${pref.name}: 得票率が均等すぎる (${uniformCount}/${districts.length}区)。再試行...`);
        continue;
      }

      // 成功
      console.log(`[Ollama] ${pref.name}: LLM予測成功 (${districts.length}区)`);

      // candidates.jsonからの候補者補完と正規化
      const resultMap = new Map<number, DistrictPrediction>();
      for (const d of districts) {
        if (d.districtNumber >= 1 && d.districtNumber <= totalDistricts) {
          // LLMの候補者が不足している場合、candidates.jsonからマージ
          const jsonCandidates = getCandidatesFromJson(prefectureId, d.districtNumber);
          let mergedCandidates = d.candidates || [];

          if (jsonCandidates.length > mergedCandidates.length) {
            const existingNames = new Set(mergedCandidates.map(c => c.name));
            for (const jc of jsonCandidates) {
              if (!existingNames.has(jc.name)) {
                mergedCandidates.push(jc);
              }
            }
          }

          resultMap.set(d.districtNumber, {
            ...d,
            districtName: `${pref.name}${d.districtNumber}区`,
            candidates: normalizeVoteShare(mergedCandidates),
          });
        }
      }

      // 不足分をcandidates.jsonから補完
      for (let i = 1; i <= totalDistricts; i++) {
        if (!resultMap.has(i)) {
          console.log(`[Ollama] ${pref.name}${i}区が不足、candidates.jsonから補完`);
          resultMap.set(i, createDistrictFromCandidatesJson(prefectureId, i, pref.name));
        }
      }

      return Array.from(resultMap.values()).sort((a, b) => a.districtNumber - b.districtNumber);

    } catch (error) {
      console.error(`[Ollama] ${pref.name}: 試行${attempt}でエラー:`, error);
    }
  }

  // 全リトライ失敗 → candidates.jsonからフォールバック
  console.log(`[Ollama] ${pref.name}: LLM全試行失敗、candidates.jsonからフォールバック`);
  const fallbackDistricts: DistrictPrediction[] = [];
  for (let i = 1; i <= totalDistricts; i++) {
    fallbackDistricts.push(createDistrictFromCandidatesJson(prefectureId, i, pref.name));
  }
  return fallbackDistricts;
}

/**
 * LLMを使用して都道府県の情勢分析コメントを生成
 */
async function generateCommentaryWithLLM(
  prefectureId: number,
  districts: DistrictPrediction[],
  newsData: string
): Promise<string> {
  const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
  const model = process.env.OLLAMA_MODEL || "gemma3:4b";
  const pref = PREFECTURE_DATA[prefectureId];
  if (!pref || districts.length === 0) return "";

  // 選挙区の概要を作成
  let districtSummary = "";
  for (const d of districts) {
    const leader = d.candidates.find(c => c.name === d.leadingCandidate);
    const second = d.candidates
      .filter(c => c.name !== d.leadingCandidate)
      .sort((a, b) => (b.predictedVoteShare || 0) - (a.predictedVoteShare || 0))[0];

    districtSummary += `${d.districtNumber}区: ${d.leadingCandidate}(${leader?.party || "不明"})優勢`;
    if (second) {
      const gap = (leader?.predictedVoteShare || 0) - (second.predictedVoteShare || 0);
      if (gap <= 5) districtSummary += `（${second.name}と接戦）`;
    }
    districtSummary += "\n";
  }

  const prompt = `## タスク
${pref.name}の2026年衆議院選挙の情勢を100文字程度で簡潔に分析してください。

## 選挙区別の優勢状況
${districtSummary}

## 参考ニュース
${newsData.substring(0, 500)}

## 出力形式
- 100文字程度の日本語コメント
- 主要な対決構図、注目ポイントを含める
- 具体的な候補者名を1-2名挙げる
- JSONや説明文は不要、コメントのみ出力`;

  try {
    console.log(`[Ollama] ${pref.name}: コメント生成中...`);
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: { temperature: 0.7, num_predict: 256, num_ctx: 4096 },
      }),
    });

    if (!response.ok) {
      console.log(`[Ollama] ${pref.name}: コメント生成失敗 ${response.status}`);
      return "";
    }

    const data = (await response.json()) as OllamaResponse;
    let text = data.response.trim();

    // 不要な記号や改行を除去
    text = text.replace(/^[「『"']/g, "").replace(/[」』"']$/g, "");
    text = text.replace(/\n+/g, " ").trim();

    // 長すぎる場合は切り詰め
    if (text.length > 200) {
      text = text.substring(0, 197) + "...";
    }

    console.log(`[Ollama] ${pref.name}: コメント生成完了 (${text.length}文字)`);
    return text;

  } catch (error) {
    console.error(`[Ollama] ${pref.name}: コメント生成エラー:`, error);
    return "";
  }
}

/**
 * 選挙区を分割して生成（大きな県用）
 */
async function generateDistrictsInBatches(
  prefectureId: number,
  newsData: string,
  candidatesData: string
): Promise<DistrictPrediction[]> {
  const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
  const model = process.env.OLLAMA_MODEL || "gemma3:4b";
  const pref = PREFECTURE_DATA[prefectureId];
  if (!pref) return [];

  const totalDistricts = pref.districts;
  const districtMap = new Map<number, DistrictPrediction>(); // 重複防止用

  // 選挙区をバッチに分割
  for (let startIdx = 1; startIdx <= totalDistricts; startIdx += BATCH_SIZE) {
    const endIdx = Math.min(startIdx + BATCH_SIZE - 1, totalDistricts);
    const districtNumbers = Array.from({ length: endIdx - startIdx + 1 }, (_, i) => startIdx + i);
    console.log(`[Ollama] ${pref.name} ${startIdx}〜${endIdx}区を生成中...`);

    // このバッチの候補者データをcandidates.jsonから取得
    let batchCandidatesInfo = "";
    const prefData = candidatesJson.prefectures.find(p => p.id === prefectureId);
    if (prefData) {
      for (const distNum of districtNumbers) {
        const distData = prefData.districts.find(d => d.number === distNum);
        if (distData) {
          batchCandidatesInfo += `### ${pref.name}${distNum}区\n`;
          for (const c of distData.candidates) {
            batchCandidatesInfo += `- ${c.name}（${c.party}、${c.status}）\n`;
          }
        }
      }
    }

    const batchPrompt = `## タスク
${pref.name}の衆議院選挙（2026年2月8日）の予測を作成してください。
対象選挙区: ${districtNumbers.join(", ")}区のみ

## 候補者データ（必ずこの候補者名を使用）
${batchCandidatesInfo}

## ニュースデータ
${newsData.substring(0, 1000)}

## 出力形式
以下のJSON配列形式で出力。必ず${districtNumbers.length}区分（${districtNumbers.join(", ")}区）を出力すること。
候補者名は上記の候補者データから正確に引用すること。
[
  {"districtNumber": ${startIdx}, "districtName": "${pref.name}${startIdx}区", "candidates": [{"name": "上記データの候補者名", "party": "政党名", "isIncumbent": true/false, "predictedVoteShare": 数値}], "leadingCandidate": "1位候補者名", "confidence": "medium"},
  ...（${endIdx}区まで同様の形式で）
]

JSONのみ出力。説明不要。`;

    try {
      const response = await fetch(`${ollamaUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          prompt: batchPrompt,
          stream: false,
          options: { temperature: 0.7, num_predict: 4096, num_ctx: 8192 },
        }),
      });

      if (!response.ok) continue;

      const data = (await response.json()) as OllamaResponse;
      let text = data.response;

      // JSONを抽出
      const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) text = codeBlockMatch[1];

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const districts = JSON.parse(jsonMatch[0]) as DistrictPrediction[];
        // 重複を避けて追加（districtNumberで管理）
        for (const d of districts) {
          const num = d.districtNumber;
          // 有効な区番号のみ追加
          if (num >= 1 && num <= totalDistricts && !districtMap.has(num)) {
            // LLMの候補者が不足している場合、candidates.jsonからマージ
            const jsonCandidates = getCandidatesFromJson(prefectureId, num);
            let mergedCandidates = d.candidates || [];

            if (jsonCandidates.length > mergedCandidates.length) {
              // candidates.jsonの方が多い場合、不足分を追加
              const existingNames = new Set(mergedCandidates.map(c => c.name));
              for (const jc of jsonCandidates) {
                if (!existingNames.has(jc.name)) {
                  mergedCandidates.push(jc);
                }
              }
              console.log(`[Ollama] ${pref.name}${num}区: 候補者をマージ (${d.candidates?.length || 0} → ${mergedCandidates.length})`);
            }

            districtMap.set(num, {
              ...d,
              districtName: `${pref.name}${num}区`, // 名前を正規化
              candidates: normalizeVoteShare(mergedCandidates), // 得票率を正規化
            });
          }
        }
        console.log(`[Ollama] ${districts.length}区分を取得（累計: ${districtMap.size}/${totalDistricts}）`);
      }
    } catch (error) {
      console.error(`[Ollama] バッチ${startIdx}-${endIdx}の生成に失敗:`, error);
    }
  }

  // 不足している区があればcandidates.jsonから補完
  for (let i = 1; i <= totalDistricts; i++) {
    if (!districtMap.has(i)) {
      console.log(`[Ollama] ${pref.name}${i}区が不足、candidates.jsonから補完`);
      const district = createDistrictFromCandidatesJson(prefectureId, i, pref.name);
      districtMap.set(i, district);
    }
  }

  // 区番号順にソートして返す
  return Array.from(districtMap.values()).sort((a, b) => a.districtNumber - b.districtNumber);
}

/**
 * Ollamaを使用して選挙予測を生成
 * @param newsData Perplexityから取得したニュース・調査データ
 * @param prefectureId 都道府県ID（指定時は県別分析）
 * @param candidatesData 候補者データ
 * @param fastMode 高速モード（JSON形式のみ出力、説明なし）
 */
export async function analyzeAndPredict(
  newsData: string,
  prefectureId?: number,
  candidatesData?: string,
  fastMode: boolean = false
): Promise<FinalPrediction> {
  const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
  // gemma3:4b は高速（qwen2.5:14bは高品質だが遅い）
  const model = process.env.OLLAMA_MODEL || "gemma3:4b";

  const targetScope = prefectureId
    ? `都道府県ID ${prefectureId} を中心に`
    : "全国の";

  const candidatesSection = candidatesData
    ? `\n${candidatesData}\n`
    : "";

  // 高速モード用プロンプト（Perplexityデータも活用）
  const generateFastModePrompt = () => {
    if (prefectureId) {
      const pref = PREFECTURE_DATA[prefectureId];
      if (!pref) {
        throw new Error(`Invalid prefecture ID: ${prefectureId}`);
      }
      // horiemon.aiアプローチ: ニュースデータを分析して予測
      return `## タスク
${pref.name}の衆議院選挙（2026年2月8日）の予測を作成してください。
選挙区数: ${pref.districts}区

## 収集されたニュース・調査データ
${newsData}

## 候補者データ
${candidatesSection}

## 出力形式
以下のJSON形式で出力。seatPredictionの合計は必ず${pref.districts}になるよう調整。
leadingParty: ニュースデータから判断した優勢政党
confidence: high（優勢明確）/ medium（接戦）/ low（予測困難）

{"timestamp":"${new Date().toISOString()}","nationalSummary":{"totalSeats":465,"predictions":[{"party":"自民党","seatRange":[170,200],"change":-15},{"party":"中道改革連合","seatRange":[85,105],"change":12},{"party":"日本維新の会","seatRange":[50,65],"change":8},{"party":"公明党","seatRange":[25,32],"change":-2},{"party":"国民民主党","seatRange":[15,22],"change":4},{"party":"共産党","seatRange":[8,12],"change":-1},{"party":"れいわ新選組","seatRange":[5,10],"change":3},{"party":"その他","seatRange":[8,15],"change":0}]},"prefecturePredictions":[{"prefectureId":${prefectureId},"prefectureName":"${pref.name}","leadingParty":"[ニュースから判断]","confidence":"[high/medium/low]","seatPrediction":[{"party":"政党名","seats":数値}]}],"keyBattlegrounds":["${pref.name}の注目区"]}

JSONのみ出力。説明不要。`;
    }

    // 全国モード（固定値）
    return `以下のJSONをそのまま出力してください。
{"timestamp":"${new Date().toISOString()}","nationalSummary":{"totalSeats":465,"predictions":[{"party":"自民党","seatRange":[170,200],"change":-15},{"party":"中道改革連合","seatRange":[85,105],"change":12},{"party":"日本維新の会","seatRange":[50,65],"change":8},{"party":"公明党","seatRange":[25,32],"change":-2},{"party":"国民民主党","seatRange":[15,22],"change":4},{"party":"共産党","seatRange":[8,12],"change":-1},{"party":"れいわ新選組","seatRange":[5,10],"change":3},{"party":"その他","seatRange":[8,15],"change":0}]},"prefecturePredictions":[{"prefectureId":13,"prefectureName":"東京都","leadingParty":"自民党","confidence":"medium","seatPrediction":[{"party":"自民党","seats":12},{"party":"中道改革連合","seats":10},{"party":"日本維新の会","seats":5}]},{"prefectureId":27,"prefectureName":"大阪府","leadingParty":"日本維新の会","confidence":"high","seatPrediction":[{"party":"日本維新の会","seats":14},{"party":"自民党","seats":3},{"party":"公明党","seats":2}]},{"prefectureId":23,"prefectureName":"愛知県","leadingParty":"自民党","confidence":"medium","seatPrediction":[{"party":"自民党","seats":8},{"party":"中道改革連合","seats":5},{"party":"国民民主党","seats":3}]}],"keyBattlegrounds":["東京1区","大阪5区","愛知1区","神奈川18区","福岡2区"]}`;
  };

  const fastModePrompt = generateFastModePrompt();

  // 通常モード用のプロンプト
  const normalPrompt = `あなたは日本の選挙分析の専門家です。2026年2月8日投票の第51回衆議院選挙について、以下の候補者データとニュースデータを分析し、${targetScope}予測を作成してください。
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
- 政党名は候補者データの表記に合わせてください（例：「中道改革連合」「自由民主党」「日本維新の会」など）
- JSONのみを出力してください。説明文は不要です。`;

  // 高速モードかどうかでプロンプトを切り替え（パラメータで判定）
  const prompt = fastMode ? fastModePrompt : normalPrompt;

  try {
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 8192, // 長いJSON出力のため
          num_ctx: 16384, // コンテキスト長を拡大（デフォルト4096→16384）
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as OllamaResponse;
    const text = data.response;

    console.log("Ollama response length:", text.length);
    console.log("Ollama response preview:", text.substring(0, 500));

    // JSONを抽出（Markdownコードブロックを除去）
    let cleanText = text;
    // ```json ... ``` を除去
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      cleanText = codeBlockMatch[1];
    }

    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in Ollama response. Full response:", text);
      throw new Error("No JSON found in Ollama response");
    }

    // JSON内の +数値 を 数値 に変換（+5 -> 5）
    // これはLLMが時々 "change": +5 のような無効なJSONを出力するため
    let jsonText = jsonMatch[0].replace(/:\s*\+(\d)/g, ": $1");

    try {
      const parsed = JSON.parse(jsonText) as FinalPrediction;

      // 個別県指定の場合、議席予測を整合性を持たせる
      if (prefectureId && parsed.prefecturePredictions?.length > 0) {
        const pref = PREFECTURE_DATA[prefectureId];
        if (pref) {
          const targetTotal = pref.districts;

          // 選挙区データを補完
          for (let i = 0; i < parsed.prefecturePredictions.length; i++) {
            const p = parsed.prefecturePredictions[i];
            const existingDistricts = p.districts?.length || 0;

            // 大きな県（10区以上）で選挙区データが不完全な場合、分割生成で補完
            if (targetTotal >= LARGE_PREFECTURE_THRESHOLD && existingDistricts < targetTotal * 0.5) {
              console.log(`[Ollama] ${pref.name}: 選挙区データ不完全 (${existingDistricts}/${targetTotal})。分割生成を実行...`);
              const batchDistricts = await generateDistrictsInBatches(
                prefectureId,
                newsData,
                candidatesData || ""
              );

              if (batchDistricts.length > 0) {
                // 得票率を正規化
                const normalizedBatchDistricts = normalizeDistrictVoteShares(batchDistricts);
                const calculatedSeats = calculateSeatPredictionFromDistricts(normalizedBatchDistricts);
                parsed.prefecturePredictions[i] = {
                  ...p,
                  districts: normalizedBatchDistricts,
                  seatPrediction: calculatedSeats,
                  leadingParty: getLeadingPartyFromSeats(calculatedSeats),
                };
                console.log(`[Ollama] 分割生成完了: ${normalizedBatchDistricts.length}区`);
                continue;
              }
            }

            // 選挙区データがある場合
            if (p.districts && p.districts.length > 0) {
              // 得票率が均等すぎるかチェック
              let uniformCount = 0;
              for (const d of p.districts) {
                if (isVoteShareTooUniform(d.candidates)) {
                  uniformCount++;
                }
              }

              // 半分以上が均等なら再生成
              if (uniformCount > p.districts.length / 2) {
                console.log(`[Ollama] ${pref.name}: 得票率が均等すぎる (${uniformCount}/${p.districts.length}区)。LLMで再生成...`);
                const regeneratedDistricts = await generateDistrictsWithLLM(prefectureId, newsData, 3);
                if (regeneratedDistricts.length > 0) {
                  const normalizedDistricts = normalizeDistrictVoteShares(regeneratedDistricts);
                  const calculatedSeats = calculateSeatPredictionFromDistricts(normalizedDistricts);
                  parsed.prefecturePredictions[i] = {
                    ...p,
                    districts: normalizedDistricts,
                    seatPrediction: calculatedSeats,
                    leadingParty: getLeadingPartyFromSeats(calculatedSeats),
                  };
                  console.log(`[Ollama] 再生成完了: ${normalizedDistricts.length}区`);
                  continue;
                }
              }

              // 得票率を正規化してから議席数を計算
              const normalizedDistricts = normalizeDistrictVoteShares(p.districts);
              const calculatedSeats = calculateSeatPredictionFromDistricts(normalizedDistricts);
              console.log(`[Ollama] 選挙区データから議席計算: ${JSON.stringify(calculatedSeats)}`);
              parsed.prefecturePredictions[i] = {
                ...p,
                districts: normalizedDistricts,
                seatPrediction: calculatedSeats,
                leadingParty: getLeadingPartyFromSeats(calculatedSeats),
              };
            } else {
              // 選挙区データがない場合（小さい県も含む）、LLMから生成を試みる
              console.log(`[Ollama] ${pref.name}: 選挙区データなし。LLMから生成を試みます...`);
              const llmDistricts = await generateDistrictsWithLLM(prefectureId, newsData, 3);

              if (llmDistricts.length > 0) {
                const normalizedDistricts = normalizeDistrictVoteShares(llmDistricts);
                const calculatedSeats = calculateSeatPredictionFromDistricts(normalizedDistricts);
                const finalSeats = p.seatPrediction
                  ? normalizeSeatPrediction(p.seatPrediction, targetTotal)
                  : calculatedSeats;
                parsed.prefecturePredictions[i] = {
                  ...p,
                  districts: normalizedDistricts,
                  seatPrediction: finalSeats,
                  leadingParty: getLeadingPartyFromSeats(finalSeats),
                };
                console.log(`[Ollama] LLMから${normalizedDistricts.length}区を生成`);
              } else if (p.seatPrediction) {
                // candidates.jsonにもない場合は議席予測のみ正規化
                const normalizedSeats = normalizeSeatPrediction(p.seatPrediction, targetTotal);
                parsed.prefecturePredictions[i] = {
                  ...p,
                  seatPrediction: normalizedSeats,
                  leadingParty: getLeadingPartyFromSeats(normalizedSeats),
                };
              }
            }
          }

          // コメント生成（選挙区データがある場合）
          for (let i = 0; i < parsed.prefecturePredictions.length; i++) {
            const p = parsed.prefecturePredictions[i];
            if (p.districts && p.districts.length > 0 && !p.commentary) {
              const commentary = await generateCommentaryWithLLM(
                p.prefectureId,
                p.districts,
                newsData
              );
              if (commentary) {
                parsed.prefecturePredictions[i] = {
                  ...p,
                  commentary,
                };
              }
            }
          }
        }
      }

      return parsed;
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Attempted to parse:", jsonText.substring(0, 1000));
      throw parseError;
    }
  } catch (error) {
    console.error("Ollama prediction error:", error);
    // エラー時はデフォルト予測を返す（高速モードと同じ値）
    return {
      timestamp: new Date().toISOString(),
      nationalSummary: {
        totalSeats: 465,
        predictions: [
          { party: "自民党", seatRange: [170, 200] as [number, number], change: -15 },
          { party: "中道改革連合", seatRange: [85, 105] as [number, number], change: 12 },
          { party: "日本維新の会", seatRange: [50, 65] as [number, number], change: 8 },
          { party: "公明党", seatRange: [25, 32] as [number, number], change: -2 },
          { party: "国民民主党", seatRange: [15, 22] as [number, number], change: 4 },
          { party: "共産党", seatRange: [8, 12] as [number, number], change: -1 },
          { party: "れいわ新選組", seatRange: [5, 10] as [number, number], change: 3 },
          { party: "その他", seatRange: [8, 15] as [number, number], change: 0 },
        ],
      },
      prefecturePredictions: [
        {
          prefectureId: 13,
          prefectureName: "東京都",
          leadingParty: "自民党",
          confidence: "medium" as const,
          seatPrediction: [
            { party: "自民党", seats: 12 },
            { party: "中道改革連合", seats: 10 },
            { party: "日本維新の会", seats: 5 },
          ],
        },
        {
          prefectureId: 27,
          prefectureName: "大阪府",
          leadingParty: "日本維新の会",
          confidence: "high" as const,
          seatPrediction: [
            { party: "日本維新の会", seats: 14 },
            { party: "自民党", seats: 3 },
            { party: "公明党", seats: 2 },
          ],
        },
        {
          prefectureId: 23,
          prefectureName: "愛知県",
          leadingParty: "自民党",
          confidence: "medium" as const,
          seatPrediction: [
            { party: "自民党", seats: 8 },
            { party: "中道改革連合", seats: 5 },
            { party: "国民民主党", seats: 3 },
          ],
        },
      ],
      keyBattlegrounds: ["東京1区", "大阪5区", "愛知1区", "神奈川18区", "福岡2区"],
    };
  }
}
