import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");
    const courseId = searchParams.get("courseId");

    if (!reference || !courseId) {
      return NextResponse.redirect(new URL("/dashboard?payment=error", req.url));
    }

    const payment = await prisma.payment.findUnique({
      where: { reference },
    });

    if (!payment) {
      return NextResponse.redirect(new URL("/dashboard?payment=error", req.url));
    }

    await prisma.payment.update({
      where: { reference },
      data: {
        status: "completed",
        paystackRef: reference,
      },
    });

    // Only create enrollment if courseId is provided
    if (courseId && payment.courseId) {
      // Check if enrollment already exists
      const existingEnrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: payment.userId,
            courseId: payment.courseId,
          },
        },
      });

      if (!existingEnrollment) {
        await prisma.enrollment.create({
          data: {
            userId: payment.userId,
            courseId: payment.courseId,
            status: "APPROVED", // Auto-approve for payments
          },
        });
      }
    }

    return NextResponse.redirect(
      new URL(`/dashboard?payment=success&courseId=${courseId}`, req.url)
    );
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.redirect(new URL("/dashboard?payment=error", req.url));
  }
}
