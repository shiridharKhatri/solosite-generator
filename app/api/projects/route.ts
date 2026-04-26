import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Project } from "@/models/Project";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  console.log("API GET Session:", session);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const id = req.nextUrl.searchParams.get("id");
    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ error: "Invalid Project ID format" }, { status: 400 });
      }
      // Filter by both ID and userId to ensure ownership
      const project = await Project.findOne({ _id: id, userId: session.user.id });
      if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

      return NextResponse.json(project);
    }

    const status = req.nextUrl.searchParams.get("status");
    const query: any = { userId: session.user.id }; // Always filter by the current user
    if (status) query.status = status;

    const projects = await Project.find(query).sort({ updatedAt: -1 });
    return NextResponse.json(projects);
  } catch (err: any) {
    console.error("Error fetching projects:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { name, data, status } = await req.json();

  const project = await Project.create({
    userId: session.user.id, // Record who created it
    name,
    data,
    status: status || 'draft',
  });

  return NextResponse.json(project);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id, data, status, name } = await req.json();

  // Find project that belongs to this user
  const project = await Project.findOne({ _id: id, userId: session.user.id });
  if (!project) return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });

  if (data) project.data = data;
  if (status) project.status = status;
  if (name) project.name = name;

  await project.save();
  return NextResponse.json(project);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  // Delete only if it belongs to the current user
  const result = await Project.deleteOne({ _id: id, userId: session.user.id });

  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
