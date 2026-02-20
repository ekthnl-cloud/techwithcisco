import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        chapters: {
          include: { lessons: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(courses);
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, imageUrl, price, prize, chapters } = await req.json();

    const course = await prisma.course.create({
      data: {
        title,
        description,
        imageUrl,
        price: price || 0,
        prize,
        chapters: {
          create: chapters.map((chapter: any, index: number) => ({
            title: chapter.title,
            position: index,
            lessons: {
              create: chapter.lessons.map((lesson: any, j: number) => ({
                title: lesson.title,
                type: lesson.type,
                content: lesson.content,
                position: j,
              })),
            },
          })),
        },
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("Course creation error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
