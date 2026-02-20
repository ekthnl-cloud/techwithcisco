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
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const courseId = searchParams.get("courseId");

    const where: any = { isActive: true };

    if (type) where.type = type;
    if (courseId) where.courseId = courseId;

    const rooms = await prisma.chatRoom.findMany({
      where,
      include: {
        course: { select: { id: true, title: true } },
        participants: {
          where: { userId },
          select: { id: true, role: true }
        },
        _count: { select: { messages: true, participants: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(rooms);
  } catch (error) {
    console.error("Error fetching chat rooms:", error);
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
    const role = (session.user as any).role;

    const { name, type, courseId } = await req.json();

    if (!type || !["GLOBAL", "COURSE", "DIRECT"].includes(type)) {
      return NextResponse.json({ error: "Invalid chat room type" }, { status: 400 });
    }

    // Check permissions
    if (type === "COURSE" && role !== "ADMIN") {
      const hasPermission = await checkCoursePermission(userId, courseId);
      if (!hasPermission) {
        return NextResponse.json({ error: "No permission to create course chat" }, { status: 403 });
      }
    }

    // Check if course chat already exists
    if (type === "COURSE" && courseId) {
      const existing = await prisma.chatRoom.findFirst({
        where: { type: "COURSE", courseId }
      });
      if (existing) {
        return NextResponse.json(existing);
      }
    }

    const room = await prisma.chatRoom.create({
      data: {
        name,
        type,
        courseId,
        participants: {
          create: {
            userId,
            role: "ADMIN"
          }
        }
      },
      include: {
        course: { select: { id: true, title: true } }
      }
    });

    return NextResponse.json(room);
  } catch (error) {
    console.error("Error creating chat room:", error);
    return NextResponse.json({ error: "Failed to create chat room" }, { status: 500 });
  }
}

async function checkCoursePermission(userId: string, courseId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { customRole: true }
  });

  if (user?.role === "ADMIN") return true;

  const permissions = user?.customRole?.permissions ? JSON.parse(user.customRole.permissions) : [];
  return permissions.includes("teach_course") || permissions.includes("manage_courses");
}
