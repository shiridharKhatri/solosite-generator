import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { google } from "googleapis";
import { Readable } from "stream";
import connectDB from "@/lib/db";
import { User } from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.user.id);
    if (!user || !user.googleRefreshToken) {
      return NextResponse.json({ error: "Google Drive is not connected. Connect in Settings." }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken,
      expiry_date: user.googleTokenExpiry ? new Date(user.googleTokenExpiry).getTime() : undefined,
    });

    // Handle token refresh automatically
    oauth2Client.on("tokens", async (tokens) => {
      const updateData: any = {};
      if (tokens.access_token) {
        updateData.googleAccessToken = tokens.access_token;
      }
      if (tokens.expiry_date) {
        updateData.googleTokenExpiry = new Date(tokens.expiry_date);
      }
      await User.findByIdAndUpdate(session.user.id, updateData);
    });

    const drive = google.drive({ version: "v3", auth: oauth2Client });

    // Step 1: Find or create the "SoloSite Backups" folder
    let folderId = user.googleDriveFolderId;

    if (folderId) {
      // Verify the folder still exists and is not trashed
      try {
        const check = await drive.files.get({
          fileId: folderId,
          fields: "id, trashed",
        });
        if (check.data.trashed) {
          folderId = null; // Re-create if trashed
        }
      } catch (err) {
        folderId = null; // Re-create if deleted/not found
      }
    }

    if (!folderId) {
      // Search for the folder by name
      const searchRes = await drive.files.list({
        q: "name = 'SoloSite Backups' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
        fields: "files(id)",
        spaces: "drive",
      });

      const existingFolder = searchRes.data.files?.[0];

      if (existingFolder && existingFolder.id) {
        folderId = existingFolder.id;
      } else {
        // Create new folder
        const folderMetadata = {
          name: "SoloSite Backups",
          mimeType: "application/vnd.google-apps.folder",
        };
        const folder = await drive.files.create({
          requestBody: folderMetadata,
          fields: "id",
        });
        folderId = folder.data.id;
      }

      // Cache folder ID in user record
      await User.findByIdAndUpdate(session.user.id, { googleDriveFolderId: folderId });
    }

    // Step 2: Upload the zip file into the folder
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileMetadata = {
      name: file.name,
      parents: [folderId!],
    };
    const media = {
      mimeType: file.type || "application/zip",
      body: Readable.from(buffer),
    };

    const uploadRes = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, name, webViewLink",
    });

    return NextResponse.json({
      success: true,
      fileId: uploadRes.data.id,
      fileName: uploadRes.data.name,
      link: uploadRes.data.webViewLink,
    });
  } catch (error: any) {
    console.error("Google Drive upload error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload backup to Google Drive" }, { status: 500 });
  }
}
