"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import JapanMap from "@/components/JapanMap";
import PartyChart from "@/components/PartyChart";
import PredictionCard from "@/components/PredictionCard";
import Legend from "@/components/Legend";
import { getPartyColor, normalizePartyName } from "@/lib/utils/colors";

interface SeatPrediction {
  party: string;
  seats: number;
}

interface PrefecturePrediction {
  prefectureId: number;
  prefectureName: string;
  leadingParty: string;
  confidence: "high" | "medium" | "low";
  seatPrediction?: SeatPrediction[];
  commentary?: string;
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

interface PrefectureNewsCacheStatus {
  prefectureId: number;
  prefectureName: string;
  hasCached: boolean;
  cachedAt: string | null;
}

// Mock data for initial display
const mockPrediction: PredictionData = {
  timestamp: new Date().toISOString(),
  nationalSummary: {
    totalSeats: 465,
    predictions: [
      { party: "自民党", seatRange: [180, 210], change: -30 },
      { party: "中道改革連合", seatRange: [100, 130], change: 20 },
      { party: "日本維新の会", seatRange: [50, 70], change: 10 },
      { party: "公明党", seatRange: [25, 35], change: -5 },
      { party: "国民民主党", seatRange: [15, 25], change: 5 },
      { party: "共産党", seatRange: [10, 15], change: 0 },
      { party: "れいわ新選組", seatRange: [5, 10], change: 3 },
    ],
  },
  prefecturePredictions: [
    { prefectureId: 1, prefectureName: "北海道", leadingParty: "中道改革連合", confidence: "medium" },
    { prefectureId: 2, prefectureName: "青森県", leadingParty: "自民党", confidence: "high" },
    { prefectureId: 3, prefectureName: "岩手県", leadingParty: "中道改革連合", confidence: "medium" },
    { prefectureId: 4, prefectureName: "宮城県", leadingParty: "自民党", confidence: "medium" },
    { prefectureId: 5, prefectureName: "秋田県", leadingParty: "自民党", confidence: "high" },
    { prefectureId: 6, prefectureName: "山形県", leadingParty: "自民党", confidence: "high" },
    { prefectureId: 7, prefectureName: "福島県", leadingParty: "自民党", confidence: "medium" },
    { prefectureId: 8, prefectureName: "茨城県", leadingParty: "自民党", confidence: "high" },
    { prefectureId: 9, prefectureName: "栃木県", leadingParty: "自民党", confidence: "high" },
    { prefectureId: 10, prefectureName: "群馬県", leadingParty: "自民党", confidence: "high" },
    { prefectureId: 11, prefectureName: "埼玉県", leadingParty: "自民党", confidence: "low" },
    { prefectureId: 12, prefectureName: "千葉県", leadingParty: "自民党", confidence: "low" },
    { prefectureId: 13, prefectureName: "東京都", leadingParty: "中道改革連合", confidence: "low" },
    { prefectureId: 14, prefectureName: "神奈川県", leadingParty: "中道改革連合", confidence: "low" },
    { prefectureId: 15, prefectureName: "新潟県", leadingParty: "中道改革連合", confidence: "medium" },
    { prefectureId: 16, prefectureName: "富山県", leadingParty: "自民党", confidence: "high" },
    { prefectureId: 17, prefectureName: "石川県", leadingParty: "自民党", confidence: "high" },
    { prefectureId: 18, prefectureName: "福井県", leadingParty: "自民党", confidence: "high" },
    { prefectureId: 19, prefectureName: "山梨県", leadingParty: "自民党", confidence: "medium" },
    { prefectureId: 20, prefectureName: "長野県", leadingParty: "中道改革連合", confidence: "medium" },
    { prefectureId: 21, prefectureName: "岐阜県", leadingParty: "自民党", confidence: "high" },
    { prefectureId: 22, prefectureName: "静岡県", leadingParty: "自民党", confidence: "medium" },
    { prefectureId: 23, prefectureName: "愛知県", leadingParty: "国民民主党", confidence: "medium" },
    { prefectureId: 24, prefectureName: "三重県", leadingParty: "自民党", confidence: "medium" },
    { prefectureId: 25, prefectureName: "滋賀県", leadingParty: "自民党", confidence: "medium" },
    { prefectureId: 26, prefectureName: "京都府", leadingParty: "中道改革連合", confidence: "low" },
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
  const [selectedParty, setSelectedParty] = useState<string | null>(null);
  const [seatTab, setSeatTab] = useState<"total" | "single" | "proportional">("total");
  const [fullUpdateProgress, setFullUpdateProgress] = useState<{ current: number; total: number } | null>(null);
  const [newsCacheCount, setNewsCacheCount] = useState<number>(0);
  const [newsCacheDetails, setNewsCacheDetails] = useState<PrefectureNewsCacheStatus[]>([]);
  const [showNewsCacheTable, setShowNewsCacheTable] = useState(false);
  const [fetchingPrefecture, setFetchingPrefecture] = useState<number | null>(null);
  const [fetchingAllNews, setFetchingAllNews] = useState(false);

  // ニュースキャッシュ情報を取得
  const fetchNewsCacheInfo = async () => {
    try {
      const response = await fetch("/api/predict?cacheStatus=true&detailed=true");
      if (response.ok) {
        const data = await response.json();
        setNewsCacheCount(data.news?.count || 0);
        setNewsCacheDetails(data.news?.prefectures || []);
      }
    } catch (error) {
      console.error("Failed to fetch cache status:", error);
    }
  };

  // 個別県のニュースを取得
  const handleFetchPrefectureNews = async (prefectureName: string, prefectureId: number) => {
    setFetchingPrefecture(prefectureId);
    try {
      const response = await fetch(`/api/predict?fetchNews=${encodeURIComponent(prefectureName)}`);
      if (response.ok) {
        await fetchNewsCacheInfo(); // キャッシュ情報を更新
      }
    } catch (error) {
      console.error(`Failed to fetch news for ${prefectureName}:`, error);
    } finally {
      setFetchingPrefecture(null);
    }
  };

  // 全県のニュースを取得（5並列）
  const handleFetchAllNews = async () => {
    if (fetchingAllNews) return;
    setFetchingAllNews(true);

    const PARALLEL_COUNT = 5;
    const uncachedPrefectures = newsCacheDetails.filter(p => !p.hasCached);

    // バッチに分割
    for (let i = 0; i < uncachedPrefectures.length; i += PARALLEL_COUNT) {
      const batch = uncachedPrefectures.slice(i, i + PARALLEL_COUNT);
      setFetchingPrefecture(batch[0].prefectureId); // 最初の県IDを表示

      // 並列実行
      await Promise.all(
        batch.map(async (pref) => {
          try {
            await fetch(`/api/predict?fetchNews=${encodeURIComponent(pref.prefectureName)}`);
          } catch (error) {
            console.error(`Failed to fetch news for ${pref.prefectureName}:`, error);
          }
        })
      );

      await fetchNewsCacheInfo(); // バッチ完了ごとにUI更新
    }
    setFetchingPrefecture(null);
    setFetchingAllNews(false);
  };

  // ニュースキャッシュをクリア
  const handleClearNewsCache = async () => {
    if (!confirm("ニュースキャッシュをクリアしますか？\n次回の詳細更新時にPerplexity APIを再呼び出しします。")) return;
    try {
      await fetch("/api/predict?clearNews=true");
      setNewsCacheCount(0);
      setNewsCacheDetails(details => details.map(d => ({ ...d, hasCached: false, cachedAt: null })));
    } catch (error) {
      console.error("Failed to clear news cache:", error);
    }
  };

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
    fetchNewsCacheInfo();
  }, []);

