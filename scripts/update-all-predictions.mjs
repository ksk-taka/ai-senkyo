/**
 * 全国 + 47都道府県の予測を一括更新するスクリプト
 *
 * 使い方:
 *   node scripts/update-all-predictions.mjs
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const DELAY_MS = 2000; // API呼び出し間隔（レート制限対策）

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

async function main() {
  console.log("=".repeat(60));
  console.log("AI選挙予測 一括更新スクリプト");
  console.log("=".repeat(60));
  console.log(`対象: 全国 + 47都道府県 = 48件`);
  console.log(`API間隔: ${DELAY_MS}ms`);
  console.log(`サーバー: ${BASE_URL}`);
  console.log("=".repeat(60));
  console.log("");

  const startTime = Date.now();
  let successCount = 0;
  let failCount = 0;

  // 1. 全国予測を更新
  console.log("[1/48]");
  if (await updatePrediction(null)) {
    successCount++;
  } else {
    failCount++;
  }
  await sleep(DELAY_MS);

  // 2. 47都道府県を更新
  for (let prefId = 1; prefId <= 47; prefId++) {
    console.log(`[${prefId + 1}/48]`);
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
  console.log("=".repeat(60));
  console.log("完了!");
  console.log(`成功: ${successCount} / 48`);
  console.log(`失敗: ${failCount} / 48`);
  console.log(`所要時間: ${Math.floor(elapsed / 60)}分${elapsed % 60}秒`);
  console.log("=".repeat(60));

  process.exit(failCount > 0 ? 1 : 0);
}

main();
