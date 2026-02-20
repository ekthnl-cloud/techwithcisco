import { prisma } from "@/lib/prisma";
import { BookOpen, Users, DollarSign, Award } from "lucide-react";

async function getStats() {
  const [totalCourses, totalUsers, totalEnrollments, totalRevenue] =
    await Promise.all([
      prisma.course.count(),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.enrollment.count(),
      prisma.payment.aggregate({
        where: { status: "completed" },
        _sum: { amount: true },
      }),
    ]);

  return {
    totalCourses,
    totalUsers,
    totalEnrollments,
    totalRevenue: totalRevenue._sum.amount || 0,
  };
}

async function getRecentEnrollments() {
  return await prisma.enrollment.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { title: true } },
    },
  });
}

async function getRecentPayments() {
  const payments = await prisma.payment.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    where: { status: "completed" },
  });
  
  const paymentsWithDetails = await Promise.all(
    payments.map(async (payment) => {
      const [user, course] = await Promise.all([
        prisma.user.findUnique({
          where: { id: payment.userId },
          select: { name: true, email: true },
        }),
        payment.courseId ? prisma.course.findUnique({
          where: { id: payment.courseId },
          select: { title: true },
        }) : Promise.resolve(null),
      ]);
      return { ...payment, user, course };
    })
  );
  
  return paymentsWithDetails;
}

export default async function AdminDashboard() {
  const stats = await getStats();
  const recentEnrollments = await getRecentEnrollments();
  const recentPayments = await getRecentPayments();

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Courses</p>
              <p className="text-2xl font-bold text-white">{stats.totalCourses}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Enrollments</p>
              <p className="text-2xl font-bold text-white">{stats.totalEnrollments}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-white">
                ${stats.totalRevenue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Recent Enrollments
          </h2>
          {recentEnrollments.length === 0 ? (
            <p className="text-slate-400">No enrollments yet</p>
          ) : (
            <div className="space-y-4">
              {recentEnrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0"
                >
                  <div>
                    <p className="text-white">{enrollment.user.name}</p>
                    <p className="text-slate-400 text-sm">
                      {enrollment.course.title}
                    </p>
                  </div>
                  <span className="text-slate-500 text-sm">
                    {new Date(enrollment.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Recent Payments
          </h2>
          {recentPayments.length === 0 ? (
            <p className="text-slate-400">No payments yet</p>
          ) : (
            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0"
                >
                  <div>
                    <p className="text-white">{payment.user?.name || "Unknown"}</p>
                    <p className="text-slate-400 text-sm">
                      {payment.course?.title || "Unknown Course"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-semibold">
                      ${payment.amount}
                    </p>
                    <p className="text-slate-500 text-sm">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
