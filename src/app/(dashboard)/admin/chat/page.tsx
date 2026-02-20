"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Trash2, Ban, Ban as BlockIcon, Users } from "lucide-react";

interface Message {
  id: string;
  content: string;
  imageUrl?: string;
  isDeleted: boolean;
  isBlocked: boolean;
  createdAt: string;
  sender: { id: string; name: string; email: string; username: string };
  chatRoom: { id: string; name: string; type: string };
}

export default function AdminChatModerationPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<string>("");

  useEffect(() => {
    fetchMessages();
  }, [selectedRoom]);

  const fetchMessages = async () => {
    try {
      const url = selectedRoom
        ? `/api/admin/chat?roomId=${selectedRoom}`
        : "/api/admin/chat";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      await fetch("/api/admin/chat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_message", messageId }),
      });
      fetchMessages();
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const blockMessage = async (messageId: string) => {
    try {
      await fetch("/api/admin/chat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "block_message", messageId }),
      });
      fetchMessages();
    } catch (error) {
      console.error("Error blocking message:", error);
    }
  };

  const blockUser = async (userId: string) => {
    if (!confirm("Are you sure you want to block this user?")) return;
    try {
      await fetch("/api/admin/chat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "block_user", userId }),
      });
      fetchMessages();
    } catch (error) {
      console.error("Error blocking user:", error);
    }
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
        <h1 className="text-3xl font-bold text-white mb-8">Chat Moderation</h1>

        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-medium flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Recent Messages
              </h2>
              <span className="text-slate-400 text-sm">{messages.length} messages</span>
            </div>
          </div>

          <div className="divide-y divide-slate-700">
            {messages.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No messages found</div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="p-4 hover:bg-slate-700/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium">
                          {msg.sender.name || msg.sender.username}
                        </span>
                        <span className="text-slate-500 text-sm">
                          @{msg.sender.email}
                        </span>
                        {msg.isDeleted && (
                          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                            Deleted
                          </span>
                        )}
                        {msg.isBlocked && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                            Blocked
                          </span>
                        )}
                      </div>
                      <p className="text-slate-300">{msg.content}</p>
                      {msg.imageUrl && (
                        <img
                          src={msg.imageUrl}
                          alt=""
                          className="mt-2 max-w-xs rounded-lg"
                        />
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span>{msg.chatRoom.name || msg.chatRoom.type}</span>
                        <span>{new Date(msg.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {!msg.isDeleted && (
                        <button
                          onClick={() => deleteMessage(msg.id)}
                          className="p-2 text-slate-400 hover:text-red-400"
                          title="Delete message"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      {!msg.isBlocked && (
                        <button
                          onClick={() => blockMessage(msg.id)}
                          className="p-2 text-slate-400 hover:text-yellow-400"
                          title="Block message"
                        >
                          <BlockIcon className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => blockUser(msg.sender.id)}
                        className="p-2 text-slate-400 hover:text-red-400"
                        title="Block user"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
