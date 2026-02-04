"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import JapanMap from "@/components/JapanMap";
import PartyChart from "@/components/PartyChart";
import PredictionCard from "@/components/PredictionCard";
import Legend from "@/components/Legend";

interface PrefecturePrediction {
  prefectureId: number;
  prefectureName: string;
  leadingParty: string;
  confidence: "high" | "medium" | "low";
}

interface NationalPrediction {
  party: string;
  seatRange: [number, number];
  change: number;
}

interface PredictionData {
  timestamp: string;
  nationalSummary: {
    totalSeats: number;
    predictions: NationalPrediction[];
  };
  prefecturePredictions: PrefecturePrediction[];
  keyBattlegrounds: string[];
}

// Mock data for initial display
const mockPrediction: PredictionData = {
  timestamp: new Date().toISOString(),
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
    ],
  },
  prefecturePredictions: [
    { prefectureId: 1, prefectureName: "北海道", leadingParty: "立憲民主党", confidence: "medium" },
    { prefectureId: 2, prefectureName: "青森県", leadingParty: "自民党", confidence: "high" },
    { prefectureId: 3, prefectureName: "岩手県", leadingParty: "立憲民主党", confidence: "medium" },
    { prefectureId: 4, prefectureName: "宮城県", leadingParty: "自民党", confidence: "medium" },
    { prefectureId: 5, prefectureName: "秋田県", leadingParty: "自民党", confidence: "high" },
    { prefectureId: 6, prefectureName: "山形県", leadingParty: "自民党", confidence: "high" },
    { prefectureId: 7, prefectureName: "福島県", leadingParty: "自民党", confidence: "medium" },
    { prefectureId: 8, prefectureName: "茨城県", leadingParty: "自民党", confidence: "high" },
    { prefectureId: 9, prefectureName: "栃木県", leadingParty: "自民党", confidence: "high" },
    { prefectureId: 10, prefectureName: "群馬県", leadingParty: "自民党", confidence: "high" },
    { prefectureId: 11, prefectureName: "埼玉県", leadingParty: "自民党", confidence: "low" },
    { prefectureId: 12, prefectureName: "千葉県", leadingParty: "自民党", confidence: "low" },
    { prefectureId: 13, prefectureName: "東京都", leadingParty: "立憲民主党", confidence: "low" },
    { prefectureId: 14, prefectureName: "神奈川県", leadingParty: "立憲民主党", confidence: "low" },
    { prefectureId: 15, prefectureName: "新潟県", leadingParty: "立憲民主党", confidence: "medium" },
    { prefectureId: 16, prefectureName: "富山県", leadingParty: "自民党", confidence: "high" },
    { prefectureId: 17, prefectureName: "石川県", leadingParty: "自民党", confidence: "high" },
    { prefectureId: 18, prefectureName: "福井県", leadingParty: "自民党", confidence: "high" },
    { prefectureId: 19, prefectureName: "山梨県", leadingParty: "自民党", confidence: "medium" },
    { prefectureId: 20, prefectureName: "長野県", leadingParty: "立憲民主党", confidence: "medium" },
    { prefectureId: 21, prefectureName: "岐阜県", leadingParty: "自民党", confidence: "high" },
    { prefectureId: 22, prefectureName: "静岡県", leadingParty: "自民党", confidence: "medium" },
    { prefectureId: 23, prefectureName: "愛知県", leadingParty: "国民民主党", confidence: "medium" },
    { prefectureId: 24, prefectureName: "三重県", leadingParty: "自民党", confidence: "medium" },
    { prefectureId: 25, prefectureName: "滋賀県", leadingParty: "自民党", confidence: "medium" },
    { prefectureId: 26, prefectureName: "京都府", leadingParty: "立憲民主党", confidence: "low" },
    { prefectureId: 27, prefectureName: "大阪府", leadingParty: "日本維新の会", confidence: "high" },
    { prefectureId: 28, prefectureName: "兵庫県", leadingParty: "日本維新の会", confidence: "medium" },
    { prefectureId: 29, prefectureName: "奈良県", leadingParty: "日本維新の会", confidence: "medium" },
    { prefectureId: 30, prefectureName: "和歌山県", leadingParty: "自民党", confidence: "high" },
    { prefectureId: 31, prefectureName: "鳥取県", leadingParty: "自民党", confidence: "high" },
    { prefectureId: 32, prefectureName: "島根県", leadingParty: "自民党", confidence: "high" },
    { prefectureId: 33, prefectureName: "岡山県", leadingParty: "自民党", confidence: "high" },
    { prefectureId: 34, prefectureName: "広島県", leadingParty: "自民党", confidence: "medium" },
    { prefectureId: 35, prefectureName: "山口県", leadingParty: "自民党", confidence: "high" },
    { prefectureId: 36, prefectureName: "徳島県", leadingParty: "自民党", confidence: "high" },
    { prefectureId: 37, prefectureName: "香川県", leadingParty: "自民党", confidence: "high" },
    { prefectureId: 38, prefectureName: "愛媛県", leadingParty: "自民党", confidence: "high" },
    { prefectureId: 39, prefectureName: "高知県", leadingParty: "自民党", confidence: "high" },
    { prefectureId: 40, prefectureName: "福岡県", leadingParty: "自民党", confidence: "medium" },
    { prefectureId: 41, prefectureName: "佐賀県", leadingParty: "自民党", confidence: "high" },
    { prefectureId: 42, prefectureName: "長崎県", leadingParty: "自民党", confidence: "high" },
    { prefectureId: 43, prefectureName: "熊本県", leadingParty: "自民党", confidence: "high" },
    { prefectureId: 44, prefectureName: "大分県", leadingParty: "自民党", confidence: "high" },
    { prefectureId: 45, prefectureName: "宮崎県", leadingParty: "自民党", confidence: "high" },
    { prefectureId: 46, prefectureName: "鹿児島県", leadingParty: "自民党", confidence: "high" },
    { prefectureId: 47, prefectureName: "沖縄県", leadingParty: "れいわ新選組", confidence: "low" },
  ],
  keyBattlegrounds: ["東京1区", "神奈川18区", "愛知1区", "大阪10区", "福岡2区"],
};

