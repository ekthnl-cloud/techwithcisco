import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await params;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const before = searchParams.get("before");

    // Check if user is participant
    const userId = (session.user as any).id;
    const participant = await prisma.chatParticipant.findUnique({
      where: {
        userId_chatRoomId: { userId, chatRoomId: roomId }
      }
    });

    if (!participant) {
      return NextResponse.json({ error: "Not a participant" }, { status: 403 });
    }

    const where: any = {
      chatRoomId: roomId,
      isDeleted: false,
      isBlocked: false
    };

    if (before) {
      where.createdAt = { lt: new Date(before) };
    }

    const messages = await prisma.chatMessage.findMany({
      where,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        sender: {
          select: { id: true, name: true, username: true, image: true }
        }
      }
    });

    return NextResponse.json(messages.reverse());
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await params;
    const userId = (session.user as any).id;

    // Check if user is participant
    const participant = await prisma.chatParticipant.findUnique({
      where: {
        userId_chatRoomId: { userId, chatRoomId: roomId }
      }
    });

    if (!participant) {
      return NextResponse.json({ error: "Not a participant" }, { status: 403 });
    }

    // Check if user is blocked
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.isBlocked) {
      return NextResponse.json({ error: "You are blocked" }, { status: 403 });
    }

    const { content, imageUrl } = await req.json();

    if (!content?.trim() && !imageUrl) {
      return NextResponse.json({ error: "Message content required" }, { status: 400 });
    }

    const message = await prisma.chatMessage.create({
      data: {
        content: content?.trim() || "",
        imageUrl,
        chatRoomId: roomId,
        senderId: userId
      },
      include: {
        sender: {
          select: { id: true, name: true, username: true, image: true }
        }
      }
    });

    // Create notification for room participants
    const participants = await prisma.chatParticipant.findMany({
      where: {
        chatRoomId: roomId,
        userId: { not: userId }
      }
    });

    await prisma.notification.createMany({
      data: participants.map(p => ({
        userId: p.userId,
        type: "CHAT_MESSAGE",
        title: "New Message",
        message: `${user?.name || "Someone"} sent a message in chat`,
        data: JSON.stringify({ roomId, messageId: message.id })
      }))
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
