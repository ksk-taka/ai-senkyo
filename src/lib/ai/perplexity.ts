import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface PerplexityResponse {
  content: string;
  sources: string[];
  cachedAt?: string; // キャッシュのタイムスタンプ（新規取得時は現在時刻）
}

interface CachedNews {
  timestamp: string;
  data: PerplexityResponse;
}

// キャッシュ設定
const CACHE_DIR = path.join(process.cwd(), ".cache", "news");

// キャッシュディレクトリを作成
function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

// クエリからキャッシュファイル名を生成
function getCacheFileName(query: string): string {
  const hash = crypto.createHash("md5").update(query).digest("hex").substring(0, 12);
  // クエリの一部をファイル名に含める（可読性のため）
  const safeName = query.replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, "_").substring(0, 30);
  return `news-${safeName}-${hash}.json`;
}

// キャッシュを読み込み（時間制限なし、手動クリアまで有効）
function loadCache(query: string): { data: PerplexityResponse; timestamp: string } | null {
  try {
    const filePath = path.join(CACHE_DIR, getCacheFileName(query));
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, "utf-8");
      const cached: CachedNews = JSON.parse(fileData);
      console.log(`[Perplexity] キャッシュヒット: ${query.substring(0, 40)}... (${cached.timestamp})`);
      return { data: cached.data, timestamp: cached.timestamp };
    }
  } catch (error) {
    console.error("Failed to load news cache:", error);
  }
  return null;
}

// キャッシュを保存
function saveCache(query: string, data: PerplexityResponse): void {
  try {
    ensureCacheDir();
    const filePath = path.join(CACHE_DIR, getCacheFileName(query));
    const cached: CachedNews = {
      timestamp: data.cachedAt || new Date().toISOString(),
      data: {
        content: data.content,
        sources: data.sources,
      },
    };
    fs.writeFileSync(filePath, JSON.stringify(cached, null, 2));
    console.log(`[Perplexity] キャッシュ保存: ${query.substring(0, 40)}...`);
  } catch (error) {
    console.error("Failed to save news cache:", error);
  }
}

// Perplexity用のシステムプロンプト（都道府県別分析用）
const PERPLEXITY_SYSTEM_PROMPT = `あなたは日本の選挙情報を専門的に分析するリサーチャーです。

## タスク
指定された都道府県・選挙区の選挙情勢について、**報道機関の情勢調査・分析記事を中心に**調査してください。

## 重要：参照すべき情報源
以下の報道機関の選挙報道・情勢調査を優先的に参照してください：
- 朝日新聞（https://www.asahi.com/senkyo/）
- 読売新聞（https://www.yomiuri.co.jp/election/）
- 毎日新聞（https://mainichi.jp/senkyo/）
- 日本経済新聞（https://www.nikkei.com/politics/）
- NHK選挙WEB（https://www.nhk.or.jp/senkyo/）
- 共同通信
- 時事通信
- 産経新聞
- 地方紙（各都道府県の地元新聞）

## 調査項目
1. **メディアの情勢調査**: 各報道機関が実施した選挙区別の情勢調査結果（「優勢」「接戦」「劣勢」「横一線」等の評価）
2. **世論調査**: 政党支持率、内閣支持率の推移（具体的な数字と調査機関名）
3. **選挙区別の詳細分析**: 各候補者の強み・弱み、支持基盤、選挙戦略に関する報道
4. **過去の選挙結果**: 前回・前々回の衆院選での各候補者の得票数・得票率
5. **地域特性**: その地域の政治的傾向、主要産業、有権者の関心事項

## 出力形式
- 情報源（どの新聞社・報道機関の報道か）を必ず明記
- 具体的な数字（得票率、支持率など）を可能な限り含める
- 候補者名は正確にフルネームで記載
- 不確実な情報には「～と見られる」「～の可能性」と注記`;

