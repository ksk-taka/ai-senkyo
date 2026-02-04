/**
 * 全国 + 47都道府県の予測を一括更新するスクリプト
 *
 * 使い方:
 *   npx ts-node scripts/update-all-predictions.ts
 *
 * または package.json に追加後:
 *   npm run update-predictions
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const DELAY_MS = 2000; // API呼び出し間隔（レート制限対策）

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function updatePrediction(prefectureId?: number): Promise<boolean> {
  const params = new URLSearchParams({ refresh: "true", fast: "true" });
  if (prefectureId) {
    params.append("prefectureId", String(prefectureId));
  }

  const url = `${BASE_URL}/api/predict?${params}`;
  const label = prefectureId ? `都道府県 ${prefectureId}` : "全国";

  try {
    console.log(`[更新中] ${label}...`);
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`[エラー] ${label}: HTTP ${response.status}`);
      return false;
    }

    const data = await response.json();

    if (data.timestamp && data.timestamp !== "") {
      console.log(`[成功] ${label} - ${new Date(data.timestamp).toLocaleString("ja-JP")}`);
      return true;
    } else {
      console.error(`[失敗] ${label}: タイムスタンプなし（API失敗）`);
      return false;
    }
  } catch (error) {
    console.error(`[エラー] ${label}:`, error);
    return false;
  }
}

async function main() {
  console.log("=".repeat(50));
  console.log("AI選挙予測 一括更新スクリプト");
  console.log("=".repeat(50));
  console.log(`対象: 全国 + 47都道府県 = 48件`);
  console.log(`API間隔: ${DELAY_MS}ms`);
  console.log(`予想時間: 約 ${Math.ceil((48 * (DELAY_MS + 30000)) / 60000)} 分`);
  console.log("=".repeat(50));
  console.log("");

  const startTime = Date.now();
  let successCount = 0;
  let failCount = 0;

  // 1. 全国予測を更新
  console.log("[1/48] 全国予測");
  if (await updatePrediction()) {
    successCount++;
  } else {
    failCount++;
  }
  await sleep(DELAY_MS);

  // 2. 47都道府県を更新
  for (let prefId = 1; prefId <= 47; prefId++) {
    console.log(`[${prefId + 1}/48] 都道府県ID: ${prefId}`);
    if (await updatePrediction(prefId)) {
      successCount++;
    } else {
      failCount++;
    }

    // 最後以外は待機
    if (prefId < 47) {
      await sleep(DELAY_MS);
    }
  }

  const elapsed = Math.round((Date.now() - startTime) / 1000);

  console.log("");
  console.log("=".repeat(50));
  console.log("完了!");
  console.log(`成功: ${successCount} / 48`);
  console.log(`失敗: ${failCount} / 48`);
  console.log(`所要時間: ${Math.floor(elapsed / 60)}分${elapsed % 60}秒`);
  console.log("=".repeat(50));

  process.exit(failCount > 0 ? 1 : 0);
}

main();
