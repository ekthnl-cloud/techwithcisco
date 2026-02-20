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

    const buttons = await prisma.paymentButton.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(buttons);
  } catch (error) {
    console.error("Error fetching payment buttons:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, description, amount, currency, buttonText, buttonColor, redirectUrl, isActive } = await req.json();

    const button = await prisma.paymentButton.create({
      data: {
        name,
        description,
        amount: parseFloat(amount) || 0,
        currency: currency || "NGN",
        buttonText: buttonText || "Pay Now",
        buttonColor: buttonColor || "#6366f1",
        redirectUrl,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(button);
  } catch (error) {
    console.error("Error creating payment button:", error);
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

    const { id, ...data } = await req.json();

    const button = await prisma.paymentButton.update({
      where: { id },
      data: {
        ...data,
        amount: data.amount ? parseFloat(data.amount) : undefined,
      },
    });

    return NextResponse.json(button);
  } catch (error) {
    console.error("Error updating payment button:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    await prisma.paymentButton.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting payment button:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
