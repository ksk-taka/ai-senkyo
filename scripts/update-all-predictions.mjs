/**
 * 全国 + 47都道府県の予測を一括更新するスクリプト
 *
 * 使い方:
 *   node scripts/update-all-predictions.mjs              # バッチ並列更新（3県×16回）
 *   node scripts/update-all-predictions.mjs --serial     # 直列更新（1県ずつ）
 *   node scripts/update-all-predictions.mjs 36           # 36番から順次更新
 *   node scripts/update-all-predictions.mjs 20 23 29 33  # 指定IDのみ並列更新
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const DELAY_MS = 1000; // バッチ間の待機時間
const BATCH_SIZE = 3;  // 並列実行する県数

// 引数を解析
const rawArgs = process.argv.slice(2);
const isSerialMode = rawArgs.includes("--serial");
const args = rawArgs.filter(a => a !== "--serial").map(Number).filter(n => !isNaN(n));
const isParallelMode = args.length > 1; // 複数指定なら並列モード
const START_FROM = args.length === 1 ? args[0] : 0;

const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function updatePrediction(prefectureId) {
  const params = new URLSearchParams({ refresh: "true", fast: "true" });
  if (prefectureId) {
    params.append("prefectureId", String(prefectureId));
  }

  const url = `${BASE_URL}/api/predict?${params}`;
  const label = prefectureId ? `${PREFECTURES[prefectureId - 1]} (ID:${prefectureId})` : "全国";

  try {
    process.stdout.write(`[更新中] ${label}...`);
    const response = await fetch(url);

    if (!response.ok) {
      console.log(` [エラー] HTTP ${response.status}`);
      return false;
    }

    const data = await response.json();

    if (data.timestamp && data.timestamp !== "") {
      console.log(` [成功] ${new Date(data.timestamp).toLocaleString("ja-JP")}`);
      return true;
    } else {
      console.log(` [失敗] API失敗`);
      return false;
    }
  } catch (error) {
    console.log(` [エラー] ${error.message}`);
    return false;
  }
}

// 配列をバッチに分割
function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

async function main() {
  const startTime = Date.now();

  // 指定IDの並列モード: 複数IDを同時に更新
  if (isParallelMode) {
    console.log("=".repeat(60));
    console.log("AI選挙予測 並列更新モード");
    console.log("=".repeat(60));
    console.log(`対象: ${args.map(id => `${PREFECTURES[id - 1]}(${id})`).join(", ")}`);
    console.log(`サーバー: ${BASE_URL}`);
    console.log("=".repeat(60));
    console.log("");

    const results = await Promise.all(
      args.map(async (prefId) => {
        console.log(`[並列開始] ${PREFECTURES[prefId - 1]} (ID:${prefId})`);
        const success = await updatePrediction(prefId);
        return { prefId, success };
      })
    );

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    const elapsed = Math.round((Date.now() - startTime) / 1000);

    console.log("");
    console.log("=".repeat(60));
    console.log("完了!");
    console.log(`成功: ${successCount} / ${args.length}`);
    console.log(`失敗: ${failCount} / ${args.length}`);
    console.log(`所要時間: ${Math.floor(elapsed / 60)}分${elapsed % 60}秒`);
    console.log("=".repeat(60));

    process.exit(failCount > 0 ? 1 : 0);
    return;
  }

  // バッチ並列モード: 3県ずつ16回（デフォルト）
  if (!isSerialMode && args.length === 0) {
    console.log("=".repeat(60));
    console.log("AI選挙予測 バッチ並列更新モード");
    console.log("=".repeat(60));
    console.log(`対象: 全47都道府県`);
    console.log(`バッチサイズ: ${BATCH_SIZE}県ずつ並列実行`);
    console.log(`サーバー: ${BASE_URL}`);
    console.log("=".repeat(60));
    console.log("");

    const allPrefIds = Array.from({ length: 47 }, (_, i) => i + 1);
    const batches = chunkArray(allPrefIds, BATCH_SIZE);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const batchLabel = batch.map(id => PREFECTURES[id - 1]).join(", ");
      console.log(`\n[バッチ ${i + 1}/${batches.length}] ${batchLabel}`);

      const results = await Promise.all(
        batch.map(async (prefId) => {
          const success = await updatePrediction(prefId);
          return { prefId, success };
        })
      );

      successCount += results.filter(r => r.success).length;
      failCount += results.filter(r => !r.success).length;

      // 最後のバッチ以外は待機
      if (i < batches.length - 1) {
        await sleep(DELAY_MS);
      }
    }

    // 全県完了後、全国予測を集計して更新
    console.log("\n[集計] 全国予測を更新中...");
    try {
      const aggregateUrl = `${BASE_URL}/api/predict?refresh=true&aggregate=true`;
      const response = await fetch(aggregateUrl);
      if (response.ok) {
        console.log("[集計] 全国予測を更新完了");
      }
    } catch (e) {
      console.log("[集計] 全国予測の更新に失敗（個別県データは保存済み）");
    }

    const elapsed = Math.round((Date.now() - startTime) / 1000);

    console.log("");
    console.log("=".repeat(60));
    console.log("完了!");
    console.log(`成功: ${successCount} / 47`);
    console.log(`失敗: ${failCount} / 47`);
    console.log(`所要時間: ${Math.floor(elapsed / 60)}分${elapsed % 60}秒`);
    console.log("=".repeat(60));

    process.exit(failCount > 0 ? 1 : 0);
    return;
  }

  // 順次モード (--serial): START_FROMから最後まで
  const totalCount = 48 - START_FROM;
  const startLabel = START_FROM === 0 ? "全国から" : `${PREFECTURES[START_FROM - 1]}（ID:${START_FROM}）から`;

  console.log("=".repeat(60));
  console.log("AI選挙予測 一括更新スクリプト");
  console.log("=".repeat(60));
  console.log(`対象: ${startLabel} (${totalCount}件)`);
  console.log(`API間隔: ${DELAY_MS}ms`);
  console.log(`サーバー: ${BASE_URL}`);
  console.log("=".repeat(60));
  console.log("");

  let successCount = 0;
  let failCount = 0;
  let current = 1;

  // 1. 全国予測を更新（START_FROMが0の場合のみ）
  if (START_FROM === 0) {
    console.log(`[${current}/${totalCount}]`);
    if (await updatePrediction(null)) {
      successCount++;
    } else {
      failCount++;
    }
    await sleep(DELAY_MS);
    current++;
  }

  // 2. 都道府県を更新
  const startPrefId = START_FROM > 0 ? START_FROM : 1;
  for (let prefId = startPrefId; prefId <= 47; prefId++) {
    console.log(`[${current}/${totalCount}]`);
    if (await updatePrediction(prefId)) {
      successCount++;
    } else {
      failCount++;
    }

    // 最後以外は待機
    if (prefId < 47) {
      await sleep(DELAY_MS);
    }
    current++;
  }

  const elapsed = Math.round((Date.now() - startTime) / 1000);

  console.log("");
  console.log("=".repeat(60));
  console.log("完了!");
  console.log(`成功: ${successCount} / ${totalCount}`);
  console.log(`失敗: ${failCount} / ${totalCount}`);
  console.log(`所要時間: ${Math.floor(elapsed / 60)}分${elapsed % 60}秒`);
  console.log("=".repeat(60));

  process.exit(failCount > 0 ? 1 : 0);
}

main();
