import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";

async function getCourses() {
  return await prisma.course.findMany({
    include: {
      chapters: {
        include: {
          lessons: true,
        },
      },
      enrollments: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

async function togglePublish(courseId: string, isPublished: boolean) {
  "use server";
  await prisma.course.update({
    where: { id: courseId },
    data: { isPublished: !isPublished },
  });
}

async function deleteCourse(courseId: string) {
  "use server";
  await prisma.course.delete({
    where: { id: courseId },
  });
}

export default async function AdminCoursesPage() {
  const courses = await getCourses();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Courses</h1>
        <Link
          href="/admin/courses/new"
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-16 bg-slate-800 rounded-xl">
          <p className="text-slate-400 text-lg mb-4">No courses yet</p>
          <Link
            href="/admin/courses/new"
            className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Create Your First Course
          </Link>
        </div>
      ) : (
        <div className="bg-slate-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left p-4 text-slate-400 font-medium">Course</th>
                <th className="text-left p-4 text-slate-400 font-medium">Chapters</th>
                <th className="text-left p-4 text-slate-400 font-medium">Lessons</th>
                <th className="text-left p-4 text-slate-400 font-medium">Enrolled</th>
                <th className="text-left p-4 text-slate-400 font-medium">Price</th>
                <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                <th className="text-right p-4 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => {
                const lessonCount = course.chapters.reduce(
                  (acc, ch) => acc + ch.lessons.length,
                  0
                );
                return (
                  <tr key={course.id} className="border-b border-slate-700 last:border-0">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-700 rounded-lg overflow-hidden">
                          {course.imageUrl ? (
                            <img
                              src={course.imageUrl}
                              alt={course.title}
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div>
                          <p className="text-white font-medium">{course.title}</p>
                          <p className="text-slate-500 text-sm truncate max-w-xs">
                            {course.description?.substring(0, 50)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">
                      {course.chapters.length}
                    </td>
                    <td className="p-4 text-slate-300">{lessonCount}</td>
                    <td className="p-4 text-slate-300">
                      {course.enrollments.length}
                    </td>
                    <td className="p-4 text-slate-300">
                      {course.price === 0 ? "Free" : `$${course.price}`}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          course.isPublished
                            ? "bg-green-500/20 text-green-400"
                            : "bg-slate-600 text-slate-400"
                        }`}
                      >
                        {course.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <form action={togglePublish.bind(null, course.id, course.isPublished)}>
                          <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                            {course.isPublished ? (
                              <EyeOff className="w-4 h-4 text-slate-400" />
                            ) : (
                              <Eye className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                        </form>
                        <Link
                          href={`/admin/courses/${course.id}`}
                          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-slate-400" />
                        </Link>
                        <form action={deleteCourse.bind(null, course.id)}>
                          <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
