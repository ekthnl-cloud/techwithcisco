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

    const userId = (session.user as any).id;
    const { lessonId, score, answers } = await req.json();

    await prisma.quizAttempt.create({
      data: {
        userId,
        lessonId,
        score,
        answers,
      },
    });

    if (score >= 70) {
      await prisma.lessonProgress.upsert({
        where: {
          userId_lessonId: {
            userId,
            lessonId,
          },
        },
        update: { completed: true },
        create: {
          userId,
          lessonId,
          completed: true,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Quiz submission error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
