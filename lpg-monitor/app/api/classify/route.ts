import { NextRequest, NextResponse } from "next/server";
import { runLpgClassify } from "@/lib/classifyLpgText";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { text?: string };
    const text = typeof body.text === "string" ? body.text : "";

    const result = await runLpgClassify(text);

    if (result.classifyError) {
      const status =
        result.classifyError === "Missing text" ? 400 : 500;
      return NextResponse.json({ error: result.classifyError }, { status });
    }

    return NextResponse.json({
      status: result.status,
      summary: result.summary,
      hindiSummary: result.hindiSummary,
      area: result.area,
      plainLanguageLabel: result.plainLanguageLabel,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
