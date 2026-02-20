"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Code, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
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
              Welcome <span className="text-[#00d4ff]">Back</span>
            </h1>
            <p className="text-[#5a6a85] mt-2">Sign in to continue learning</p>
          </div>

          {error && (
            <div className="bg-[#ff4757]/10 border border-[#ff4757]/30 text-[#ff4757] px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#00d4ff] to-[#00a8cc] hover:from-[#00a8cc] hover:to-[#00d4ff] text-white py-3 rounded-lg font-medium transition-all hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-[#5a6a85] mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#00d4ff] hover:text-[#00ff88] transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
