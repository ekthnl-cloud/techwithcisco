import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await req.json();
    const userId = (session.user as any).id;

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json({ error: "Already enrolled" }, { status: 400 });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Create enrollment with PENDING status (admin must approve)
    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
        status: "PENDING", // Requires admin approval
      },
    });

    // Create notification for admin
    await prisma.notification.create({
      data: {
        type: "ENROLLMENT_REQUEST",
        title: "New Enrollment Request",
        message: `${session.user.name || session.user.email} requested to enroll in "${course.title}"`,
        data: JSON.stringify({ 
          enrollmentId: enrollment.id, 
          courseId, 
          courseTitle: course.title,
          price: course.price 
        }),
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        userEmail: (session.user as any).email,
        action: "ENROLLMENT_REQUEST",
        description: `Requested enrollment in course "${course.title}"`,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Enrollment request submitted. Please wait for admin approval." 
    });
  } catch (error) {
    console.error("Enrollment error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
