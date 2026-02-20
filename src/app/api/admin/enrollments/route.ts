import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { status: "PENDING" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true, price: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(enrollments);
  } catch (error) {
    console.error("Error fetching pending enrollments:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { enrollmentId, action } = await req.json();

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { course: true, user: true },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }

    if (action === "approve") {
      await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: { status: "APPROVED" },
      });

      // Notify user
      await prisma.notification.create({
        data: {
          userId: enrollment.userId,
          type: "ENROLLMENT_REQUEST",
          title: "Enrollment Approved",
          message: `Your enrollment in "${enrollment.course.title}" has been approved!`,
        },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: enrollment.userId,
          userEmail: enrollment.user.email,
          action: "ENROLLMENT_APPROVED",
          description: `Enrollment for course "${enrollment.course.title}" was approved`,
        },
      });
    } else if (action === "deny") {
      await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: { status: "DENIED" },
      });

      await prisma.notification.create({
        data: {
          userId: enrollment.userId,
          type: "ENROLLMENT_REQUEST",
          title: "Enrollment Denied",
          message: `Your enrollment in "${enrollment.course.title}" has been denied.`,
        },
      });

      await prisma.activityLog.create({
        data: {
          userId: enrollment.userId,
          userEmail: enrollment.user.email,
          action: "ENROLLMENT_DENIED",
          description: `Enrollment for course "${enrollment.course.title}" was denied`,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Enrollment action error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
