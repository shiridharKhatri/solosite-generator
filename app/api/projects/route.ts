import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Project } from "@/models/Project";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
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
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    const query: any = { userId: session.user.id }; // Always filter by the current user
    if (status) query.status = status;

    // Get total count for pagination
    const total = await Project.countDocuments(query);

    // Exclude 'data' field when listing projects for the dashboard to prevent OOM
    const projects = await Project.find(query)
      .select("-data")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      projects,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { name, data, status, theme, seoScore } = await req.json();

  const project = await Project.create({
    userId: session.user.id, // Record who created it
    name,
    data,
    status: status || 'draft',
    thumbnail: data?.hero?.image || '',
    theme: theme || data?.layoutStyle || 'default',
    seoScore: seoScore || 0,
  });

  return NextResponse.json(project);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id, data, status, name, theme, seoScore } = await req.json();

  // Find project that belongs to this user
  const project = await Project.findOne({ _id: id, userId: session.user.id });
  if (!project) return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });

  if (data) {
    project.data = data;
    project.thumbnail = data?.hero?.image || '';
  }
  if (status) project.status = status;
  if (name) project.name = name;
  if (theme) project.theme = theme;
  if (seoScore !== undefined) project.seoScore = seoScore;

  await project.save();
  return NextResponse.json(project);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const id = req.nextUrl.searchParams.get("id");
  const idsParam = req.nextUrl.searchParams.get("ids");

  if (idsParam) {
    const ids = idsParam.split(",");
    const result = await Project.deleteMany({ _id: { $in: ids }, userId: session.user.id });
    return NextResponse.json({ success: true, deletedCount: result.deletedCount });
  }

  if (id) {
    const result = await Project.deleteOne({ _id: id, userId: session.user.id });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "ID or IDs required" }, { status: 400 });
}
