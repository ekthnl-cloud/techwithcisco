import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Lock, Play, FileText, Code, CheckCircle } from "lucide-react";
import { EnrollmentButton } from "@/components/course/EnrollmentButton";

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

async function getEnrollment(userId: string, courseId: string) {
  return await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await getSession();
  const course = await getCourse(courseId);

  if (!course) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Course Not Found</h1>
          <Link href="/courses" className="text-indigo-400 hover:underline">
            Back to courses
          </Link>
        </div>
      </div>
    );
  }

  const isEnrolled = session?.user
    ? await getEnrollment((session.user as any).id, courseId)
    : null;

  const lessonTypes = {
    VIDEO: Play,
    QUIZ: FileText,
    CODING: Code,
    READING: FileText,
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="bg-slate-800 py-12">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h1 className="text-3xl font-bold text-white mb-4">
                {course.title}
              </h1>
              <p className="text-slate-300 mb-6">{course.description}</p>

              <div className="flex items-center gap-4 text-slate-400">
                <span>
                  {course.chapters.length} chapters
                </span>
                <span>
                  {course.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0)}{" "}
                  lessons
                </span>
                {course.prize && (
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Certificate included
                  </span>
                )}
              </div>
            </div>

            <div className="bg-slate-700 rounded-xl p-6">
              <div className="aspect-video bg-slate-600 rounded-lg mb-4 overflow-hidden">
                {course.imageUrl ? (
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-12 h-12 text-slate-500" />
                  </div>
                )}
              </div>
              <div className="text-2xl font-bold text-white mb-4">
                {course.price === 0 ? "Free" : `$${course.price}`}
              </div>
              <EnrollmentButton
                courseId={courseId}
                price={course.price}
                isEnrolled={!!isEnrolled}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-12">
        <h2 className="text-2xl font-bold text-white mb-6">Course Content</h2>

        <div className="space-y-6">
          {course.chapters.map((chapter, chapterIndex) => (
            <div key={chapter.id} className="bg-slate-800 rounded-xl overflow-hidden">
              <div className="bg-slate-700 px-6 py-4">
                <h3 className="font-semibold text-white">
                  Chapter {chapterIndex + 1}: {chapter.title}
                </h3>
              </div>
              <div>
                {chapter.lessons.map((lesson, lessonIndex) => {
                  const typeKey = (lesson.type || "READING").toUpperCase() as keyof typeof lessonTypes;
                  const Icon = lessonTypes[typeKey] || FileText;
                  return (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-4 px-6 py-4 border-b border-slate-700 last:border-0"
                    >
                      <Icon className="w-5 h-5 text-slate-400" />
                      <span className="text-slate-300 flex-1">
                        {lesson.title}
                      </span>
                      <span className="text-xs text-slate-500 uppercase bg-slate-700 px-2 py-1 rounded">
                        {lesson.type.toLowerCase()}
                      </span>
                      {!isEnrolled && course.price > 0 && (
                        <Lock className="w-4 h-4 text-slate-500" />
                      )}
                      {isEnrolled && (
                        <Link
                          href={`/courses/${courseId}/chapters/${chapter.id}`}
                          className="text-indigo-400 hover:text-indigo-300"
                        >
                          Start
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

async function getSession() {
  const session = await getServerSession(authOptions);
  return session;
}
