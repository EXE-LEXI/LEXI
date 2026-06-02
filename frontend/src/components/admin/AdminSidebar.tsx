import React from "react";
import {
  BarChart3,
  BrainCircuit,
  Compass,
  FileText,
  Gift,
  HelpCircle,
  Layers,
  LayoutDashboard,
  LogOut,
  MessageSquareWarning,
  Scale,
  Settings,
  Users,
  Video,
} from "lucide-react";

type AdminTabType =
  | "dashboard"
  | "modules"
  | "lessons"
  | "quizzes"
  | "users"
  | "media"
  | "logs"
  | "settings"
  | "sources"
  | "aiDrafts"
  | "feedback"
  | "vouchers";

type AdminSidebarProps = {
  activeTab: AdminTabType;
  setActiveTab: (tab: AdminTabType) => void;
  onLogout?: () => void;
};

export function AdminSidebar({ activeTab, setActiveTab, onLogout }: AdminSidebarProps) {
  return (
    <aside className="lexi-cms-sidebar">
      <div className="lexi-cms-logo-block">
        <span className="lexi-cms-logo">LEXI CMS</span>
        <span className="lexi-cms-subtitle">Hệ thống quản trị</span>
      </div>

      <nav className="lexi-cms-menu">
        <button
          className={`lexi-cms-menu-btn ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
          type="button"
        >
          <LayoutDashboard size={18} />
          <span>Bảng điều khiển</span>
        </button>

        <button
          className={`lexi-cms-menu-btn ${activeTab === "modules" ? "active" : ""}`}
          onClick={() => setActiveTab("modules")}
          type="button"
        >
          <Layers size={18} />
          <span>Khóa học</span>
        </button>

        <button
          className={`lexi-cms-menu-btn ${activeTab === "lessons" ? "active" : ""}`}
          onClick={() => setActiveTab("lessons")}
          type="button"
        >
          <Compass size={18} />
          <span>Bài học</span>
        </button>

        <button
          className={`lexi-cms-menu-btn ${activeTab === "quizzes" ? "active" : ""}`}
          onClick={() => setActiveTab("quizzes")}
          type="button"
        >
          <FileText size={18} />
          <span>Bài kiểm tra</span>
        </button>

        <button
          className={`lexi-cms-menu-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
          type="button"
        >
          <Users size={18} />
          <span>Người dùng</span>
        </button>

        <button
          className={`lexi-cms-menu-btn ${activeTab === "feedback" ? "active" : ""}`}
          onClick={() => setActiveTab("feedback")}
          type="button"
        >
          <MessageSquareWarning size={18} />
          <span>Phản hồi & Góp ý</span>
        </button>

        <button
          className={`lexi-cms-menu-btn ${activeTab === "vouchers" ? "active" : ""}`}
          onClick={() => setActiveTab("vouchers")}
          type="button"
        >
          <Gift size={18} />
          <span>Mã quà tặng</span>
        </button>

        <button
          className={`lexi-cms-menu-btn ${activeTab === "media" ? "active" : ""}`}
          onClick={() => setActiveTab("media")}
          type="button"
        >
          <Video size={18} />
          <span>Tài liệu & Media</span>
        </button>

        <button
          className={`lexi-cms-menu-btn ${activeTab === "sources" ? "active" : ""}`}
          onClick={() => setActiveTab("sources")}
          type="button"
        >
          <Scale size={18} />
          <span>Nguồn pháp lý</span>
        </button>

        <button
          className={`lexi-cms-menu-btn ${activeTab === "aiDrafts" ? "active" : ""}`}
          onClick={() => setActiveTab("aiDrafts")}
          type="button"
        >
          <BrainCircuit size={18} />
          <span>Trình tạo nội dung AI</span>
        </button>

        <button
          className={`lexi-cms-menu-btn ${activeTab === "logs" ? "active" : ""}`}
          onClick={() => setActiveTab("logs")}
          type="button"
        >
          <BarChart3 size={18} />
          <span>Báo cáo</span>
        </button>

        <button
          className={`lexi-cms-menu-btn ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
          type="button"
        >
          <Settings size={18} />
          <span>Cài đặt</span>
        </button>
      </nav>

      <div className="lexi-cms-sidebar-footer">
        <button className="lexi-cms-btn-create" onClick={() => setActiveTab("modules")} type="button">
          Tạo khóa học mới
        </button>

        <button className="lexi-cms-menu-btn" style={{ padding: "8px 16px" }} onClick={() => setActiveTab("feedback")} type="button">
          <HelpCircle size={16} />
          <span>Trợ giúp</span>
        </button>

        {onLogout && (
          <button className="lexi-cms-menu-btn" style={{ padding: "8px 16px", color: "#ef4444" }} onClick={onLogout} type="button">
            <LogOut size={16} />
            <span>Đăng xuất</span>
          </button>
        )}
      </div>
    </aside>
  );
}
