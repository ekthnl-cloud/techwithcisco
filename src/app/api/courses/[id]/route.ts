import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { title, description, imageUrl, price, prize, chapters } = await req.json();

    await prisma.chapter.deleteMany({
      where: { courseId: id },
    });

    const course = await prisma.course.update({
      where: { id },
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
    console.error("Course update error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.course.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Course deletion error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
