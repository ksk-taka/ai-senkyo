import { NextRequest, NextResponse } from "next/server";
import { getElectionPrediction } from "@/lib/ai/integrator";
import { aggregateNationalPrediction, saveNationalPrediction, clearPrefectureCache } from "@/lib/cache/predictionCache";
import { clearNewsCache, getNewsCacheInfo, getDetailedNewsCacheInfo, getElectionNews, getCachedNewsForPrefecture } from "@/lib/ai/perplexity";

// Next.jsのルートキャッシュを無効化（ファイルキャッシュの変更を即座に反映）
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const prefectureId = searchParams.get("prefectureId");
  const forceRefresh = searchParams.get("refresh") === "true";
  const fastMode = searchParams.get("fast") === "true";
  const aggregateMode = searchParams.get("aggregate") === "true";
  const clearCache = searchParams.get("clearCache") === "true";
  const clearNews = searchParams.get("clearNews") === "true";
  const getCacheStatus = searchParams.get("cacheStatus") === "true";

  try {
    // キャッシュ状態の取得
    if (getCacheStatus) {
      const detailed = searchParams.get("detailed") === "true";
      if (detailed) {
        const detailedInfo = getDetailedNewsCacheInfo();
        return NextResponse.json({
          news: detailedInfo,
        });
      }
      const newsInfo = getNewsCacheInfo();
      return NextResponse.json({
        news: newsInfo,
      });
    }

    // 個別県のニュース取得（Perplexity API呼び出し）
    const fetchNews = searchParams.get("fetchNews");
    if (fetchNews) {
      try {
        const result = await getElectionNews(fetchNews, true); // forceRefresh=true
        return NextResponse.json({
          success: true,
          prefecture: fetchNews,
          cachedAt: result.cachedAt || new Date().toISOString(),
        });
      } catch (error) {
        console.error(`Failed to fetch news for ${fetchNews}:`, error);
        return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
      }
    }

    // キャッシュ済みニュースの内容を取得（読み取りのみ、API呼び出しなし）
    const getNews = searchParams.get("getNews");
    if (getNews) {
      const cachedNews = getCachedNewsForPrefecture(getNews);
      if (cachedNews) {
        return NextResponse.json({
          success: true,
          prefecture: getNews,
          content: cachedNews.content,
          sources: cachedNews.sources,
          cachedAt: cachedNews.cachedAt,
        });
      }
      return NextResponse.json({
        success: false,
        prefecture: getNews,
        message: "ニュースキャッシュがありません",
      });
    }

    // ニュースキャッシュクリア
    if (clearNews) {
      clearNewsCache();
      return NextResponse.json({ success: true, message: "News cache cleared" });
    }

    // 予測キャッシュクリアモード: 全県更新開始時に使用
    if (clearCache) {
      clearPrefectureCache();
      return NextResponse.json({ success: true, message: "Prefecture cache cleared" });
    }

    // 集計モード: 各県のキャッシュから全国予測を再生成
    if (aggregateMode) {
      const aggregated = aggregateNationalPrediction();
      if (aggregated) {
        saveNationalPrediction(aggregated);
        return NextResponse.json(aggregated);
      }
      return NextResponse.json({ error: "Not enough prefecture data" }, { status: 400 });
    }

    const prediction = await getElectionPrediction({
      prefectureId: prefectureId ? parseInt(prefectureId) : undefined,
      forceRefresh,
      fastMode,
    });

    return NextResponse.json(prediction);
  } catch (error) {
    console.error("Prediction API error:", error);
    return NextResponse.json(
      { error: "Failed to get prediction" },
      { status: 500 }
    );
  }
}
