"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, CreditCard, DollarSign } from "lucide-react";

interface PaymentButton {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  currency: string;
  buttonText: string;
  buttonColor: string;
  redirectUrl: string | null;
  isActive: boolean;
}

export default function AdminPaymentsPage() {
  const [buttons, setButtons] = useState<PaymentButton[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    amount: "",
    currency: "NGN",
    buttonText: "Pay Now",
    buttonColor: "#6366f1",
    redirectUrl: "",
    isActive: true,
  });

  useEffect(() => {
    fetchButtons();
  }, []);

  const fetchButtons = async () => {
    try {
      const res = await fetch("/api/admin/payment-buttons");
      const data = await res.json();
      setButtons(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const endpoint = editingId 
      ? `/api/admin/payment-buttons?id=${editingId}`
      : "/api/admin/payment-buttons";
    
    const method = editingId ? "PATCH" : "POST";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchButtons();
        resetForm();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleEdit = (button: PaymentButton) => {
    setFormData({
      name: button.name,
      description: button.description || "",
      amount: button.amount.toString(),
      currency: button.currency,
      buttonText: button.buttonText,
      buttonColor: button.buttonColor,
      redirectUrl: button.redirectUrl || "",
      isActive: button.isActive,
    });
    setEditingId(button.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    
    try {
      await fetch(`/api/admin/payment-buttons?id=${id}`, { method: "DELETE" });
      fetchButtons();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await fetch("/api/admin/payment-buttons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      fetchButtons();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      amount: "",
      currency: "NGN",
      buttonText: "Pay Now",
      buttonColor: "#6366f1",
      redirectUrl: "",
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Payment Buttons</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          <Plus className="w-4 h-4" />
          New Payment Button
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingId ? "Edit Payment Button" : "New Payment Button"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Course Registration"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="What is this payment for?"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-2">Amount</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-2">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="NGN">NGN (₦)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-2">Button Text</label>
                <input
                  type="text"
                  value={formData.buttonText}
                  onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-2">Button Color</label>
                <div className="flex gap-4">
                  <input
                    type="color"
                    value={formData.buttonColor}
                    onChange={(e) => setFormData({ ...formData, buttonColor: e.target.value })}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.buttonColor}
                    onChange={(e) => setFormData({ ...formData, buttonColor: e.target.value })}
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-2">Redirect URL (after payment)</label>
                <input
                  type="url"
                  value={formData.redirectUrl}
                  onChange={(e) => setFormData({ ...formData, redirectUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
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

      {/* Preview */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Preview</h2>
        <div className="flex flex-wrap gap-4">
          {buttons.filter(b => b.isActive).map((button) => (
            <button
              key={button.id}
              style={{ backgroundColor: button.buttonColor }}
              className="px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
            >
              {button.buttonText} - {button.currency} {button.amount}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Buttons List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-slate-400 py-8">Loading...</div>
        ) : buttons.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No payment buttons yet</p>
          </div>
        ) : (
          buttons.map((button) => (
            <div key={button.id} className="bg-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-semibold">{button.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        button.isActive ? "bg-green-500/20 text-green-400" : "bg-slate-600 text-slate-400"
                      }`}>
                        {button.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">
                      {button.currency} {button.amount} - {button.buttonText}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(button.id, button.isActive)}
                    className={`p-2 rounded-lg transition-colors ${
                      button.isActive ? "bg-green-500/20 text-green-400" : "bg-slate-700 text-slate-400"
                    }`}
                  >
                    {button.isActive ? "Active" : "Inactive"}
                  </button>
                  <button
                    onClick={() => handleEdit(button)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-slate-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(button.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
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
