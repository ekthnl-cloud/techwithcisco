import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CourseForm } from "@/components/admin/CourseForm";

async function getCourse(courseId: string) {
  return await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      chapters: {
        orderBy: { position: "asc" },
        include: {
          lessons: {
            orderBy: { position: "asc" },
          },
        },
      },
    },
  });
}

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await getCourse(id);

  if (!course) {
    notFound();
  }

  return (
    <CourseForm
      initialData={{
        id: course.id,
        title: course.title,
        description: course.description || "",
        imageUrl: course.imageUrl || "",
        price: course.price,
        prize: course.prize || "",
        chapters: course.chapters.map((ch) => ({
          id: ch.id,
          title: ch.title,
          imageUrl: ch.imageUrl || "",
          position: ch.position,
          lessons: ch.lessons.map((l) => ({
            id: l.id,
            title: l.title,
            type: l.type,
            content: l.content || "",
            position: l.position,
          })),
        })),
      }}
    />
  );
}