  const handlePrefectureClick = (prefectureId: number, prefectureName: string) => {
    router.push(`/prefecture/${prefectureId}`);
  };

  const handlePartyClick = (party: string) => {
    setSelectedParty(selectedParty === party ? null : party);
  };

  // 選択した政党が議席獲得可能な都道府県を取得（議席数付き、多い順にソート）
  // 「優勢」ではなく「少なくとも1区でトップ」の県を表示
  const getPrefecturesWithSeats = () => {
    if (!selectedParty) return [];
    const normalizedSelected = normalizePartyName(selectedParty);
    return prediction.prefecturePredictions
      .filter((pref) => {
        // seatPredictionで該当政党が1議席以上持っている県を抽出
        return pref.seatPrediction?.some((s) => {
          const normalizedParty = normalizePartyName(s.party);
          return normalizedParty === normalizedSelected && s.seats > 0;
        });
      })
      .map((pref) => {
        // 政党名の正規化を考慮して議席数を取得
        const seatInfo = pref.seatPrediction?.find((s) =>
          normalizePartyName(s.party) === normalizedSelected
        );
        return {
          ...pref,
          partySeats: seatInfo?.seats ?? 0,
          isLeading: normalizePartyName(pref.leadingParty) === normalizedSelected,
        };
      })
      .sort((a, b) => b.partySeats - a.partySeats);
  };

