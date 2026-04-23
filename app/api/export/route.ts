import { NextRequest, NextResponse } from "next/server";
import { generateProjectZip } from "@/lib/exporter";

export async function POST(req: NextRequest) {
  try {
    const { data } = await req.json();
    const zipBlob = await generateProjectZip(data);
    
    return new NextResponse(zipBlob, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="project.zip"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Failed to export" }, { status: 500 });
  }
}
