import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Play, FileText, Code, CheckCircle } from "lucide-react";
import { LessonContent } from "@/components/course/LessonContent";

async function getChapterWithLessons(chapterId: string) {
  return await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      course: true,
      lessons: {
        orderBy: { position: "asc" },
      },
    },
  });
}

async function getLessonProgress(userId: string, lessonId: string) {
  return await prisma.lessonProgress.findUnique({
    where: {
      userId_lessonId: {
        userId,
        lessonId,
      },
    },
  });
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ courseId: string; chapterId: string }>;
}) {
  const { courseId, chapterId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;
  const chapter = await getChapterWithLessons(chapterId);

  if (!chapter) {
    notFound();
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });

  if (!enrollment) {
    redirect(`/courses/${courseId}`);
  }

  const currentLessonId =
    chapter.lessons.length > 0 ? chapter.lessons[0].id : null;
  const lessonProgresses = await Promise.all(
    chapter.lessons.map((lesson) => getLessonProgress(userId, lesson.id))
  );

  return (
    <div className="min-h-screen pt-16 bg-slate-900">
      <div className="flex h-[calc(100vh-4rem)]">
        <div className="w-80 bg-slate-800 border-r border-slate-700 overflow-y-auto">
          <div className="p-4 border-b border-slate-700">
            <Link
              href={`/courses/${courseId}`}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to course
            </Link>
            <h2 className="font-semibold text-white mt-4">{chapter.course.title}</h2>
            <p className="text-slate-400 text-sm">{chapter.title}</p>
          </div>

          <div className="p-2">
            {chapter.lessons.map((lesson, index) => {
              const progress = lessonProgresses[index];
              const icons = {
                VIDEO: Play,
                QUIZ: FileText,
                CODING: Code,
                READING: FileText,
              };
              const Icon = icons[lesson.type as keyof typeof icons];

              return (
                <Link
                  key={lesson.id}
                  href={`/courses/${courseId}/chapters/${chapterId}?lessonId=${lesson.id}`}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    lesson.id === currentLessonId
                      ? "bg-indigo-500/20 text-indigo-400"
                      : "text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="flex-1 text-sm">{lesson.title}</span>
                  {progress?.completed && (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {currentLessonId && (
            <LessonContent
              lesson={chapter.lessons[0]}
              courseId={courseId}
              chapterId={chapterId}
              userId={userId}
            />
          )}
        </div>
      </div>
    </div>
  );
}
