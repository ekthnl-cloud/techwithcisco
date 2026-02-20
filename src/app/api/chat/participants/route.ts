import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const participants = await prisma.chatParticipant.findMany({
      where: { userId },
      include: {
        chatRoom: {
          include: {
            course: { select: { id: true, title: true } },
            _count: { select: { participants: true, messages: true } }
          }
        }
      },
      orderBy: { joinedAt: "desc" }
    });

    return NextResponse.json(participants);
  } catch (error) {
    console.error("Error fetching participants:", error);
    return NextResponse.json({ error: "Failed to fetch chat rooms" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { roomId, role } = await req.json();

    if (!roomId) {
      return NextResponse.json({ error: "Room ID required" }, { status: 400 });
    }

    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId }
    });

    if (!room) {
      return NextResponse.json({ error: "Chat room not found" }, { status: 404 });
    }

    // Check if already participant
    const existing = await prisma.chatParticipant.findUnique({
      where: {
        userId_chatRoomId: { userId, chatRoomId: roomId }
      }
    });

    if (existing) {
      return NextResponse.json(existing);
    }

    // For course chat, check enrollment
    if (room.type === "COURSE" && room.courseId) {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          userId,
          courseId: room.courseId,
          status: "APPROVED"
        }
      });

      if (!enrollment) {
        return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
      }
    }

    const participant = await prisma.chatParticipant.create({
      data: {
        userId,
        chatRoomId: roomId,
        role: role || "MEMBER"
      },
      include: {
        user: { select: { id: true, name: true, username: true, image: true } }
      }
    });

    return NextResponse.json(participant);
  } catch (error) {
    console.error("Error joining chat:", error);
    return NextResponse.json({ error: "Failed to join chat" }, { status: 500 });
  }
}
