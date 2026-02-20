import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BookOpen, Code, Video, Award, Zap, Users, Globe } from "lucide-react";

async function getPublishedCourses() {
  return await prisma.course.findMany({
    where: { isPublished: true },
    include: {
      chapters: {
        include: {
          lessons: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function Home() {
  const courses = await getPublishedCourses();

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2234] via-[#0a0e17] to-[#0a0e17]"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300d4ff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
        
        <div className="relative container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 text-[#00d4ff] text-sm mb-6">
              <Zap className="w-4 h-4" />
              <span>Start Learning Today</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Master{" "}
              <span className="text-gradient bg-gradient-to-r from-[#00d4ff] via-[#8b5cf6] to-[#00ff88]">
                IT
              </span>
            </h1>
            
            <p className="text-xl text-[#8b9dc3] mb-10 max-w-2xl mx-auto">
              Learn to code with interactive video lessons, hands-on exercises, 
              and live streaming sessions. Join thousands of developers.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/courses"
                className="bg-gradient-to-r from-[#00d4ff] to-[#00a8cc] hover:from-[#00a8cc] hover:to-[#00d4ff] text-white px-8 py-4 rounded-lg text-lg font-medium transition-all hover:shadow-[0_0_30px_rgba(0,212,255,0.4)]"
              >
                Browse Courses
              </Link>
              <Link
                href="/register"
                className="bg-[#1e293b] border border-[#2d3748] hover:border-[#00d4ff] text-white px-8 py-4 rounded-lg text-lg font-medium transition-all hover:shadow-[0_0_20px_rgba(0,212,255,0.2)]"
              >
                Start Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[#111827]">
        <div className="container-custom">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-[#0a0e17] border border-[#2d3748] rounded-xl p-6 hover:border-[#00d4ff] transition-all group">
              <div className="w-12 h-12 bg-gradient-to-br from-[#00d4ff]/20 to-[#00d4ff]/5 rounded-lg flex items-center justify-center mb-4 group-hover:shadow-[0_0_20px_rgba(0,212,255,0.2)] transition-all">
                <Video className="w-6 h-6 text-[#00d4ff]" />
              </div>
              <h3 className="text-white font-semibold mb-2">Video Lessons</h3>
              <p className="text-[#5a6a85] text-sm">
                High-quality video tutorials from beginner to advanced
              </p>
            </div>
            
            <div className="bg-[#0a0e17] border border-[#2d3748] rounded-xl p-6 hover:border-[#8b5cf6] transition-all group">
              <div className="w-12 h-12 bg-gradient-to-br from-[#8b5cf6]/20 to-[#8b5cf6]/5 rounded-lg flex items-center justify-center mb-4 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.2)] transition-all">
                <Code className="w-6 h-6 text-[#8b5cf6]" />
              </div>
              <h3 className="text-white font-semibold mb-2">Coding Exercises</h3>
              <p className="text-[#5a6a85] text-sm">
                Practice with real code in our interactive editor
              </p>
            </div>
            
            <div className="bg-[#0a0e17] border border-[#2d3748] rounded-xl p-6 hover:border-[#00ff88] transition-all group">
              <div className="w-12 h-12 bg-gradient-to-br from-[#00ff88]/20 to-[#00ff88]/5 rounded-lg flex items-center justify-center mb-4 group-hover:shadow-[0_0_20px_rgba(0,255,136,0.2)] transition-all">
                <BookOpen className="w-6 h-6 text-[#00ff88]" />
              </div>
              <h3 className="text-white font-semibold mb-2">Quizzes</h3>
              <p className="text-[#5a6a85] text-sm">
                Test your knowledge with interactive quizzes
              </p>
            </div>
            
            <div className="bg-[#0a0e17] border border-[#2d3748] rounded-xl p-6 hover:border-[#ffa502] transition-all group">
              <div className="w-12 h-12 bg-gradient-to-br from-[#ffa502]/20 to-[#ffa502]/5 rounded-lg flex items-center justify-center mb-4 group-hover:shadow-[0_0_20px_rgba(255,165,2,0.2)] transition-all">
                <Award className="w-6 h-6 text-[#ffa502]" />
              </div>
              <h3 className="text-white font-semibold mb-2">Certificates</h3>
              <p className="text-[#5a6a85] text-sm">
                Earn certificates upon course completion
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Available <span className="text-gradient bg-gradient-to-r from-[#00d4ff] to-[#00ff88]">Courses</span>
            </h2>
            <p className="text-[#8b9dc3]">Start your learning journey today</p>
          </div>
          
          {courses.length === 0 ? (
            <div className="text-center py-16 bg-[#111827] rounded-2xl border border-[#2d3748]">
              <Code className="w-16 h-16 text-[#2d3748] mx-auto mb-4" />
              <p className="text-[#8b9dc3] text-lg">No courses available yet.</p>
              <p className="text-[#5a6a85] mt-2">Check back soon!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {courses.map((course) => {
                const lessonCount = course.chapters.reduce(
                  (acc, ch) => acc + ch.lessons.length,
                  0
                );
                return (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className="bg-[#111827] border border-[#2d3748] rounded-xl overflow-hidden hover:border-[#00d4ff] hover:shadow-[0_0_30px_rgba(0,212,255,0.1)] transition-all group"
                  >
                    <div className="aspect-video bg-[#0a0e17] relative overflow-hidden">
                      {course.imageUrl ? (
                        <img
                          src={course.imageUrl}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Code className="w-12 h-12 text-[#2d3748]" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111827] to-transparent"></div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-white group-hover:text-[#00d4ff] transition-colors mb-2">
                        {course.title}
                      </h3>
                      <p className="text-[#5a6a85] text-sm mb-4 line-clamp-2">
                        {course.description || "No description available"}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-[#5a6a85] text-sm">
                          <BookOpen className="w-4 h-4" />
                          {lessonCount} lessons
                        </span>
                        <span className="text-[#00d4ff] font-semibold">
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
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#111827]">
        <div className="container-custom">
          <div className="bg-gradient-to-br from-[#0a0e17] to-[#1a2234] border border-[#2d3748] rounded-2xl p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-[#00d4ff]/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#8b5cf6]/10 rounded-full blur-3xl"></div>
            
            <div className="relative">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Start Learning?
              </h2>
              <p className="text-[#8b9dc3] mb-8 max-w-xl mx-auto">
                Join thousands of students already learning on our platform. 
                Get started for free today.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00d4ff] to-[#8b5cf6] hover:from-[#00a8cc] hover:to-[#7c3aed] text-white px-8 py-4 rounded-lg font-medium transition-all hover:shadow-[0_0_30px_rgba(0,212,255,0.4)]"
              >
                <Users className="w-5 h-5" />
                Join Now - It's Free
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
