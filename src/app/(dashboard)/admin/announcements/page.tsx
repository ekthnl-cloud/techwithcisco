"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, Image, Megaphone } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  imageUrl: string | null;
  linkUrl: string | null;
  isActive: boolean;
  position: number;
  startsAt: string | null;
  endsAt: string | null;
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "BANNER",
    imageUrl: "",
    linkUrl: "",
    isActive: false,
    position: 0,
    startsAt: "",
    endsAt: "",
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("/api/admin/announcements");
      const data = await res.json();
      setAnnouncements(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const endpoint = editingId 
      ? `/api/admin/announcements?id=${editingId}`
      : "/api/admin/announcements";
    
    const method = editingId ? "PATCH" : "POST";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchAnnouncements();
        resetForm();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      imageUrl: announcement.imageUrl || "",
      linkUrl: announcement.linkUrl || "",
      isActive: announcement.isActive,
      position: announcement.position,
      startsAt: announcement.startsAt ? announcement.startsAt.split("T")[0] : "",
      endsAt: announcement.endsAt ? announcement.endsAt.split("T")[0] : "",
    });
    setEditingId(announcement.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    
    try {
      await fetch(`/api/admin/announcements?id=${id}`, { method: "DELETE" });
      fetchAnnouncements();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await fetch("/api/admin/announcements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      fetchAnnouncements();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      type: "BANNER",
      imageUrl: "",
      linkUrl: "",
      isActive: false,
      position: 0,
      startsAt: "",
      endsAt: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Announcements</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          <Plus className="w-4 h-4" />
          New Announcement
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingId ? "Edit Announcement" : "New Announcement"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-2">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                >
                  <option value="BANNER">Banner (Top of page)</option>
                  <option value="POPUP">Popup (Modal)</option>
                  <option value="FLYER">Flyer (Card)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-2">Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-2">Link URL (optional)</label>
                <input
                  type="url"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  placeholder="https://... (where the announcement links to)"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={formData.startsAt}
                    onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-2">End Date</label>
                  <input
                    type="date"
                    value={formData.endsAt}
                    onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isActive" className="text-slate-300">Active</label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg"
                >
                  {editingId ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-slate-400 py-8">Loading...</div>
        ) : announcements.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No announcements yet</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement.id} className="bg-slate-800 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {announcement.imageUrl ? (
                    <img src={announcement.imageUrl} alt="" className="w-20 h-20 object-cover rounded-lg" />
                  ) : (
                    <div className="w-20 h-20 bg-slate-700 rounded-lg flex items-center justify-center">
                      <Image className="w-8 h-8 text-slate-500" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-semibold">{announcement.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        announcement.type === "BANNER" ? "bg-blue-500/20 text-blue-400" :
                        announcement.type === "POPUP" ? "bg-purple-500/20 text-purple-400" :
                        "bg-green-500/20 text-green-400"
                      }`}>
                        {announcement.type}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mt-1 line-clamp-2">{announcement.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-slate-500 text-sm">
                      <span>Position: {announcement.position}</span>
                      {announcement.startsAt && <span>Starts: {new Date(announcement.startsAt).toLocaleDateString()}</span>}
                      {announcement.endsAt && <span>Ends: {new Date(announcement.endsAt).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(announcement.id, announcement.isActive)}
                    className={`p-2 rounded-lg transition-colors ${
                      announcement.isActive ? "bg-green-500/20 text-green-400" : "bg-slate-700 text-slate-400"
                    }`}
                    title={announcement.isActive ? "Deactivate" : "Activate"}
                  >
                    {announcement.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleEdit(announcement)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4 text-slate-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
