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
  users: "Tim kiem nguoi dung...",
  feedback: "Tim feedback, trang, noi dung...",
  lessons: "Tim khoa hoc...",
  quizzes: "Tim bai kiem tra...",
  sources: "Tim nguon phap ly...",
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
          placeholder={placeholders[activeTab] ?? "Tim kiem..."}
          className="lexi-cms-search-input"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </div>

      <div className="lexi-cms-header-right">
        <button className="lexi-cms-icon-btn" type="button" title="Chua co thong bao quan tri moi" aria-label="Thong bao quan tri">
          <Bell size={20} />
        </button>
        <button
          className="lexi-cms-icon-btn"
          onClick={() => {
            if (onNavigate) onNavigate("/dashboard");
          }}
          title="Tro lai giao dien hoc vien"
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
