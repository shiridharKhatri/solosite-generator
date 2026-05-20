import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Project } from "@/models/Project";
import { migrateBase64Images } from "@/lib/migrate";

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
      const isSuperAdmin = (session.user as any).role === 'superadmin';
      const projectQuery = isSuperAdmin ? { _id: id } : { _id: id, userId: session.user.id };
      const project = await Project.findOne(projectQuery).populate("userId", "name email");
      if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

      // Automatically clean up base64 images on load (lazy-migration)
      const dataStr = JSON.stringify(project.data);
      if (dataStr.includes("data:image/")) {
        project.data = await migrateBase64Images(project.data);
        project.markModified("data");
        await project.save();
      }

      return NextResponse.json(project);
    }

    const status = req.nextUrl.searchParams.get("status");
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    const isSuperAdmin = (session.user as any).role === 'superadmin';
    const query: any = isSuperAdmin ? {} : { userId: session.user.id };
    if (status) query.status = status;

    // Get total count for pagination
    const total = await Project.countDocuments(query);

    // Exclude 'data' field when listing projects for the dashboard to prevent OOM
    const projects = await Project.find(query)
      .select("-data")
      .populate("userId", "name email") // Populate user info for superadmin
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

  // Clean data before creating project
  const cleanedData = await migrateBase64Images(data);

  const project = await Project.create({
    userId: session.user.id, // Record who created it
    name,
    data: cleanedData,
    status: status || 'draft',
    thumbnail: cleanedData?.hero?.image || '',
    theme: theme || cleanedData?.layoutStyle || 'default',
    seoScore: seoScore || 0,
  });

  return NextResponse.json(project);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id, data, status, name, theme, seoScore } = await req.json();

  const isSuperAdmin = (session.user as any).role === 'superadmin';
  const projectQuery = isSuperAdmin ? { _id: id } : { _id: id, userId: session.user.id };
  const project = await Project.findOne(projectQuery);
  if (!project) return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });

  if (data) {
    const cleanedData = await migrateBase64Images(data);
    project.data = cleanedData;
    project.thumbnail = cleanedData?.hero?.image || '';
    project.markModified("data");
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
    const isSuperAdmin = (session.user as any).role === 'superadmin';
    const deleteQuery = isSuperAdmin ? { _id: { $in: ids } } : { _id: { $in: ids }, userId: session.user.id };
    const result = await Project.deleteMany(deleteQuery);
    return NextResponse.json({ success: true, deletedCount: result.deletedCount });
  }

  if (id) {
    const isSuperAdmin = (session.user as any).role === 'superadmin';
    const deleteQuery = isSuperAdmin ? { _id: id } : { _id: id, userId: session.user.id };
    const result = await Project.deleteOne(deleteQuery);
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "ID or IDs required" }, { status: 400 });
}
