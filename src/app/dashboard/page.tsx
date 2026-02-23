import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#0a0e17]">
      <div className="bg-[#111827] border-b border-[#2d3748] p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-[#5a6a85]">{session.user?.email}</span>
            <span className="px-3 py-1 bg-[#00d4ff]/20 text-[#00d4ff] rounded-full text-sm">
              {(session.user as any)?.role}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Welcome back!</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#111827] border border-[#2d3748] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Courses</h3>
            <p className="text-[#5a6a85]">Browse and enroll in courses</p>
          </div>
          
          <div className="bg-[#111827] border border-[#2d3748] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">My Learning</h3>
            <p className="text-[#5a6a85]">Track your progress</p>
          </div>
          
          <div className="bg-[#111827] border border-[#2d3748] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Profile</h3>
            <p className="text-[#5a6a85]">Manage your account</p>
          </div>
        </div>
      </div>
    </div>
  );
}
