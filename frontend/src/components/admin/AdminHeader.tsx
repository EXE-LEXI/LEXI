import React from "react";
import { Bell, History, Search } from "lucide-react";
import type { AuthResponse } from "../../types/auth";

type AdminHeaderProps = {
  activeTab: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  session?: AuthResponse | null;
  onNavigate?: (path: string) => void;
};

const placeholders: Record<string, string> = {
  users: "Tìm kiếm người dùng...",
  feedback: "Tìm phản hồi, trang, nội dung...",
  modules: "Tìm khóa học...",
  lessons: "Tìm bài học...",
  quizzes: "Tìm bài kiểm tra...",
  sources: "Tìm nguồn pháp lý...",
  aiDrafts: "Tìm bản nháp AI...",
  media: "Tìm tài liệu hoặc media...",
  logs: "Tìm báo cáo...",
};

export function AdminHeader({
  activeTab,
  searchQuery,
  setSearchQuery,
  session,
  onNavigate,
}: AdminHeaderProps) {
  const adminFullName = session?.user?.profile?.fullName || session?.user?.email || "Admin";
  const initials = adminFullName
    .split(" ")
    .map((name: string) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="lexi-cms-header">
      <div className="lexi-cms-search-box">
        <Search className="lexi-cms-search-icon" size={16} />
        <input
          type="text"
          placeholder={placeholders[activeTab] ?? "Tìm kiếm..."}
          className="lexi-cms-search-input"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </div>

      <div className="lexi-cms-header-right">
        <button
          className="lexi-cms-icon-btn"
          type="button"
          title="Chưa có thông báo quản trị mới"
          aria-label="Thông báo quản trị"
        >
          <Bell size={20} />
        </button>
        <button
          className="lexi-cms-icon-btn"
          onClick={() => onNavigate?.("/dashboard")}
          title="Trở lại giao diện học viên"
          type="button"
        >
          <History size={20} />
        </button>
        <div className="lexi-cms-avatar" title={adminFullName}>
          {initials}
        </div>
      </div>
    </header>
  );
}