export async function searchNews(query: string, forceRefresh: boolean = false): Promise<PerplexityResponse> {
  // キャッシュをチェック（強制更新でない場合）
  if (!forceRefresh) {
    const cached = loadCache(query);
    if (cached) {
      return {
        ...cached.data,
        cachedAt: cached.timestamp,
      };
    }
  }

  const apiKey = process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    throw new Error("PERPLEXITY_API_KEY is not set");
  }

  console.log(`[Perplexity] API呼び出し: ${query.substring(0, 40)}...`);

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar",
      messages: [
        {
          role: "system",
          content: PERPLEXITY_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: query,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Perplexity API error details:", errorText);
    throw new Error(`Perplexity API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();

  const now = new Date().toISOString();
  const result: PerplexityResponse = {
    content: data.choices[0]?.message?.content || "",
    sources: data.citations || [],
    cachedAt: now,
  };

  // キャッシュに保存
  saveCache(query, result);

  return result;
}

export async function getElectionNews(prefecture?: string, forceRefresh: boolean = false): Promise<PerplexityResponse> {
  // 都道府県別の詳細なプロンプト
  const query = prefecture
    ? `2026年2月8日投開票 第51回衆議院選挙 ${prefecture}の選挙情勢について、**新聞社・報道機関の情勢調査や分析記事**を中心に調べてください。

【重要】朝日新聞、読売新聞、毎日新聞、NHK、共同通信などの報道機関が発表している情勢調査・予測記事を優先的に参照してください。

調査してほしい内容:
1. **報道機関の情勢調査**: ${prefecture}内の各小選挙区について、新聞社やテレビ局が報じている情勢（「優勢」「接戦」「リード」「横一線」等）
2. **世論調査の数字**: 政党支持率、候補者別の支持率（調査機関名と具体的数字）
3. 前回2024年衆院選での${prefecture}の結果（各選挙区の当選者と得票率）
4. ${prefecture}特有の争点や地域事情（産業、人口動態、政治的傾向）
5. 注目の接戦区があれば、各メディアの分析を詳細に

※どの報道機関の情報かを必ず明記してください。
※各選挙区ごとに、候補者名・所属政党・現職/新人の区別を明記してください。`
    : `2026年2月8日投開票 第51回衆議院選挙の全国情勢について、**新聞社・報道機関の情勢調査や分析記事**を中心に調べてください。

【重要】朝日新聞、読売新聞、毎日新聞、NHK、共同通信などの報道機関が発表している情勢調査・予測記事を優先的に参照してください。

調査してほしい内容:
1. 各政党の最新支持率と推移（調査機関名と具体的数字）
2. 全国での議席予測（各メディアの予測を比較）
3. 与野党の勝敗を左右する注目選挙区（各メディアの分析）
4. 選挙の主要争点と有権者の関心事項
5. 投票率の予測と期日前投票の状況

※どの報道機関の情報かを必ず明記してください。`;

  return searchNews(query, forceRefresh);
}

// ニュースキャッシュのメタ情報を取得
export function getNewsCacheInfo(): { count: number; files: string[] } {
  try {
    if (fs.existsSync(CACHE_DIR)) {
      const files = fs.readdirSync(CACHE_DIR).filter(f => f.endsWith(".json"));
      return { count: files.length, files };
    }
  } catch (error) {
    console.error("Failed to get news cache info:", error);
  }
  return { count: 0, files: [] };
}

// 47都道府県リスト
const ALL_PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
];

export interface PrefectureNewsCacheStatus {
  prefectureId: number;
  prefectureName: string;
  hasCached: boolean;
  cachedAt: string | null;
}

// 詳細なキャッシュ状況を取得（全47都道府県）
export function getDetailedNewsCacheInfo(): {
  count: number;
  prefectures: PrefectureNewsCacheStatus[];
} {
  const prefectureStatuses: PrefectureNewsCacheStatus[] = [];
  const cachedPrefectures = new Map<string, string>(); // prefecture -> timestamp

  try {
    if (fs.existsSync(CACHE_DIR)) {
      const files = fs.readdirSync(CACHE_DIR).filter(f => f.endsWith(".json"));

      for (const file of files) {
        try {
          const filePath = path.join(CACHE_DIR, file);
          const fileData = fs.readFileSync(filePath, "utf-8");
          const cached: CachedNews = JSON.parse(fileData);

          // 県名を抽出
          const prefMatch = file.match(/news-.*?(北海道|青森県|岩手県|宮城県|秋田県|山形県|福島県|茨城県|栃木県|群馬県|埼玉県|千葉県|東京都|神奈川県|新潟県|富山県|石川県|福井県|山梨県|長野県|岐阜県|静岡県|愛知県|三重県|滋賀県|京都府|大阪府|兵庫県|奈良県|和歌山県|鳥取県|島根県|岡山県|広島県|山口県|徳島県|香川県|愛媛県|高知県|福岡県|佐賀県|長崎県|熊本県|大分県|宮崎県|鹿児島県|沖縄県)/);

          if (prefMatch) {
            cachedPrefectures.set(prefMatch[1], cached.timestamp);
          }
        } catch {
          // 個別ファイルの読み込み失敗は無視
        }
      }
    }
  } catch (error) {
    console.error("Failed to get detailed news cache info:", error);
  }

  // 全47都道府県のステータスを生成
  for (let i = 0; i < ALL_PREFECTURES.length; i++) {
    const prefName = ALL_PREFECTURES[i];
    const cachedAt = cachedPrefectures.get(prefName) || null;
    prefectureStatuses.push({
      prefectureId: i + 1,
      prefectureName: prefName,
      hasCached: !!cachedAt,
      cachedAt,
    });
  }

  return {
    count: cachedPrefectures.size,
    prefectures: prefectureStatuses,
  };
}

// 全ての県別ニュースキャッシュを読み込む（全国予測用）
export function loadAllPrefectureNewsCache(): { prefecture: string; content: string; timestamp: string }[] {
  const results: { prefecture: string; content: string; timestamp: string }[] = [];

  try {
    if (!fs.existsSync(CACHE_DIR)) {
      return results;
    }

    const files = fs.readdirSync(CACHE_DIR).filter(f => f.endsWith(".json"));

    for (const file of files) {
      try {
        const filePath = path.join(CACHE_DIR, file);
        const fileData = fs.readFileSync(filePath, "utf-8");
        const cached: CachedNews = JSON.parse(fileData);

        // 県名を抽出（ファイル名から）
        // ファイル名形式: news-{safeName}-{hash}.json
        // safeName には都道府県名が含まれている
        const prefectureMatch = file.match(/news-.*?(北海道|青森県|岩手県|宮城県|秋田県|山形県|福島県|茨城県|栃木県|群馬県|埼玉県|千葉県|東京都|神奈川県|新潟県|富山県|石川県|福井県|山梨県|長野県|岐阜県|静岡県|愛知県|三重県|滋賀県|京都府|大阪府|兵庫県|奈良県|和歌山県|鳥取県|島根県|岡山県|広島県|山口県|徳島県|香川県|愛媛県|高知県|福岡県|佐賀県|長崎県|熊本県|大分県|宮崎県|鹿児島県|沖縄県)/);

        if (prefectureMatch) {
          results.push({
            prefecture: prefectureMatch[1],
            content: cached.data.content,
            timestamp: cached.timestamp,
          });
        }
      } catch (e) {
        // 個別ファイルの読み込み失敗は無視
      }
    }

    console.log(`[Perplexity] ${results.length}件の県別ニュースキャッシュを読み込み`);
  } catch (error) {
    console.error("Failed to load prefecture news caches:", error);
  }

  return results;
}

// 特定の県のキャッシュ済みニュースを取得（APIコールなし、読み取りのみ）
export function getCachedNewsForPrefecture(prefectureName: string): {
  content: string;
  sources: string[];
  cachedAt: string;
} | null {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      return null;
    }

    const files = fs.readdirSync(CACHE_DIR).filter(f => f.endsWith(".json"));

    for (const file of files) {
      // ファイル名に県名が含まれているかチェック
      if (file.includes(prefectureName.replace(/[都道府県]$/, ""))) {
        try {
          const filePath = path.join(CACHE_DIR, file);
          const fileData = fs.readFileSync(filePath, "utf-8");
          const cached: CachedNews = JSON.parse(fileData);

          // 県名が一致するか確認
          const prefMatch = file.match(/news-.*?(北海道|青森県|岩手県|宮城県|秋田県|山形県|福島県|茨城県|栃木県|群馬県|埼玉県|千葉県|東京都|神奈川県|新潟県|富山県|石川県|福井県|山梨県|長野県|岐阜県|静岡県|愛知県|三重県|滋賀県|京都府|大阪府|兵庫県|奈良県|和歌山県|鳥取県|島根県|岡山県|広島県|山口県|徳島県|香川県|愛媛県|高知県|福岡県|佐賀県|長崎県|熊本県|大分県|宮崎県|鹿児島県|沖縄県)/);

          if (prefMatch && prefMatch[1] === prefectureName) {
            return {
              content: cached.data.content,
              sources: cached.data.sources || [],
              cachedAt: cached.timestamp,
            };
          }
        } catch {
          // 個別ファイルの読み込み失敗は無視
        }
      }
    }
  } catch (error) {
    console.error(`Failed to get cached news for ${prefectureName}:`, error);
  }

  return null;
}

// ニュースキャッシュをクリア（手動用、全県更新では呼ばない）
export function clearNewsCache(): void {
  try {
    if (fs.existsSync(CACHE_DIR)) {
      const files = fs.readdirSync(CACHE_DIR);
      for (const file of files) {
        if (file.endsWith(".json")) {
          fs.unlinkSync(path.join(CACHE_DIR, file));
        }
      }
      console.log(`Cleared ${files.length} news cache files`);
    }
  } catch (error) {
    console.error("Failed to clear news cache:", error);
  }
}
