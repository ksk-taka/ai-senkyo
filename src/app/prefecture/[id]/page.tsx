"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { prefectures } from "@/lib/data/districts";
import { parties } from "@/lib/data/parties";
import ConfidenceBadge from "@/components/ConfidenceBadge";

interface Candidate {
  name: string;
  party: string;
  isIncumbent?: boolean;
  predictedVoteShare?: number;
}

interface DistrictPrediction {
  districtNumber: number;
  districtName: string;
  candidates: Candidate[];
  leadingCandidate?: string;
  confidence: "high" | "medium" | "low";
}

interface PrefecturePrediction {
  prefectureId: number;
  prefectureName: string;
  leadingParty: string;
  confidence: "high" | "medium" | "low";
  seatPrediction: { party: string; seats: number }[];
  districts?: DistrictPrediction[];
}

export default function PrefecturePage() {
  const params = useParams();
  const router = useRouter();
  const prefectureId = parseInt(params.id as string);
  const prefecture = prefectures.find((p) => p.id === prefectureId);

  const [prediction, setPrediction] = useState<PrefecturePrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // キャッシュから読み込み（APIを呼ばない）
  const loadFromCache = useCallback(async () => {
    setLoading(true);
    try {
      // refresh=false なのでキャッシュがあればそれを返す、なければモックデータ
      const response = await fetch(`/api/predict?prefectureId=${prefectureId}`);
      if (response.ok) {
        const data = await response.json();
        const prefPrediction = data.prefecturePredictions?.find(
          (p: PrefecturePrediction) => p.prefectureId === prefectureId
        );
        setPrediction(prefPrediction || null);
        if (data.timestamp && data.timestamp !== "") {
          setLastUpdated(new Date(data.timestamp).toLocaleString("ja-JP"));
        } else {
          setLastUpdated("未取得（ダミーデータ）");
        }
      }
    } catch (error) {
      console.error("Failed to load prediction:", error);
    } finally {
      setLoading(false);
    }
  }, [prefectureId]);

  // 更新ボタン押下時のみAPIを呼び出す
  const refreshPrediction = async (fastMode: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        prefectureId: String(prefectureId),
        refresh: "true"  // これでAPIを呼び出す
      });
      if (fastMode) params.append("fast", "true");
      const response = await fetch(`/api/predict?${params}`);
      if (response.ok) {
        const data = await response.json();
        const prefPrediction = data.prefecturePredictions?.find(
          (p: PrefecturePrediction) => p.prefectureId === prefectureId
        );
        setPrediction(prefPrediction || null);
        if (data.timestamp && data.timestamp !== "") {
          setLastUpdated(new Date(data.timestamp).toLocaleString("ja-JP"));
          setError(null);
        } else {
          // タイムスタンプが空 = API失敗でモックデータが返された
          setError("AI APIのレート制限に達しました。しばらく待ってから再試行してください。");
          setLastUpdated("未取得（ダミーデータ）");
        }
      } else {
        setError("予測の更新に失敗しました。");
      }
    } catch (err) {
      console.error("Failed to refresh prediction:", err);
      setError("ネットワークエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFromCache(); // 初回はキャッシュから読み込み（即座に表示）
  }, [loadFromCache]);

  // キーボードナビゲーション（← → キーで前後の都道府県に移動）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 入力フォーカス時は無効化
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === "ArrowLeft") {
        const prevId = prefectureId > 1 ? prefectureId - 1 : 47;
        router.push(`/prefecture/${prevId}`);
      } else if (e.key === "ArrowRight") {
        const nextId = prefectureId < 47 ? prefectureId + 1 : 1;
        router.push(`/prefecture/${nextId}`);
      } else if (e.key === "Escape") {
        router.push("/");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prefectureId, router]);

  if (!prefecture) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">
          都道府県が見つかりません
        </h1>
        <button
          onClick={() => router.push("/")}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          トップページに戻る
        </button>
      </div>
    );
  }

  // Calculate summary from prediction or use empty
  const sortedParties = prediction?.seatPrediction
    ?.sort((a, b) => b.seats - a.seats)
    .map(({ party, seats }) => ({ party, count: seats })) || [];

  const districts = prediction?.districts || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push("/")}
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center"
          >
            ← 全国マップに戻る
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{prefecture.name}</h1>
          <p className="mt-1 text-gray-600">
            小選挙区数: {prefecture.districts}区
            {prediction && (
              <span className="ml-4">
                <ConfidenceBadge confidence={prediction.confidence} size="sm" />
              </span>
            )}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 mb-2">
            最終更新: {lastUpdated || "読み込み中..."}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => refreshPrediction(true)}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              title="ニュース検索をスキップして高速更新"
            >
              {loading ? "更新中..." : "⚡ 高速更新"}
            </button>
            <button
              onClick={() => refreshPrediction(false)}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              title="最新ニュースを取得して詳細更新"
            >
              {loading ? "更新中..." : "🔄 詳細更新"}
            </button>
          </div>
        </div>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">AI予測を読み込み中...</p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              政党別予測議席
            </h2>
            {sortedParties.length > 0 ? (
              <div className="flex flex-wrap gap-4">
                {sortedParties.map(({ party, count }) => {
                  const partyData = parties.find((p) => p.name === party);
                  return (
                    <div
                      key={party}
                      className="flex items-center space-x-2 bg-gray-50 rounded-lg px-4 py-2"
                    >
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: partyData?.color || "#808080" }}
                      />
                      <span className="font-medium">{party}</span>
                      <span className="text-lg font-bold text-gray-900">
                        {count}議席
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">予測データがありません</p>
            )}
          </div>

          {/* District List */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              選挙区別予測
            </h2>
            {districts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {districts.map((district) => (
                  <div
                    key={district.districtNumber}
                    className="bg-white rounded-lg shadow-sm border p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">
                        {district.districtName}
                      </h3>
                      <ConfidenceBadge confidence={district.confidence} size="sm" />
                    </div>
                    <div className="space-y-2">
                      {district.candidates
                        .sort((a, b) => (b.predictedVoteShare || 0) - (a.predictedVoteShare || 0))
                        .map((candidate, index) => {
                          const partyData = parties.find((p) => p.name === candidate.party);
                          const isLeading = candidate.name === district.leadingCandidate || index === 0;
                          return (
                            <div
                              key={index}
                              className="flex items-center justify-between text-sm"
                            >
                              <div className="flex items-center space-x-2">
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: partyData?.color || "#808080" }}
                                />
                                <span
                                  className={isLeading ? "font-medium text-gray-900" : "text-gray-600"}
                                >
                                  {candidate.name}
                                  {candidate.isIncumbent && (
                                    <span className="ml-1 text-xs text-orange-600">現</span>
                                  )}
                                </span>
                                <span className="text-xs text-gray-400">
                                  ({partyData?.shortName || candidate.party})
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width: `${candidate.predictedVoteShare || 0}%`,
                                      backgroundColor: partyData?.color || "#808080",
                                    }}
                                  />
                                </div>
                                <span className="text-xs text-gray-500 w-8">
                                  {candidate.predictedVoteShare?.toFixed(0) || "?"}%
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  この都道府県の詳細な選挙区データはまだ生成されていません。
                  「予測を更新」ボタンを押すとAIが候補者情報を含む予測を生成します。
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center bg-white rounded-lg shadow-sm border p-4">
        <button
          onClick={() => {
            const prevId = prefectureId > 1 ? prefectureId - 1 : 47;
            router.push(`/prefecture/${prevId}`);
          }}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <span className="text-xs text-gray-400 hidden sm:inline">[←]</span>
          ← {prefectures.find((p) => p.id === (prefectureId > 1 ? prefectureId - 1 : 47))?.name}
        </button>
        <div className="text-center">
          <span className="text-gray-500 text-sm block">
            {prefectureId} / 47
          </span>
          <span className="text-xs text-gray-400 hidden sm:block">
            ← → キーで移動 / Escで全国へ
          </span>
        </div>
        <button
          onClick={() => {
            const nextId = prefectureId < 47 ? prefectureId + 1 : 1;
            router.push(`/prefecture/${nextId}`);
          }}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          {prefectures.find((p) => p.id === (prefectureId < 47 ? prefectureId + 1 : 1))?.name} →
          <span className="text-xs text-gray-400 hidden sm:inline">[→]</span>
        </button>
      </div>
    </div>
  );
}