  // 県データから政党別議席を集計（10県以上あれば使用）
  const calculateFromPrefectures = () => {
    const prefPredictions = prediction.prefecturePredictions || [];
    const validPrefectures = prefPredictions.filter(
      p => p.seatPrediction && p.seatPrediction.length > 0
    );

    // 10県未満の場合はnullを返す
    if (validPrefectures.length < 10) {
      return null;
    }

    // 政党別に議席を集計（政党名を正規化）
    const partySeats = new Map<string, number>();
    for (const pref of validPrefectures) {
      for (const seat of pref.seatPrediction || []) {
        const normalizedParty = normalizePartyName(seat.party);
        const current = partySeats.get(normalizedParty) || 0;
        partySeats.set(normalizedParty, current + seat.seats);
      }
    }

    // 配列に変換してソート
    const aggregated = Array.from(partySeats.entries())
      .map(([party, seats]) => ({
        party,
        seatRange: [Math.max(0, seats - 5), seats + 5] as [number, number],
        change: 0,
      }))
      .sort((a, b) => {
        const aSeats = (a.seatRange[0] + a.seatRange[1]) / 2;
        const bSeats = (b.seatRange[0] + b.seatRange[1]) / 2;
        return bSeats - aSeats;
      });

    return { aggregated, prefectureCount: validPrefectures.length };
  };

  const prefectureAggregation = calculateFromPrefectures();

  // 小選挙区と比例代表の議席を計算
  const calculateSeatsByType = () => {
    // 県データから集計した値があればそれを使用
    const basePredictions = prefectureAggregation?.aggregated || prediction.nationalSummary.predictions;

    // 合計議席から各タイプの議席を推計
    const singleMemberTotal = 289;
    const proportionalTotal = 176;

    // 小選挙区：現在の予測を289議席にスケール
    const currentTotal = basePredictions.reduce(
      (sum, p) => sum + Math.round((p.seatRange[0] + p.seatRange[1]) / 2), 0
    );
    const singleMemberScale = currentTotal > 0 ? singleMemberTotal / currentTotal : 1;

    const singleMember = basePredictions.map(p => {
      const midpoint = Math.round((p.seatRange[0] + p.seatRange[1]) / 2);
      const scaled = Math.round(midpoint * singleMemberScale);
      const range = Math.round((p.seatRange[1] - p.seatRange[0]) / 2 * singleMemberScale);
      return {
        party: p.party,
        seatRange: [Math.max(0, scaled - range), scaled + range] as [number, number],
        change: 0,
      };
    });

    // 比例代表：得票率から推計（大政党は小選挙区で有利、小政党は比例で有利）
    const proportional = basePredictions.map(p => {
      const midpoint = Math.round((p.seatRange[0] + p.seatRange[1]) / 2);
      const ratio = currentTotal > 0 ? midpoint / currentTotal : 0;

      // 小政党補正（比例では小政党が相対的に有利）
      let adjustedRatio = ratio;
      if (ratio < 0.1) adjustedRatio = ratio * 1.3;
      else if (ratio > 0.3) adjustedRatio = ratio * 0.9;

      const seats = Math.round(proportionalTotal * adjustedRatio);
      const range = Math.round(seats * 0.15);
      return {
        party: p.party,
        seatRange: [Math.max(0, seats - range), seats + range] as [number, number],
        change: 0,
      };
    });

    return { singleMember, proportional };
  };

  const { singleMember, proportional } = calculateSeatsByType();

  const getCurrentPredictions = () => {
    switch (seatTab) {
      case "single": return singleMember;
      case "proportional": return proportional;
      default:
        // 県データから集計した値があればそれを使用
        return prefectureAggregation?.aggregated || prediction.nationalSummary.predictions;
    }
  };

