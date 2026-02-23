import Link from "next/link";
import { Code, BookOpen, Users, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0e17]">
      <nav className="border-b border-[#2d3748] bg-[#111827]/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#8b5cf6] flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Tech With Cisco</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-[#8b9dc3] hover:text-white transition-colors">
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="bg-gradient-to-r from-[#00d4ff] to-[#8b5cf6] text-white px-4 py-2 rounded-lg font-medium hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="py-20 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-5xl font-bold text-white mb-6">
              Master <span className="text-[#00d4ff]">IT</span> Skills
            </h1>
            <p className="text-xl text-[#5a6a85] mb-8">
              Learn programming, cloud computing, cybersecurity and more from industry experts.
            </p>
            <div className="flex justify-center gap-4">
              <Link 
                href="/register" 
                className="bg-gradient-to-r from-[#00d4ff] to-[#8b5cf6] text-white px-8 py-3 rounded-lg font-medium text-lg hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] transition-all"
              >
                Start Learning Free
              </Link>
              <Link 
                href="/login" 
                className="border border-[#2d3748] text-white px-8 py-3 rounded-lg font-medium text-lg hover:bg-[#1e293b] transition-colors"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-[#111827]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[#00d4ff]/20 flex items-center justify-center">
                  <BookOpen className="w-7 h-7 text-[#00d4ff]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Expert-Led Courses</h3>
                <p className="text-[#5a6a85]">Learn from industry professionals with years of experience</p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[#8b5cf6]/20 flex items-center justify-center">
                  <Users className="w-7 h-7 text-[#8b5cf6]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Community</h3>
                <p className="text-[#5a6a85]">Connect with fellow learners and grow together</p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[#00ff88]/20 flex items-center justify-center">
                  <Zap className="w-7 h-7 text-[#00ff88]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Hands-on Projects</h3>
                <p className="text-[#5a6a85]">Practice with real-world projects and challenges</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#2d3748] py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-[#5a6a85]">
          <p>&copy; 2025 Tech With Cisco. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
