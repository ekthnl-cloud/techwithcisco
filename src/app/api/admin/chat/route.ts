import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return false;
  return (session.user as any).role === "ADMIN";
}

export async function GET(req: Request) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");

    const where: any = {};
    if (roomId) where.chatRoomId = roomId;

    const messages = await prisma.chatMessage.findMany({
      where,
      include: {
        sender: { select: { id: true, name: true, email: true, username: true } },
        chatRoom: { select: { id: true, name: true, type: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 100
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId, action, userId, roomId } = await req.json();

    if (action === "delete_message" && messageId) {
      await prisma.chatMessage.update({
        where: { id: messageId },
        data: { isDeleted: true }
      });
      return NextResponse.json({ success: true });
    }

    if (action === "block_message" && messageId) {
      await prisma.chatMessage.update({
        where: { id: messageId },
        data: { isBlocked: true }
      });
      return NextResponse.json({ success: true });
    }

    if (action === "block_user" && userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { isBlocked: true }
      });
      return NextResponse.json({ success: true });
    }

    if (action === "unblock_user" && userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { isBlocked: false }
      });
      return NextResponse.json({ success: true });
    }

    if (action === "kick_user" && userId && roomId) {
      await prisma.chatParticipant.delete({
        where: {
          userId_chatRoomId: { userId, chatRoomId: roomId }
        }
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error in chat moderation:", error);
    return NextResponse.json({ error: "Moderation failed" }, { status: 500 });
  }
}
