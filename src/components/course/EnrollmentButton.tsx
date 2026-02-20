"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock, CheckCircle, UserPlus } from "lucide-react";

interface EnrollmentButtonProps {
  courseId: string;
  price: number;
  isEnrolled: boolean;
}

export function EnrollmentButton({
  courseId,
  price,
  isEnrolled,
}: EnrollmentButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (status === "loading") {
    return <div className="w-full bg-slate-600 h-12 animate-pulse rounded-lg" />;
  }

  if (!session) {
    return (
      <a
        href="/register"
        className="flex items-center justify-center gap-2 w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-lg font-medium transition-colors"
      >
        <UserPlus className="w-4 h-4" />
        Sign Up to Enroll
      </a>
    );
  }

  if (isEnrolled) {
    return (
      <button
        onClick={() => router.push(`/courses/${courseId}/chapters/${courseId}`)}
        className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium transition-colors"
      >
        Go to Course
      </button>
    );
  }

  if (price === 0) {
    return (
      <button
        onClick={async () => {
          setLoading(true);
          try {
            const res = await fetch("/api/enroll", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ courseId }),
            });
            if (res.ok) {
              router.refresh();
            }
          } finally {
            setLoading(false);
          }
        }}
        disabled={loading}
        className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white py-3 rounded-lg font-medium transition-colors"
      >
        {loading ? "Enrolling..." : "Enroll for Free"}
      </button>
    );
  }

  return (
    <button
      onClick={async () => {
        setLoading(true);
        try {
          const res = await fetch("/api/payment/initialize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ courseId }),
          });
          const data = await res.json();
          if (data.url) {
            window.location.href = data.url;
          }
        } finally {
          setLoading(false);
        }
      }}
      disabled={loading}
      className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white py-3 rounded-lg font-medium transition-colors"
    >
      {loading ? "Processing..." : `Buy for $${price}`}
    </button>
  );
}
