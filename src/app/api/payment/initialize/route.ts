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

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const reference = `TWC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await prisma.payment.create({
      data: {
        userId,
        courseId,
        amount: course.price,
        currency: "NGN",
        status: "pending",
        reference,
      },
    });

    const paystackUrl = `https://checkout.paystack.com/${Buffer.from(
      `${process.env.PAYSTACK_PUBLIC_KEY}:`
    ).toString("base64")}`;

    const callbackUrl = `${process.env.NEXTAUTH_URL}/api/payment/verify?reference=${reference}&courseId=${courseId}`;

    return NextResponse.json({
      url: `https://checkout.paystack.com/p/${reference}?amount=${course.price * 100}&email=${user.email}&callback_url=${encodeURIComponent(callbackUrl)}`,
    });
  } catch (error) {
    console.error("Payment initialization error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
