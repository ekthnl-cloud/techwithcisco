import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createLivepeerStream } from "@/lib/livepeer";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const courseId = searchParams.get("courseId");

    const where: any = {};
    if (status) where.status = status;
    if (courseId) where.courseId = courseId;

    const streams = await prisma.liveStream.findMany({
      where,
      include: {
        host: { select: { id: true, name: true, image: true } },
        course: { select: { id: true, title: true } },
        _count: { select: { viewers: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(streams);
  } catch (error) {
    console.error("Error fetching streams:", error);
    return NextResponse.json({ error: "Failed to fetch streams" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    // Check permissions
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { customRole: true }
    });

    if (role !== "ADMIN") {
      const permissions = user?.customRole?.permissions ? JSON.parse(user.customRole.permissions) : [];
      if (!permissions.includes("stream")) {
        return NextResponse.json({ error: "No permission to stream" }, { status: 403 });
      }
    }

    const { title, description, courseId } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Title required" }, { status: 400 });
    }

    // Create stream on Livepeer
    const livepeerStream = await createLivepeerStream(title);

    if (!livepeerStream) {
      return NextResponse.json({ error: "Failed to create live stream. Please check your API key." }, { status: 500 });
    }

    const stream = await prisma.liveStream.create({
      data: {
        title,
        description,
        courseId,
        hostId: userId,
        status: "SCHEDULED",
        streamUrl: livepeerStream.streamKey,
        viewerUrl: `https://livepeer.com/playback/${livepeerStream.playbackId}`,
      },
      include: {
        host: { select: { id: true, name: true, image: true } },
        course: { select: { id: true, title: true } }
      }
    });

    return NextResponse.json({
      ...stream,
      playbackId: livepeerStream.playbackId,
      streamKey: livepeerStream.streamKey,
    });
  } catch (error) {
    console.error("Error creating stream:", error);
    return NextResponse.json({ error: "Failed to create stream" }, { status: 500 });
  }
}
