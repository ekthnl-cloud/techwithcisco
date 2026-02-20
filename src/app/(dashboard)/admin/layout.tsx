"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, BookOpen, Users, BarChart3, Megaphone, CreditCard, MessageSquare, Shield } from "lucide-react";
import { NotificationBell } from "@/components/admin/NotificationBell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as any)?.role;
  if (role !== "ADMIN") {
    redirect("/dashboard");
  }

  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/users", icon: Users, label: "Users" },
    { href: "/admin/enrollments", icon: BookOpen, label: "Enrollments" },
    { href: "/admin/courses", icon: BookOpen, label: "Courses" },
    { href: "/admin/announcements", icon: Megaphone, label: "Announcements" },
    { href: "/admin/payments", icon: CreditCard, label: "Payments" },
    { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/admin/chat", icon: MessageSquare, label: "Chat Moderation" },
    { href: "/admin/roles", icon: Shield, label: "Roles" },
  ];

  return (
    <div className="min-h-screen pt-16 flex">
      <aside className="w-64 bg-slate-800 border-r border-slate-700 fixed h-full">
        <div className="p-4 border-b border-slate-700">
          <h2 className="font-semibold text-white">Admin Panel</h2>
        </div>
        <nav className="p-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors"
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 ml-64 p-8">
        <div className="flex justify-end mb-6">
          <NotificationBell />
        </div>
        {children}
      </main>
    </div>
  );
}
