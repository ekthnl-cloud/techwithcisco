"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogOut, User, LayoutDashboard, MessageSquare, Video } from "lucide-react";
import { NotificationBell } from "./notifications/NotificationBell";

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0e17]/95 backdrop-blur-md border-b border-[#2d3748]">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <img 
              src="/icon.jpg" 
              alt="Tech With Cisco" 
              className="w-9 h-9 rounded-lg object-cover"
            />
            <span className="text-xl font-bold text-white group-hover:text-[#00d4ff] transition-colors">
              Tech<span className="text-[#00d4ff]">With</span>Cisco
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              href="/courses"
              className="px-4 py-2 text-[#8b9dc3] hover:text-[#00d4ff] hover:bg-[#1e293b] rounded-lg transition-all"
            >
              Courses
            </Link>

            {status === "loading" ? (
              <div className="w-20 h-8 bg-[#1e293b] animate-pulse rounded-lg" />
            ) : session ? (
              <div className="flex items-center gap-1">
                <Link
                  href="/chat"
                  className="px-3 py-2 text-[#8b9dc3] hover:text-[#00ff88] hover:bg-[#1e293b] rounded-lg transition-all flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm">Chat</span>
                </Link>
                <Link
                  href="/live"
                  className="px-3 py-2 text-[#8b9dc3] hover:text-[#ff4757] hover:bg-[#1e293b] rounded-lg transition-all flex items-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  <span className="text-sm">Live</span>
                </Link>
                {(session.user as any)?.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="px-3 py-2 text-[#8b9dc3] hover:text-[#8b5cf6] hover:bg-[#1e293b] rounded-lg transition-all flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="text-sm">Admin</span>
                  </Link>
                )}
                <NotificationBell />
                <Link
                  href="/dashboard"
                  className="px-3 py-2 text-[#8b9dc3] hover:text-white hover:bg-[#1e293b] rounded-lg transition-all flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => signOut()}
                  className="px-3 py-2 text-[#8b9dc3] hover:text-[#ff4757] hover:bg-[#1e293b] rounded-lg transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-[#8b9dc3] hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-[#00d4ff] to-[#00a8cc] hover:from-[#00a8cc] hover:to-[#00d4ff] text-white px-5 py-2 rounded-lg font-medium transition-all hover:shadow-[0_0_20px_rgba(0,212,255,0.4)]"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
