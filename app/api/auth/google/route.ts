import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { google } from "googleapis";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      return NextResponse.json(
        { error: "Google OAuth credentials are not configured on the server. Please check environment variables." },
        { status: 500 }
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    // Drive.file scope gives permissions to create and manage files created by this app
    const scopes = [
      "https://www.googleapis.com/auth/drive.file"
    ];

    const authorizationUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      prompt: "consent", // Force Google to provide a refresh token
      state: session.user.id, // Pass user ID as state to verify during callback
    });

    return NextResponse.redirect(authorizationUrl);
  } catch (error: any) {
    console.error("Google OAuth initiation error:", error);
    return NextResponse.json({ error: error.message || "Failed to start Google OAuth" }, { status: 500 });
  }
}
