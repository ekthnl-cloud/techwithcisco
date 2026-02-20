"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Users, Check } from "lucide-react";

interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string;
  color: string;
  isDefault: boolean;
}

const AVAILABLE_PERMISSIONS = [
  { key: "manage_users", label: "Manage Users" },
  { key: "manage_courses", label: "Manage Courses" },
  { key: "manage_roles", label: "Manage Roles" },
  { key: "moderate_chat", label: "Moderate Chat" },
  { key: "stream", label: "Live Stream" },
  { key: "view_analytics", label: "View Analytics" },
  { key: "manage_payments", label: "Manage Payments" },
  { key: "teach_course", label: "Teach Course" },
  { key: "edit_courses", label: "Edit Courses" },
  { key: "view_students", label: "View Students" },
  { key: "learn", label: "Learn" },
  { key: "chat", label: "Chat" },
  { key: "view_courses", label: "View Courses" },
];

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
    color: "#6366f1",
    isDefault: false,
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/admin/roles");
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || "",
      permissions: JSON.parse(role.permissions || "[]"),
      color: role.color,
      isDefault: role.isDefault,
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingRole(null);
    setFormData({
      name: "",
      description: "",
      permissions: [],
      color: "#6366f1",
      isDefault: false,
    });
    setShowModal(true);
  };

  const saveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/roles", {
        method: editingRole ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editingRole && { roleId: editingRole.id }),
          ...formData,
        }),
      });

      if (res.ok) {
        fetchRoles();
        setShowModal(false);
      }
    } catch (error) {
      console.error("Error saving role:", error);
    }
  };

  const togglePermission = (permission: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="container-custom py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Role Management</h1>
          <button
            onClick={openCreateModal}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Role
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => (
            <div key={role.id} className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: role.color }}
                  />
                  <h3 className="text-white font-medium">{role.name}</h3>
                  {role.isDefault && (
                    <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded">
                      Default
                    </span>
                  )}
                </div>
                <button
                  onClick={() => openEditModal(role)}
                  className="text-slate-400 hover:text-white"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
              {role.description && (
                <p className="text-slate-400 text-sm mb-3">{role.description}</p>
              )}
              <div className="flex flex-wrap gap-1">
                {JSON.parse(role.permissions || "[]").map((perm: string) => (
                  <span
                    key={perm}
                    className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded"
                  >
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-white mb-4">
                {editingRole ? "Edit Role" : "Create Role"}
              </h2>
              <form onSubmit={saveRole}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-400 text-sm mb-1">Role Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-700 text-white rounded-lg px-4 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-1">Description</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-slate-700 text-white rounded-lg px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-1">Color</label>
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full h-10 bg-slate-700 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Permissions</label>
                    <div className="grid grid-cols-2 gap-2">
                      {AVAILABLE_PERMISSIONS.map((perm) => (
                        <button
                          key={perm.key}
                          type="button"
                          onClick={() => togglePermission(perm.key)}
                          className={`flex items-center gap-2 p-2 rounded-lg text-left text-sm ${
                            formData.permissions.includes(perm.key)
                              ? "bg-indigo-500 text-white"
                              : "bg-slate-700 text-slate-300"
                          }`}
                        >
                          {formData.permissions.includes(perm.key) && (
                            <Check className="w-3 h-3" />
                          )}
                          {perm.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="isDefault" className="text-slate-300 text-sm">
                      Set as default role for new users
                    </label>
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-slate-700 text-white py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 bg-indigo-500 text-white py-2 rounded-lg">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
