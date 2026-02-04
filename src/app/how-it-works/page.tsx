"use client";

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: "データ収集",
      description: "Perplexity AIが最新のニュースや世論調査を検索・収集",
      icon: "🔍",
      details: [
        "全国紙・地方紙のニュース記事",
        "各種世論調査の結果",
        "政党・候補者の発言や動向",
        "有権者の反応・SNS上の議論",
      ],
    },
    {
      number: 2,
      title: "分析・予測",
      description: "Gemini AIが収集データを分析し、選挙予測を生成",
      icon: "🧠",
      details: [
        "選挙区ごとの情勢を評価",
        "各政党の支持率トレンドを分析",
        "候補者の知名度・実績を考慮",
        "地域特性と過去の投票傾向を加味",
        "確信度を計算（高・中・低）",
        "最終的な議席予測を構築",
      ],
    },
  ];

  const dataTypes = [
    {
      title: "全国規模分析",
      items: ["内閣支持率", "政党支持率", "主要争点"],
    },
    {
      title: "地域別分析",
      items: ["47都道府県を分析", "289選挙区すべてをカバー"],
    },
    {
      title: "比例ブロック分析",
      items: ["11ブロック", "176議席の予測"],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          AI予測の仕組み
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          2つのAIが連携して、最新の選挙情勢を分析・予測します
        </p>
      </div>

      {/* Process Steps */}
      <div className="space-y-8">
        {steps.map((step, index) => (
          <div
            key={step.number}
            className="bg-white rounded-lg shadow-sm border p-6"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                  {step.icon}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-blue-600">
                    STEP {step.number}
                  </span>
                </div>
                <h2 className="mt-1 text-xl font-semibold text-gray-900">
                  {step.title}
                </h2>
                <p className="mt-2 text-gray-600">{step.description}</p>
                <ul className="mt-4 space-y-2">
                  {step.details.map((detail, detailIndex) => (
                    <li
                      key={detailIndex}
                      className="flex items-center text-sm text-gray-700"
                    >
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="flex justify-center mt-6">
                <svg
                  className="w-6 h-6 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Flow Diagram */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8">
        <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">
          予測フロー
        </h2>
        <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
          <div className="bg-white rounded-lg p-4 shadow-sm text-center min-w-[140px]">
            <p className="text-sm font-medium text-gray-500">Perplexity</p>
            <p className="text-lg font-semibold">ニュース収集</p>
          </div>
          <svg
            className="w-8 h-8 text-gray-400 rotate-90 md:rotate-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
          <div className="bg-white rounded-lg p-4 shadow-sm text-center min-w-[140px]">
            <p className="text-sm font-medium text-gray-500">Gemini</p>
            <p className="text-lg font-semibold">分析・予測</p>
          </div>
        </div>
      </div>

      {/* Data Types */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          分析対象データ
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dataTypes.map((type) => (
            <div
              key={type.title}
              className="bg-white rounded-lg shadow-sm border p-5"
            >
              <h3 className="font-semibold text-gray-900 mb-3">{type.title}</h3>
              <ul className="space-y-2">
                {type.items.map((item, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Confidence Explanation */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          確信度について
        </h2>
        <p className="text-gray-600 mb-4">
          予測の確信度は、データの質と量に基づいて算出されます。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2 mb-2">
              <span className="w-4 h-4 bg-green-500 rounded-full" />
              <span className="font-medium text-green-800">高確信度</span>
            </div>
            <p className="text-sm text-green-700">
              データが豊富で傾向が明確な場合
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center space-x-2 mb-2">
              <span className="w-4 h-4 bg-yellow-500 rounded-full" />
              <span className="font-medium text-yellow-800">中確信度</span>
            </div>
            <p className="text-sm text-yellow-700">
              データに一部矛盾があるか、接戦の場合
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center space-x-2 mb-2">
              <span className="w-4 h-4 bg-red-400 rounded-full" />
              <span className="font-medium text-red-800">低確信度</span>
            </div>
            <p className="text-sm text-red-700">
              データ不足、または予測が困難な場合
            </p>
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          使用技術
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { name: "Perplexity API", desc: "Web検索・情報収集" },
            { name: "Gemini API", desc: "分析・予測生成" },
            { name: "D3.js", desc: "地図可視化" },
          ].map((tech) => (
            <div key={tech.name} className="text-center">
              <p className="font-medium text-gray-900">{tech.name}</p>
              <p className="text-xs text-gray-500">{tech.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-medium text-yellow-800 mb-2">免責事項</h3>
        <p className="text-sm text-yellow-700">
          本システムによる予測は、公開情報に基づくAIによる分析結果であり、
          実際の選挙結果を保証するものではありません。予測は参考情報としてご利用ください。
          また、AIによる分析には限界があり、予期せぬ事象や世論の急変動を
          完全に予測することはできません。
        </p>
      </div>
    </div>
  );
}