export default function Home() {
  const router = useRouter();
  const [prediction, setPrediction] = useState<PredictionData>(mockPrediction);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // 初回読み込み時にキャッシュから取得（APIを呼ばない）
  useEffect(() => {
    async function loadFromCache() {
      try {
        // refresh=false なのでキャッシュがあればそれを返す
        const response = await fetch("/api/predict");
        if (response.ok) {
          const data = await response.json();
          if (data && data.nationalSummary) {
            setPrediction(data);
            if (data.timestamp && data.timestamp !== "") {
              setLastUpdated(new Date(data.timestamp).toLocaleString("ja-JP"));
              return;
            } else {
              setLastUpdated("未取得（ダミーデータ）");
              return;
            }
          }
        }
      } catch (error) {
        console.error("Failed to load from cache:", error);
      }
      setLastUpdated(new Date().toLocaleString("ja-JP"));
    }
    loadFromCache();
  }, []);

  const handlePrefectureClick = (prefectureId: number, prefectureName: string) => {
    router.push(`/prefecture/${prefectureId}`);
  };

  const handleRefresh = async (fastMode: boolean = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ refresh: "true" });
      if (fastMode) params.append("fast", "true");
      const response = await fetch(`/api/predict?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPrediction(data);
        setLastUpdated(new Date().toLocaleString("ja-JP"));
      }
    } catch (error) {
      console.error("Failed to refresh prediction:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            2026年 衆議院選挙 AI予測
          </h1>
          <p className="mt-1 text-gray-600">
            複数のAIが分析した選挙情勢予測
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">最終更新: {lastUpdated}</p>
          <div className="mt-2 flex gap-2 justify-end">
            <button
              onClick={() => handleRefresh(true)}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              title="ニュース検索をスキップして高速更新"
            >
              {loading ? "更新中..." : "⚡ 高速更新"}
            </button>
            <button
              onClick={() => handleRefresh(false)}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              title="最新ニュースを取得して詳細更新"
            >
              {loading ? "更新中..." : "🔄 詳細更新"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Map Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              都道府県別 優勢政党マップ
            </h2>
            <JapanMap
              predictions={prediction.prefecturePredictions}
              onPrefectureClick={handlePrefectureClick}
              width={700}
              height={550}
            />
            <p className="mt-2 text-sm text-gray-500 text-center">
              都道府県をクリックすると詳細が表示されます
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Legend />

          {/* Key Battlegrounds */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-semibold text-gray-900 mb-3">注目選挙区</h3>
            <ul className="space-y-2">
              {prediction.keyBattlegrounds.map((district, index) => (
                <li
                  key={index}
                  className="text-sm text-gray-700 flex items-center"
                >
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2" />
                  {district}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Party Seat Prediction Chart */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          政党別 予測獲得議席数
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          総議席数: {prediction.nationalSummary.totalSeats}議席（小選挙区289 + 比例代表176）
        </p>
        <PartyChart predictions={prediction.nationalSummary.predictions} />
      </div>

      {/* Prefecture Overview */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          都道府県別 情勢概要
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prediction.prefecturePredictions.slice(0, 9).map((pref) => (
            <PredictionCard
              key={pref.prefectureId}
              title={pref.prefectureName}
              party={pref.leadingParty}
              confidence={pref.confidence}
              onClick={() => handlePrefectureClick(pref.prefectureId, pref.prefectureName)}
            />
          ))}
        </div>
        <div className="mt-4 text-center">
          <button
            onClick={() => router.push("/prefecture/13")}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            すべての都道府県を見る →
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>注意:</strong> この予測はAIによる分析結果であり、実際の選挙結果を保証するものではありません。
          予測は公開情報（ニュース、世論調査など）に基づいており、定期的に更新されます。
        </p>
      </div>
    </div>
  );
}
