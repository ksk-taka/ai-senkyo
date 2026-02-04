export interface PerplexityResponse {
  content: string;
  sources: string[];
}

export async function searchNews(query: string): Promise<PerplexityResponse> {
  const apiKey = process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    throw new Error("PERPLEXITY_API_KEY is not set");
  }

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
          content: "あなたは日本の選挙情報を分析するアシスタントです。最新のニュースや世論調査の情報を検索し、選挙の情勢を分析してください。候補者名、政党、選挙区の情報を可能な限り詳しく報告してください。",
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

  return {
    content: data.choices[0]?.message?.content || "",
    sources: data.citations || [],
  };
}

export async function getElectionNews(prefecture?: string): Promise<PerplexityResponse> {
  const query = prefecture
    ? `2026年2月 第51回衆議院選挙 ${prefecture} 候補者一覧 情勢 世論調査`
    : "2026年2月8日 第51回衆議院選挙 全国情勢 各党支持率 主要候補者 最新世論調査";

  return searchNews(query);
}
