import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BookOpen } from "lucide-react";

async function getCourses() {
  return await prisma.course.findMany({
    where: { isPublished: true },
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

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div className="min-h-screen pt-20 py-12">
      <div className="container-custom">
        <h1 className="text-3xl font-bold text-white mb-8">All Courses</h1>

        {courses.length === 0 ? (
          <div className="text-center text-slate-400 py-20">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <p className="text-lg">No courses available yet.</p>
            <p className="mt-2">Check back soon!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {courses.map((course) => {
              const lessonCount = course.chapters.reduce(
                (acc, ch) => acc + ch.lessons.length,
                0
              );
              return (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="bg-slate-800 rounded-xl overflow-hidden hover:ring-2 hover:ring-indigo-500 transition-all group"
                >
                  <div className="aspect-video bg-slate-700 relative">
                    {course.imageUrl ? (
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-slate-500" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors mb-2">
                      {course.title}
                    </h3>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                      {course.description || "No description available"}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-sm">
                        {lessonCount} lessons
                      </span>
                      <span className="text-indigo-400 font-semibold">
                        {course.price === 0 ? "Free" : `$${course.price}`}
                      </span>
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
