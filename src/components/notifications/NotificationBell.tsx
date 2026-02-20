"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Bell, X, MessageSquare, Video, User, AlertCircle } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  showPopup: Notification | null;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refresh: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  showPopup: null,
  markAsRead: () => {},
  markAllAsRead: () => {},
  refresh: () => {},
});

export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPopup, setShowPopup] = useState<Notification | null>(null);
  const [lastNotifId, setLastNotifId] = useState<string>("");

  const fetchNotifications = useCallback(async () => {
    if (status !== "authenticated") return;
    
    try {
      const res = await fetch("/api/notifications?limit=20");
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);

      // Show popup for new notifications
      if (data.notifications?.length > 0) {
        const latest = data.notifications[0];
        if (latest.id !== lastNotifId && !latest.isRead) {
          setLastNotifId(latest.id);
          setShowPopup(latest);
          // Auto-dismiss popup after 5 seconds
          setTimeout(() => setShowPopup(null), 5000);
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, [status, lastNotifId]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchNotifications();
      // Poll every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [status, fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id, action: "mark_read" })
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read", all: true })
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        showPopup,
        markAsRead,
        markAllAsRead,
        refresh: fetchNotifications,
      }}
    >
      {children}
      {showPopup && (
        <NotificationPopup
          notification={showPopup}
          onClose={() => setShowPopup(null)}
          onRead={() => markAsRead(showPopup.id)}
        />
      )}
    </NotificationContext.Provider>
  );
}

function NotificationPopup({
  notification,
  onClose,
  onRead,
}: {
  notification: Notification;
  onClose: () => void;
  onRead: () => void;
}) {
  const getIcon = () => {
    switch (notification.type) {
      case "CHAT_MESSAGE":
        return <MessageSquare className="w-5 h-5 text-blue-400" />;
      case "LIVE_STREAM":
        return <Video className="w-5 h-5 text-red-400" />;
      case "ROLE_CHANGE":
        return <User className="w-5 h-5 text-purple-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">{getIcon()}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">{notification.title}</p>
            <p className="text-sm text-slate-400 mt-1">{notification.message}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={onRead}
            className="text-xs text-indigo-400 hover:text-indigo-300"
          >
            Mark as read
          </button>
        </div>
      </div>
    </div>
  );
}

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, refresh } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between p-3 border-b border-slate-700">
            <h3 className="text-white font-medium">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-slate-400 text-sm text-center">
                No notifications yet
              </p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`p-3 border-b border-slate-700 last:border-0 cursor-pointer hover:bg-slate-700/50 ${
                    !notif.isRead ? "bg-slate-700/30" : ""
                  }`}
                >
                  <p className="text-sm text-white">{notif.title}</p>
                  <p className="text-xs text-slate-400 mt-1">{notif.message}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
