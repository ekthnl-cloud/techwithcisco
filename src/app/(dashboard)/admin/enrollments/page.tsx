"use client";

import { useState, useEffect } from "react";
import { Check, X, RefreshCw, BookOpen, DollarSign } from "lucide-react";

interface Enrollment {
  id: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  course: {
    id: string;
    title: string;
    price: number;
  };
}

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "denied">("pending");

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const res = await fetch("/api/admin/enrollments");
      if (res.ok) {
        const data = await res.json();
        setEnrollments(data);
      }
    } catch (error) {
      console.error("Error fetching enrollments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (enrollmentId: string, action: "approve" | "deny") => {
    try {
      const res = await fetch("/api/admin/enrollments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId, action }),
      });
      
      if (res.ok) {
        fetchEnrollments();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const filteredEnrollments = enrollments.filter((e) => e.status === filter.toUpperCase());

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Enrollment Requests</h1>
        <button
          onClick={fetchEnrollments}
          className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter("pending")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === "pending" ? "bg-yellow-500 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
          }`}
        >
          Pending ({enrollments.filter((e) => e.status === "PENDING").length})
        </button>
        <button
          onClick={() => setFilter("approved")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === "approved" ? "bg-green-500 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
          }`}
        >
          Approved
        </button>
        <button
          onClick={() => setFilter("denied")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === "denied" ? "bg-red-500 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
          }`}
        >
          Denied
        </button>
      </div>

      {/* Enrollments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-slate-400 py-8">Loading...</div>
        ) : filteredEnrollments.length === 0 ? (
          <div className="text-center text-slate-400 py-8">No enrollment requests</div>
        ) : (
          filteredEnrollments.map((enrollment) => (
            <div key={enrollment.id} className="bg-slate-800 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{enrollment.course.title}</h3>
                    <p className="text-slate-400 text-sm mt-1">
                      Requested by: {enrollment.user.name || enrollment.user.email}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-slate-400 text-sm">
                        <DollarSign className="w-4 h-4" />
                        {enrollment.course.price === 0 ? "Free" : `$${enrollment.course.price}`}
                      </span>
                      <span className="text-slate-500 text-sm">
                        {new Date(enrollment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                {enrollment.status === "PENDING" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAction(enrollment.id, "approve")}
                      className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(enrollment.id, "deny")}
                      className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Deny
                    </button>
                  </div>
                )}
                
                {enrollment.status === "APPROVED" && (
                  <span className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 text-sm">
                    Approved
                  </span>
                )}
                
                {enrollment.status === "DENIED" && (
                  <span className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 text-sm">
                    Denied
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
