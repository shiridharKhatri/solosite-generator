import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

/**
 * Searches the project data (serialized as JSON string) for any inline base64 images,
 * writes them to public/uploads directory, and replaces the base64 string with the local relative URL.
 */
export async function migrateBase64Images(data: any): Promise<any> {
  if (!data) return data;

  try {
    let dataStr = JSON.stringify(data);
    
    // Regular expression to identify base64 data URLs
    const base64Regex = /data:image\/([a-zA-Z0-9+.-]+);base64,([a-zA-Z0-9+/=]+)/g;
    
    const replacements: { original: string; url: string }[] = [];
    let match;

    // Collect all matches
    while ((match = base64Regex.exec(dataStr)) !== null) {
      const original = match[0];
      let ext = match[1];
      if (ext === "jpeg") ext = "jpg";
      if (ext.includes("+")) ext = ext.split("+")[0]; // e.g. svg+xml -> svg
      
      const base64Data = match[2];

      try {
        const buffer = Buffer.from(base64Data, "base64");
        const fileName = `migrated-${uuidv4()}.${ext}`;
        
        const publicDir = path.join(process.cwd(), "public");
        const uploadDir = path.join(publicDir, "uploads");

        // Ensure target upload directory exists
        try {
          await mkdir(uploadDir, { recursive: true });
        } catch (e) {
          // Ignore if folder exists
        }

        const filePath = path.join(uploadDir, fileName);
        await writeFile(filePath, buffer);

        replacements.push({
          original,
          url: `/uploads/${fileName}`
        });
      } catch (err) {
        console.error("Failed to process base64 image slice:", err);
      }
    }

    // Apply replacement paths
    for (const rep of replacements) {
      dataStr = dataStr.replaceAll(rep.original, rep.url);
    }

    return JSON.parse(dataStr);
  } catch (error) {
    console.error("Failed to run migrateBase64Images:", error);
    return data;
  }
}
