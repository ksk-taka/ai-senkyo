# AI選挙予測システム

2026年衆議院選挙の予測をAI（Google Gemini）を使って生成・可視化するWebアプリケーション。

## 機能

- 日本地図上に都道府県別の優勢政党を色分け表示
- 各都道府県の選挙区別予測（候補者・得票率予測）
- 政党別予測獲得議席数のグラフ表示
- AIによるリアルタイム予測更新（Gemini API + Perplexity API）
- キーボードナビゲーション（← → キーで都道府県移動）

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **UI**: React 18 + Tailwind CSS
- **地図**: D3.js + TopoJSON
- **グラフ**: Recharts
- **AI**: Google Gemini API, Perplexity API

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成し、APIキーを設定:

```bash
cp .env.local.example .env.local
```

```env
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
PERPLEXITY_API_KEY=your_perplexity_api_key_here
```

#### APIキーの取得

- **Google AI (Gemini)**: https://aistudio.google.com/apikey
- **Perplexity**: https://www.perplexity.ai/settings/api

### 3. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアクセス可能。

## 使い方

### 予測の更新

- **高速更新**: ニュース検索をスキップし、候補者データのみで予測（低コスト）
- **詳細更新**: Perplexity APIで最新ニュースを取得し、より詳細な予測を生成

### 全予測の一括更新

```bash
npm run update-predictions
```

全国 + 47都道府県の予測を順次更新します（レート制限対策で2秒間隔）。

### キーボードショートカット

都道府県ページで使用可能:

| キー | 動作 |
|-----|------|
| ← | 前の都道府県へ |
| → | 次の都道府県へ |
| Esc | 全国マップへ戻る |

## プロジェクト構成

```
ai-senkyo/
├── src/
│   ├── app/
│   │   ├── page.tsx              # トップページ（全国マップ）
│   │   ├── prefecture/[id]/      # 都道府県別ページ
│   │   └── api/predict/          # 予測API
│   ├── components/
│   │   ├── JapanMap.tsx          # 日本地図
│   │   ├── PartyChart.tsx        # 政党別グラフ
│   │   └── ...
│   └── lib/
│       ├── ai/
│       │   ├── gemini.ts         # Gemini API
│       │   ├── perplexity.ts     # Perplexity API
│       │   └── integrator.ts     # AI統合ロジック
│       ├── cache/                # ファイルキャッシュ
│       └── data/                 # 選挙区・政党データ
├── scripts/
│   └── update-all-predictions.mjs  # 一括更新スクリプト
└── public/
    └── japan.topojson            # 日本地図データ
```

## 注意事項

- この予測はAIによる分析結果であり、実際の選挙結果を保証するものではありません
- 予測は公開情報（ニュース、世論調査など）に基づいています
- API利用料金が発生します（Gemini: ~$0.10-0.20/全予測更新）

## ライセンス

MIT License
