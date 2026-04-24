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

  await connectDB();
  const id = req.nextUrl.searchParams.get("id");

  try {
    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ error: "Invalid Project ID format" }, { status: 400 });
      }
      const project = await Project.findById(id);
      if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

      return NextResponse.json(project);
    }

    const status = req.nextUrl.searchParams.get("status");
    const query: any = {};
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
    userId: (session.user as any).id, // Record who created it
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

  const project = await Project.findById(id);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

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
  const result = await Project.deleteOne({ _id: id });

  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
