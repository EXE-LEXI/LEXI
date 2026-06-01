import React, { useEffect, useMemo, useState } from "react";
import {
  Award,
  Bell,
  Calendar,
  Check,
  CheckSquare,
  Flame,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  dismissNotification,
  getNotificationInbox,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationInboxItem,
} from "../api/notifications";
import type { AuthResponse } from "../types/auth";

type NotificationCenterPageProps = {
  session: AuthResponse | null;
  onNavigate: (path: string) => void;
};

function formatTime(value: string | null) {
  if (!value) {
    return "Chưa gửi";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export const NotificationCenterPage: React.FC<NotificationCenterPageProps> = ({
  session,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<"all" | "study" | "review" | "system">("all");
  const [notifications, setNotifications] = useState<NotificationInboxItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadNotifications(token: string) {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getNotificationInbox(token, { page: 1, limit: 50 });
      setNotifications(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải thông báo");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!session?.accessToken) {
      return;
    }

    void loadNotifications(session.accessToken);
  }, [session?.accessToken]);

  const handleMarkAllRead = async () => {
    if (!session?.accessToken) {
      return;
    }
    await markAllNotificationsRead(session.accessToken);
    setNotifications((items) =>
      items.map((item) => ({ ...item, isRead: true, readAt: item.readAt ?? new Date().toISOString() }))
    );
  };

  const handleMarkAsRead = async (id: string) => {
    if (!session?.accessToken) {
      return;
    }

    const item = notifications.find((notification) => notification.id === id);
    if (!item || item.isRead) {
      return;
    }

    await markNotificationRead(session.accessToken, id);
    setNotifications((items) =>
      items.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true, readAt: new Date().toISOString() }
          : notification
      )
    );
  };

  const handleDeleteNotification = async (
    id: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    if (!session?.accessToken) {
      return;
    }

    await dismissNotification(session.accessToken, id);
    setNotifications((items) => items.filter((item) => item.id !== id));
  };

  const filteredNotifications = useMemo(() => {
    if (activeTab === "all") return notifications;
    return notifications.filter((notification) => notification.category === activeTab);
  }, [notifications, activeTab]);

  const unreadCount = useMemo(() => {
    return notifications.filter((notification) => !notification.isRead).length;
  }, [notifications]);

  const getNotificationIcon = (type: "study" | "review" | "system") => {
    switch (type) {
      case "study":
        return <Flame size={18} className="icon-study fill-gold stroke-gold" />;
      case "review":
        return <Award size={18} className="icon-review" />;
      case "system":
        return <ShieldAlert size={18} className="icon-system" />;
    }
  };

  return (
    <div className="lexi-notifications-root lexi-animate-fade">
      <div className="lexi-notifications-container">
        <header className="lexi-notifications-header">
          <div className="header-badge">
            <Bell size={16} />
            <span>Thông báo của bạn</span>
          </div>
          <div className="header-title-row">
            <div>
              <h1>Trung Tâm Thông Báo</h1>
              <p>Thông báo được đồng bộ từ hộp thư máy chủ của tài khoản hiện tại.</p>
            </div>
            {unreadCount > 0 && (
              <button className="btn-mark-all-read" onClick={handleMarkAllRead}>
                <CheckSquare size={15} />
                <span>Đánh dấu tất cả đã đọc</span>
              </button>
            )}
          </div>
        </header>

        {isLoading && (
          <div className="notice">
            <RefreshCw size={15} className="animate-spin" />
            <span>Đang đồng bộ thông báo...</span>
          </div>
        )}
        {error && <p className="error-text">{error}</p>}

        <div className="lexi-notifications-tabs">
          <button className={`tab-item ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>
            Tất cả {unreadCount > 0 && <span className="tab-count">{unreadCount}</span>}
          </button>
          <button className={`tab-item ${activeTab === "study" ? "active" : ""}`} onClick={() => setActiveTab("study")}>
            Học tập
          </button>
          <button className={`tab-item ${activeTab === "review" ? "active" : ""}`} onClick={() => setActiveTab("review")}>
            Ôn tập
          </button>
          <button className={`tab-item ${activeTab === "system" ? "active" : ""}`} onClick={() => setActiveTab("system")}>
            Hệ thống
          </button>
        </div>

        <div className="notifications-stack-list">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item-card ${notification.isRead ? "read" : "unread"}`}
              onClick={() => handleMarkAsRead(notification.id)}
            >
              <div className="item-icon-wrapper">
                {getNotificationIcon(notification.category)}
              </div>

              <div className="item-body-content">
                <div className="title-row">
                  <h3>{notification.title}</h3>
                  <div className="meta-time">
                    <Calendar size={12} />
                    <span>{formatTime(notification.deliveredAt ?? notification.createdAt)}</span>
                  </div>
                </div>

                <p className="body-text">{notification.body}</p>

                {notification.ctaPath && notification.ctaText && (
                  <button
                    className="item-cta-btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleMarkAsRead(notification.id);
                      onNavigate(notification.ctaPath!);
                    }}
                  >
                    <span>{notification.ctaText}</span>
                    <Sparkles size={13} style={{ marginLeft: "4px" }} />
                  </button>
                )}
              </div>

              <div className="item-actions">
                {!notification.isRead && (
                  <button
                    className="action-btn-mark"
                    title="Đánh dấu đã đọc"
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleMarkAsRead(notification.id);
                    }}
                  >
                    <Check size={14} />
                  </button>
                )}
                <button
                  className="action-btn-delete"
                  title="Xóa thông báo"
                  onClick={(event) =>
                    void handleDeleteNotification(notification.id, event)
                  }
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          {!isLoading && filteredNotifications.length === 0 && (
            <div className="notifications-empty-state">
              <Bell size={48} style={{ color: "#cbd5e1", marginBottom: "16px" }} />
              <h3>Hộp thư trống</h3>
              <p>Chưa có thông báo nào trong hộp thư của bạn.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenterPage;
