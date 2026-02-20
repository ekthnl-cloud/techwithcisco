"use client";

import { useState, useEffect } from "react";
import { Check, X, Trash2, LogOut, UserCheck, UserX, RefreshCw } from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isApproved: boolean;
  isActive: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "suspended">("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (userId: string, action: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      
      if (res.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (filter === "pending") return !user.isApproved;
    if (filter === "approved") return user.isApproved && user.isActive;
    if (filter === "suspended") return !user.isActive;
    return true;
  });

  const pendingCount = users.filter((u) => !u.isApproved).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Users</h1>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === "all" ? "bg-indigo-500 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
          }`}
        >
          All ({users.length})
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === "pending" ? "bg-yellow-500 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
          }`}
        >
          Pending ({pendingCount})
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
          onClick={() => setFilter("suspended")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === "suspended" ? "bg-red-500 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
          }`}
        >
          Suspended
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-slate-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left p-4 text-slate-400 font-medium">User</th>
              <th className="text-left p-4 text-slate-400 font-medium">Role</th>
              <th className="text-left p-4 text-slate-400 font-medium">Status</th>
              <th className="text-left p-4 text-slate-400 font-medium">Joined</th>
              <th className="text-right p-4 text-slate-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-slate-400">Loading...</td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-slate-400">No users found</td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-slate-700 last:border-0">
                  <td className="p-4">
                    <div>
                      <p className="text-white font-medium">{user.name || "N/A"}</p>
                      <p className="text-slate-400 text-sm">{user.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.role === "ADMIN" ? "bg-indigo-500/20 text-indigo-400" : "bg-slate-600 text-slate-400"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.isApproved ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {user.isApproved ? "Approved" : "Pending"}
                      </span>
                      {!user.isActive && (
                        <span className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400">
                          Suspended
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-slate-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      {!user.isApproved && (
                        <>
                          <button
                            onClick={() => handleAction(user.id, "approve")}
                            className="p-2 hover:bg-green-500/20 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <Check className="w-4 h-4 text-green-400" />
                          </button>
                          <button
                            onClick={() => handleAction(user.id, "deny")}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Deny"
                          >
                            <X className="w-4 h-4 text-red-400" />
                          </button>
                        </>
                      )}
                      {user.isApproved && user.isActive && (
                        <button
                          onClick={() => handleAction(user.id, "suspend")}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Suspend"
                        >
                          <UserX className="w-4 h-4 text-yellow-400" />
                        </button>
                      )}
                      {!user.isActive && (
                        <button
                          onClick={() => handleAction(user.id, "activate")}
                          className="p-2 hover:bg-green-500/20 rounded-lg transition-colors"
                          title="Activate"
                        >
                          <UserCheck className="w-4 h-4 text-green-400" />
                        </button>
                      )}
                      <button
                        onClick={() => handleAction(user.id, "logout")}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                        title="Force Logout"
                      >
                        <LogOut className="w-4 h-4 text-slate-400" />
                      </button>
                      {user.role !== "ADMIN" && (
                        <button
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this user?")) {
                              handleAction(user.id, "delete");
                            }
                          }}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
