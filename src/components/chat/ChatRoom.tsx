"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Send, Image as ImageIcon, X, Users, MessageSquare } from "lucide-react";

interface Message {
  id: string;
  content: string;
  imageUrl?: string;
  sender: {
    id: string;
    name: string;
    username: string;
    image?: string;
  };
  createdAt: string;
}

interface ChatRoom {
  id: string;
  name?: string;
  type: string;
  course?: { id: string; title: string };
  _count?: { participants: number; messages: number };
}

export function ChatRoom({ roomId, onClose }: { roomId: string; onClose?: () => void }) {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chat/rooms/${roomId}/messages`);
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

  useEffect(() => {
    if (status === "authenticated" && roomId) {
      fetchMessages();
      // Poll for new messages every 5 seconds
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [status, roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/chat/rooms/${roomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });

      if (res.ok) {
        const message = await res.json();
        setMessages([...messages, message]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Upload to existing upload endpoint
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        // Send message with image
        await fetch(`/api/chat/rooms/${roomId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: "", imageUrl: data.url }),
        });
        fetchMessages();
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400">Please log in to chat</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-800 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          <span className="text-white font-medium">Chat</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center text-slate-400">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-slate-400">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.sender.id === (session.user as any).id ? "flex-row-reverse" : ""
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
                {msg.sender.image ? (
                  <img src={msg.sender.image} alt="" className="w-8 h-8 rounded-full" />
                ) : (
                  <span className="text-xs text-white">
                    {msg.sender.name?.[0] || msg.sender.username?.[0] || "?"}
                  </span>
                )}
              </div>
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  msg.sender.id === (session.user as any).id
                    ? "bg-indigo-500 text-white"
                    : "bg-slate-700 text-white"
                }`}
              >
                {msg.imageUrl && (
                  <img src={msg.imageUrl} alt="" className="rounded mb-2 max-w-full" />
                )}
                {msg.content && <p className="text-sm">{msg.content}</p>}
                <p className="text-xs opacity-60 mt-1">
                  {msg.sender.name || msg.sender.username}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

export function ChatList() {
  const { data: session, status } = useSession();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetchRooms();
    }
  }, [status]);

  const fetchRooms = async () => {
    try {
      const res = await fetch("/api/chat/rooms");
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
        if (data.length > 0) {
          // Auto-join global room
          const globalRoom = data.find((r: ChatRoom) => r.type === "GLOBAL");
          if (globalRoom) {
            joinRoom(globalRoom.id);
            setSelectedRoom(globalRoom.id);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async (roomId: string) => {
    try {
      await fetch("/api/chat/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId }),
      });
    } catch (error) {
      console.error("Error joining room:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading chats...</div>
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Please log in to access chat</div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-[600px]">
      {/* Room List */}
      <div className="w-64 bg-slate-800 rounded-lg p-4">
        <h3 className="text-white font-medium mb-4">Chat Rooms</h3>
        <div className="space-y-2">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => {
                setSelectedRoom(room.id);
                joinRoom(room.id);
              }}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                selectedRoom === room.id
                  ? "bg-indigo-500 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              <p className="font-medium">
                {room.name || room.course?.title || "Chat"}
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs opacity-70">
                <Users className="w-3 h-3" />
                {room._count?.participants || 0}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1">
        {selectedRoom ? (
          <ChatRoom roomId={selectedRoom} />
        ) : (
          <div className="flex items-center justify-center h-full bg-slate-800 rounded-lg">
            <div className="text-slate-400">Select a chat room to start</div>
          </div>
        )}
      </div>
    </div>
  );
}
