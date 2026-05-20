import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { google } from "googleapis";
import connectDB from "@/lib/db";
import { User } from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      return NextResponse.redirect(
        new URL(`/settings?google=error&msg=${encodeURIComponent(errorParam)}`, req.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/settings?google=error&msg=No+authorization+code+received", req.url)
      );
    }

    // Verify state parameter matches the user's ID
    if (state !== session.user.id) {
      return NextResponse.redirect(
        new URL("/settings?google=error&msg=State+verification+failed", req.url)
      );
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    const { tokens } = await oauth2Client.getToken(code);

    // Save tokens in database
    await connectDB();
    const updateData: any = {
      googleAccessToken: tokens.access_token,
      googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3500 * 1000),
    };

    // Google only sends the refresh token on the first connection or when prompt=consent is used
    if (tokens.refresh_token) {
      updateData.googleRefreshToken = tokens.refresh_token;
    }

    await User.findByIdAndUpdate(session.user.id, updateData);

    return NextResponse.redirect(new URL("/settings?google=success", req.url));
  } catch (error: any) {
    console.error("Google OAuth callback error:", error);
    const errorMsg = encodeURIComponent(error.message || "Callback failed");
    return NextResponse.redirect(new URL(`/settings?google=error&msg=${errorMsg}`, req.url));
  }
}
