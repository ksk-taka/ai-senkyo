import { NextRequest, NextResponse } from "next/server";
import { getElectionPrediction } from "@/lib/ai/integrator";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const prefectureId = searchParams.get("prefectureId");
  const forceRefresh = searchParams.get("refresh") === "true";
  const fastMode = searchParams.get("fast") === "true";

  try {
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
