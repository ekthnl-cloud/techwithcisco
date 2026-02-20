import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, Clock, Award, CheckCircle } from "lucide-react";

async function getUserEnrollments(userId: string) {
  return await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          chapters: {
            include: {
              lessons: true,
            },
          },
        },
      },
    },
  });
}

async function getUserProgress(userId: string, courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      chapters: {
        include: {
          lessons: true,
        },
      },
    },
  });

  if (!course) return 0;

  const totalLessons = course.chapters.reduce(
    (acc, ch) => acc + ch.lessons.length,
    0
  );

  const completedLessons = await prisma.lessonProgress.count({
    where: {
      userId,
      lessonId: {
        in: course.chapters.flatMap((ch) => ch.lessons.map((l) => l.id)),
      },
      completed: true,
    },
  });

  return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string; courseId?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { payment, courseId } = await searchParams;

  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;
  const enrollments = await getUserEnrollments(userId);

  return (
    <div className="min-h-screen pt-20 py-12">
      <div className="container-custom">
        {payment === "success" && (
          <div className="bg-green-500/10 border border-green-500 text-green-400 px-6 py-4 rounded-lg mb-8">
            Payment successful! You are now enrolled in the course.
          </div>
        )}

        {payment === "error" && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-6 py-4 rounded-lg mb-8">
            Payment failed. Please try again.
          </div>
        )}

        <h1 className="text-3xl font-bold text-white mb-8">
          Welcome back, {session.user.name || "Student"}!
        </h1>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Enrolled Courses</p>
                <p className="text-2xl font-bold text-white">{enrollments.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Completed Lessons</p>
                <p className="text-2xl font-bold text-white">
                  {await prisma.lessonProgress.count({
                    where: { userId, completed: true },
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Certificates Earned</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-6">My Courses</h2>

        {enrollments.length === 0 ? (
          <div className="text-center py-16 bg-slate-800 rounded-xl">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <p className="text-slate-400 text-lg mb-4">
              You haven&apos;t enrolled in any courses yet.
            </p>
            <Link
              href="/courses"
              className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {enrollments.map(async (enrollment) => {
              const progress = await getUserProgress(userId, enrollment.courseId);
              const firstChapter = enrollment.course.chapters[0];
              return (
                <Link
                  key={enrollment.id}
                  href={
                    firstChapter
                      ? `/courses/${enrollment.courseId}/chapters/${firstChapter.id}`
                      : "#"
                  }
                  className="bg-slate-800 rounded-xl overflow-hidden hover:ring-2 hover:ring-indigo-500 transition-all"
                >
                  <div className="flex">
                    <div className="w-32 h-24 bg-slate-700 flex-shrink-0">
                      {enrollment.course.imageUrl ? (
                        <img
                          src={enrollment.course.imageUrl}
                          alt={enrollment.course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-slate-500" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex-1">
                      <h3 className="font-semibold text-white mb-2">
                        {enrollment.course.title}
                      </h3>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-indigo-500 h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-slate-400 text-sm">{progress}%</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
