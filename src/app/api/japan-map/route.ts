import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "src/data/japan.topojson");
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const jsonData = JSON.parse(fileContent);

    return NextResponse.json(jsonData);
  } catch (error) {
    console.error("Error reading Japan map data:", error);
    return NextResponse.json(
      { error: "Failed to load map data" },
      { status: 500 }
    );
  }
}
