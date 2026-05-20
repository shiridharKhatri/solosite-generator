import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { User } from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isConnected = !!user.googleRefreshToken;

    return NextResponse.json({
      connected: isConnected,
      autoBackup: user.autoBackupGoogleDrive ?? false,
    });
  } catch (error: any) {
    console.error("Error fetching Google status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { autoBackup } = await req.json();

    await connectDB();
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { autoBackupGoogleDrive: !!autoBackup },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      autoBackup: user.autoBackupGoogleDrive,
    });
  } catch (error: any) {
    console.error("Error updating Google backup settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findByIdAndUpdate(
      session.user.id,
      {
        $unset: {
          googleAccessToken: "",
          googleRefreshToken: "",
          googleTokenExpiry: "",
          googleDriveFolderId: "",
        },
        $set: {
          autoBackupGoogleDrive: false,
        },
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      connected: false,
    });
  } catch (error: any) {
    console.error("Error disconnecting Google Drive:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
