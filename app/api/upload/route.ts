import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${uuidv4()}-${file.name.replace(/\s+/g, "-")}`;
    const publicDir = path.join(process.cwd(), "public");
    const uploadDir = path.join(publicDir, "uploads");

    // Ensure uploads directory exists
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      // Ignore if directory already exists
    }

    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const relativeUrl = `/uploads/${fileName}`;

    return NextResponse.json({ url: relativeUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
