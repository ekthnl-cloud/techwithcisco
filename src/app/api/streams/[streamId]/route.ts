import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { endLivepeerStream } from "@/lib/livepeer";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ streamId: string }> }
) {
  try {
    const { streamId } = await params;

    const stream = await prisma.liveStream.findUnique({
      where: { id: streamId },
      include: {
        host: { select: { id: true, name: true, image: true, email: true } },
        course: { select: { id: true, title: true } },
        viewers: { select: { userId: true } }
      }
    });

    if (!stream) {
      return NextResponse.json({ error: "Stream not found" }, { status: 404 });
    }

    return NextResponse.json(stream);
  } catch (error) {
    console.error("Error fetching stream:", error);
    return NextResponse.json({ error: "Failed to fetch stream" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ streamId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { streamId } = await params;
    const userId = (session.user as any).id;

    const stream = await prisma.liveStream.findUnique({
      where: { id: streamId }
    });

    if (!stream) {
      return NextResponse.json({ error: "Stream not found" }, { status: 404 });
    }

    const { action } = await req.json();

    if (action === "start") {
      if (stream.hostId !== userId) {
        return NextResponse.json({ error: "Only host can start stream" }, { status: 403 });
      }

      const updated = await prisma.liveStream.update({
        where: { id: streamId },
        data: {
          status: "LIVE",
          startedAt: new Date()
        }
      });

      // Notify enrolled users if course stream
      if (stream.courseId) {
        const enrollments = await prisma.enrollment.findMany({
          where: { courseId: stream.courseId, status: "APPROVED" }
        });

        await prisma.notification.createMany({
          data: enrollments.map(e => ({
            userId: e.userId,
            type: "LIVE_STREAM",
            title: "Live Stream Started",
            message: `A live stream has started: ${stream.title}`,
            data: JSON.stringify({ streamId })
          }))
        });
      }

      // Also notify all users for global streams
      if (!stream.courseId) {
        const users = await prisma.user.findMany({
          where: { role: "STUDENT", isActive: true }
        });

        await prisma.notification.createMany({
          data: users.map(u => ({
            userId: u.id,
            type: "LIVE_STREAM",
            title: "Live Stream Started",
            message: `A live stream has started: ${stream.title}`,
            data: JSON.stringify({ streamId })
          }))
        });
      }

      return NextResponse.json(updated);
    }

    if (action === "end") {
      if (stream.hostId !== userId) {
        return NextResponse.json({ error: "Only host can end stream" }, { status: 403 });
      }

      // End stream on Livepeer if there's a stream URL (which contains the stream key)
      if (stream.streamUrl) {
        await endLivepeerStream(stream.streamUrl);
      }

      const updated = await prisma.liveStream.update({
        where: { id: streamId },
        data: {
          status: "ENDED",
          endedAt: new Date()
        }
      });

      return NextResponse.json(updated);
    }

    if (action === "join") {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.isBlocked) {
        return NextResponse.json({ error: "You are blocked" }, { status: 403 });
      }

      // For course streams, check enrollment
      if (stream.courseId) {
        const enrollment = await prisma.enrollment.findFirst({
          where: { userId, courseId: stream.courseId, status: "APPROVED" }
        });
        if (!enrollment && stream.hostId !== userId) {
          return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
        }
      }

      await prisma.streamViewer.upsert({
        where: { streamId_userId: { streamId, userId } },
        update: {},
        create: { streamId, userId }
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error in stream action:", error);
    return NextResponse.json({ error: "Stream action failed" }, { status: 500 });
  }
}