  const getSeatLabel = () => {
    const prefCount = prefectureAggregation?.prefectureCount;
    const dataSource = prefCount ? `（${prefCount}県データから集計）` : "";
    switch (seatTab) {
      case "single": return `小選挙区 289議席${dataSource}`;
      case "proportional": return `比例代表 176議席${dataSource}`;
      default: return `総議席数: 465議席（小選挙区289 + 比例代表176）${dataSource}`;
    }
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

  // 47都道府県を3県ずつバッチ更新
  const handleFullUpdate = async () => {
    if (loading || fullUpdateProgress) return;

    const BATCH_SIZE = 3;
    const allPrefIds = Array.from({ length: 47 }, (_, i) => i + 1);
    const batches: number[][] = [];
    for (let i = 0; i < allPrefIds.length; i += BATCH_SIZE) {
      batches.push(allPrefIds.slice(i, i + BATCH_SIZE));
    }

    // 表示をリセット（マップをグレー、議席予測を0に）
    const PREFECTURE_NAMES = [
      "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
      "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
      "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
      "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
      "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
      "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
      "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
    ];
    setPrediction({
      timestamp: "",
      nationalSummary: {
        totalSeats: 465,
        predictions: [
          { party: "自民党", seatRange: [0, 0], change: 0 },
          { party: "中道改革連合", seatRange: [0, 0], change: 0 },
          { party: "日本維新の会", seatRange: [0, 0], change: 0 },
          { party: "公明党", seatRange: [0, 0], change: 0 },
          { party: "国民民主党", seatRange: [0, 0], change: 0 },
          { party: "共産党", seatRange: [0, 0], change: 0 },
          { party: "れいわ新選組", seatRange: [0, 0], change: 0 },
        ],
      },
      prefecturePredictions: PREFECTURE_NAMES.map((name, i) => ({
        prefectureId: i + 1,
        prefectureName: name,
        leadingParty: "", // 空にするとグレー表示になる
        confidence: "low" as const,
      })),
      keyBattlegrounds: [],
    });
    setLastUpdated("更新中...");

    // サーバー側のキャッシュもクリア
    try {
      await fetch("/api/predict?clearCache=true");
    } catch (e) {
      console.error("Failed to clear cache:", e);
    }

    setFullUpdateProgress({ current: 0, total: 47 });

    let completed = 0;
    for (const batch of batches) {
      await Promise.all(
        batch.map(async (prefId) => {
          try {
            await fetch(`/api/predict?refresh=true&fast=true&prefectureId=${prefId}`);
          } catch (e) {
            console.error(`Failed to update prefecture ${prefId}:`, e);
          }
          completed++;
          setFullUpdateProgress({ current: completed, total: 47 });
        })
      );

      // バッチ完了ごとに集計してマップを更新
      try {
        const response = await fetch("/api/predict?aggregate=true");
        if (response.ok) {
          const data = await response.json();
          setPrediction(data);
          setLastUpdated(new Date().toLocaleString("ja-JP"));
        }
      } catch (e) {
        // 集計失敗は無視して続行
      }
    }

    setFullUpdateProgress(null);
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
          <div className="mt-2 flex gap-2 justify-end flex-wrap">
            <button
              onClick={() => handleRefresh(true)}
              disabled={loading || !!fullUpdateProgress}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              title="3県のみ更新（キャッシュ使用）"
            >
              {loading ? "更新中..." : "🔬 サンプル更新"}
            </button>
            <button
              onClick={handleFullUpdate}
              disabled={loading || !!fullUpdateProgress}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              title="全47都道府県を更新（約1-2分）"
            >
              {fullUpdateProgress
                ? `🗾 ${fullUpdateProgress.current}/${fullUpdateProgress.total}県`
                : "🗾 全県更新"}
            </button>
            <button
              onClick={() => handleRefresh(false)}
              disabled={loading || !!fullUpdateProgress}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              title="Perplexity APIで最新ニュースを再取得"
            >
              {loading ? "更新中..." : "📊 全国概要"}
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

          {/* News Cache Info */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">ニュースデータ</h3>
              <button
                onClick={() => setShowNewsCacheTable(!showNewsCacheTable)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                {showNewsCacheTable ? "▲ 閉じる" : "▼ 詳細"}
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              キャッシュ件数: {newsCacheCount}/47件
            </p>
            <div className="flex gap-2 mb-3">
              <button
                onClick={handleFetchAllNews}
                disabled={fetchingAllNews || newsCacheCount === 47}
                className="flex-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {fetchingAllNews ? "取得中..." : "未取得県を一括取得"}
              </button>
              <button
                onClick={handleClearNewsCache}
                disabled={newsCacheCount === 0}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                クリア
              </button>
            </div>

            {/* キャッシュ詳細テーブル */}
            {showNewsCacheTable && (
              <div className="max-h-64 overflow-y-auto border rounded">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left px-2 py-1">都道府県</th>
                      <th className="text-center px-2 py-1">状態</th>
                      <th className="text-left px-2 py-1">最終更新</th>
                      <th className="text-right px-2 py-1">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newsCacheDetails.map((pref) => (
                      <tr key={pref.prefectureId} className="border-t hover:bg-gray-50">
                        <td className="px-2 py-1">{pref.prefectureName}</td>
                        <td className="px-2 py-1 text-center">
                          {pref.hasCached ? (
                            <span className="text-green-600">✓</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-2 py-1 text-gray-500">
                          {pref.cachedAt ? new Date(pref.cachedAt).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"}
                        </td>
                        <td className="px-2 py-1 text-right">
                          <button
                            onClick={() => handleFetchPrefectureNews(pref.prefectureName, pref.prefectureId)}
                            disabled={fetchingPrefecture === pref.prefectureId}
                            className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                          >
                            {fetchingPrefecture === pref.prefectureId ? "..." : "取得"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Party Seat Prediction Chart */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          政党別 予測獲得議席数
        </h2>

        {/* タブ切り替え */}
        <div className="flex gap-1 mb-4 border-b">
          <button
            onClick={() => setSeatTab("total")}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              seatTab === "total"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            合計（465議席）
          </button>
          <button
            onClick={() => setSeatTab("single")}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              seatTab === "single"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            小選挙区（289議席）
          </button>
          <button
            onClick={() => setSeatTab("proportional")}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              seatTab === "proportional"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            比例代表（176議席）
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          {getSeatLabel()}
          <span className="ml-2 text-blue-600">※ 政党をクリックで議席獲得可能地域を表示</span>
          {seatTab === "proportional" && (
            <span className="ml-2 text-orange-500">※ 比例は推計値</span>
          )}
        </p>
        <PartyChart
          predictions={getCurrentPredictions()}
          singleMemberData={singleMember}
          proportionalData={proportional}
          mode={seatTab}
          onPartyClick={handlePartyClick}
          selectedParty={selectedParty}
        />

        {/* 選択した政党が議席獲得可能な都道府県一覧 */}
        {selectedParty && (
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center gap-2 mb-4">
              <span
                className="w-4 h-4 rounded"
                style={{ backgroundColor: getPartyColor(selectedParty) }}
              />
              <h3 className="font-semibold text-gray-900">
                {selectedParty}が議席獲得可能な都道府県（{getPrefecturesWithSeats().length}件）
              </h3>
              <button
                onClick={() => setSelectedParty(null)}
                className="ml-auto text-sm text-gray-500 hover:text-gray-700"
              >
                ✕ 閉じる
              </button>
            </div>
            {getPrefecturesWithSeats().length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {getPrefecturesWithSeats().map((pref) => (
                  <button
                    key={pref.prefectureId}
                    onClick={() => handlePrefectureClick(pref.prefectureId, pref.prefectureName)}
                    className={`p-2 text-sm rounded border text-left flex items-center justify-between text-gray-800 ${
                      pref.isLeading ? "bg-blue-50 border-blue-200" : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          pref.isLeading
                            ? "bg-blue-500"
                            : "bg-gray-400"
                        }`}
                      />
                      {pref.prefectureName}
                      {pref.isLeading && (
                        <span className="text-xs text-blue-600">★</span>
                      )}
                    </span>
                    {pref.partySeats > 0 && (
                      <span className="text-xs font-medium text-gray-500 ml-1">
                        {pref.partySeats}議席
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                この政党が議席獲得可能な都道府県はありません
              </p>
            )}
            <p className="mt-2 text-xs text-gray-400">
              ★ = その県で最多議席（優勢）
            </p>
          </div>
        )}
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
