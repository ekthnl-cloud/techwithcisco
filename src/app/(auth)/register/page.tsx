"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Code, User, AtSign, Lock, Mail } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      router.push(`/onboarding?email=${encodeURIComponent(email)}`);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-[#0a0e17]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2234] via-[#0a0e17] to-[#0a0e17]"></div>
      
      <div className="relative w-full max-w-md px-4">
        <div className="bg-[#111827]/80 backdrop-blur-lg border border-[#2d3748] rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#8b5cf6] flex items-center justify-center shadow-[0_0_30px_rgba(0,212,255,0.3)]">
              <Code className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              Join the <span className="text-gradient bg-gradient-to-r from-[#00d4ff] to-[#00ff88]">Community</span>
            </h1>
            <p className="text-[#5a6a85] mt-2">Start your coding journey today</p>
          </div>

          {error && (
            <div className="bg-[#ff4757]/10 border border-[#ff4757]/30 text-[#ff4757] px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[#8b9dc3] mb-2 text-sm">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5a6a85]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#1e293b] border border-[#2d3748] rounded-lg pl-12 pr-4 py-3 text-white placeholder-[#5a6a85] focus:border-[#00d4ff] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.1)] transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[#8b9dc3] mb-2 text-sm">Username</label>
              <div className="relative">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5a6a85]" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, "_"))}
                  placeholder="john_doe"
                  className="w-full bg-[#1e293b] border border-[#2d3748] rounded-lg pl-12 pr-4 py-3 text-white placeholder-[#5a6a85] focus:border-[#00d4ff] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.1)] transition-all"
                  required
                />
              </div>
              <p className="text-[#5a6a85] text-xs mt-1">This will be displayed in chat and your profile</p>
            </div>

            <div>
              <label className="block text-[#8b9dc3] mb-2 text-sm">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5a6a85]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1e293b] border border-[#2d3748] rounded-lg pl-12 pr-4 py-3 text-white placeholder-[#5a6a85] focus:border-[#00d4ff] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.1)] transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[#8b9dc3] mb-2 text-sm">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5a6a85]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1e293b] border border-[#2d3748] rounded-lg pl-12 pr-4 py-3 text-white placeholder-[#5a6a85] focus:border-[#00d4ff] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.1)] transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#00d4ff] to-[#00a8cc] hover:from-[#00a8cc] hover:to-[#00d4ff] text-white py-3 rounded-lg font-medium transition-all hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-[#5a6a85] mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-[#00d4ff] hover:text-[#00ff88] transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
