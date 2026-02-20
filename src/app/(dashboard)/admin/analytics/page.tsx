import { prisma } from "@/lib/prisma";

async function getAnalytics() {
  const [
    totalUsers,
    totalCourses,
    totalEnrollments,
    completedLessons,
    totalPayments,
    revenueByMonth,
    enrollmentsByCourse,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.course.count(),
    prisma.enrollment.count(),
    prisma.lessonProgress.count({ where: { completed: true } }),
    prisma.payment.aggregate({
      where: { status: "completed" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.payment.findMany({
      where: { status: "completed" },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.enrollment.groupBy({
      by: ["courseId"],
      _count: true,
    }),
  ]);

  const courseData = await Promise.all(
    enrollmentsByCourse.map(async (e) => {
      const course = await prisma.course.findUnique({
        where: { id: e.courseId },
      });
      return { course: course?.title || "Unknown", count: e._count };
    })
  );

  return {
    totalUsers,
    totalCourses,
    totalEnrollments,
    completedLessons,
    totalPayments: totalPayments._count,
    totalRevenue: totalPayments._sum.amount || 0,
    revenueByMonth,
    courseData,
  };
}

export default async function AdminAnalyticsPage() {
  const analytics = await getAnalytics();

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Analytics</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800 rounded-xl p-6">
          <p className="text-slate-400 text-sm">Total Users</p>
          <p className="text-3xl font-bold text-white">{analytics.totalUsers}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-6">
          <p className="text-slate-400 text-sm">Total Revenue</p>
          <p className="text-3xl font-bold text-green-400">
            ${analytics.totalRevenue.toFixed(2)}
          </p>
        </div>
        <div className="bg-slate-800 rounded-xl p-6">
          <p className="text-slate-400 text-sm">Total Payments</p>
          <p className="text-3xl font-bold text-white">{analytics.totalPayments}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Enrollments by Course
          </h2>
          <div className="space-y-3">
            {analytics.courseData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-slate-300">{item.course}</span>
                <span className="text-white font-semibold">{item.count}</span>
              </div>
            ))}
            {analytics.courseData.length === 0 && (
              <p className="text-slate-400">No enrollments yet</p>
            )}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Overview</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Courses</span>
              <span className="text-white font-semibold">{analytics.totalCourses}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Enrollments</span>
              <span className="text-white font-semibold">{analytics.totalEnrollments}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Completed Lessons</span>
              <span className="text-white font-semibold">{analytics.completedLessons}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
