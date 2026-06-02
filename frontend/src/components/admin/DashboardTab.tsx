import React from "react";
import {
  BrainCircuit,
  Database,
  Download,
  GraduationCap,
  Video,
} from "lucide-react";
import type {
  AdminDeliveryLog,
  AdminDraft,
  AdminLesson,
  AdminMediaAsset,
  AdminSource,
} from "../../api/admin";
import { formatDate } from "../../utils/format";

type AdminTab =
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

type DashboardTabProps = {
  lessons: AdminLesson[];
  sources: AdminSource[];
  drafts: AdminDraft[];
  mediaAssets: AdminMediaAsset[];
  deliveryLogs: AdminDeliveryLog[];
  setActiveTab: (tab: AdminTab) => void;
  setSelectedLessonIdForQuiz: (id: string) => void;
  setQuizForm: (form: any) => void;
};

export function DashboardTab({
  lessons,
  sources,
  drafts,
  mediaAssets,
  deliveryLogs,
  setActiveTab,
}: DashboardTabProps) {
  const publishedLessons = lessons.filter(
    (lesson) => lesson.reviewStatus === "APPROVED" || lesson.isActive
  );
  const draftLessons = lessons.length - publishedLessons.length;
  const pendingDrafts = drafts.filter((draft) =>
    ["DRAFT", "PENDING", "REVIEWING"].includes((draft.status || "").toUpperCase())
  );
  const failedLogs = deliveryLogs.filter((log) =>
    ["FAILED", "ERROR"].includes((log.status || "").toUpperCase())
  );
  const completionRate = lessons.length
    ? Math.round((publishedLessons.length / lessons.length) * 100)
    : 0;
  const recentLessons = [...lessons]
    .sort((a, b) => {
      const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 4);
  const chartData = [
    { label: "Nguồn", value: sources.length },
    { label: "Bản nháp", value: drafts.length },
    { label: "Bài học", value: lessons.length },
    { label: "Media", value: mediaAssets.length },
    { label: "Nhật ký", value: deliveryLogs.length },
  ];
  const maxChartValue = Math.max(...chartData.map((item) => item.value), 1);

  function handleExportCsv() {
    const rows = [
      ["metric", "value"],
      ["lessons", String(lessons.length)],
      ["published_lessons", String(publishedLessons.length)],
      ["draft_lessons", String(draftLessons)],
      ["sources", String(sources.length)],
      ["ai_drafts", String(drafts.length)],
      ["media_assets", String(mediaAssets.length)],
      ["delivery_logs", String(deliveryLogs.length)],
      ["failed_delivery_logs", String(failedLogs.length)],
    ];
    const csv = rows.map((row) => row.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "lexi-admin-dashboard.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const mentorTargetTab: AdminTab = pendingDrafts.length
    ? "aiDrafts"
    : sources.length
      ? "aiDrafts"
      : "sources";
  const mentorText = pendingDrafts.length
    ? `Có ${pendingDrafts.length} bản nháp AI đang chờ duyệt. Nên duyệt bản nháp trước khi tạo bài học mới.`
    : sources.length
      ? `Đã có ${sources.length} nguồn pháp lý. Bạn có thể tạo bản nháp AI mới từ nguồn hiện có.`
      : "Chưa có nguồn pháp lý. Hãy tạo nguồn đầu tiên để bắt đầu quy trình sáng tạo nội dung bằng AI.";

  return (
    <>
      <div className="lexi-cms-subheader">
        <div className="lexi-cms-subheader-left">
          <h1>Tổng quan hệ thống</h1>
          <div className="lexi-cms-update-time">
            Dữ liệu lấy từ API admin hiện tại
          </div>
        </div>
        <button className="lexi-cms-export-btn" onClick={handleExportCsv} type="button">
          <Download size={14} /> Xuất báo cáo CSV
        </button>
      </div>

      <div className="lexi-cms-stats-grid">
        <div className="lexi-cms-stat-card">
          <div className="lexi-cms-stat-info">
            <span className="lexi-cms-stat-title">Bài học</span>
            <strong className="lexi-cms-stat-value">{lessons.length}</strong>
            <span className="lexi-cms-stat-trend">{publishedLessons.length} đã xuất bản</span>
          </div>
          <div className="lexi-cms-stat-icon-wrapper">
            <GraduationCap size={20} />
          </div>
        </div>

        <div className="lexi-cms-stat-card featured">
          <div className="lexi-cms-stat-info">
            <span className="lexi-cms-stat-title" style={{ color: "#d97706" }}>Nguồn pháp lý</span>
            <strong className="lexi-cms-stat-value" style={{ color: "#92400e" }}>{sources.length}</strong>
            <span className="lexi-cms-stat-trend" style={{ color: "#d97706" }}>{drafts.length} bản nháp AI</span>
          </div>
          <div className="lexi-cms-stat-icon-wrapper">
            <Database size={20} />
          </div>
        </div>

        <div className="lexi-cms-stat-card">
          <div className="lexi-cms-stat-info">
            <span className="lexi-cms-stat-title">Tập tin media</span>
            <strong className="lexi-cms-stat-value">{mediaAssets.length}</strong>
            <span className="lexi-cms-stat-trend">{deliveryLogs.length} lịch sử gửi</span>
          </div>
          <div className="lexi-cms-stat-icon-wrapper">
            <Video size={20} />
          </div>
        </div>

        <div className="lexi-cms-stat-card" style={{ flexDirection: "column", justifyContent: "flex-start", alignItems: "stretch", gap: "0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
            <div className="lexi-cms-stat-info">
              <span className="lexi-cms-stat-title">Tỷ lệ xuất bản</span>
              <strong className="lexi-cms-stat-value">{completionRate}%</strong>
            </div>
            <span className={`lexi-cms-stat-trend ${failedLogs.length ? "" : "neutral"}`}>
              {failedLogs.length} log lỗi
            </span>
          </div>
          <div className="lexi-cms-stat-progress-track">
            <span className="lexi-cms-stat-progress-fill" style={{ width: `${completionRate}%` }}></span>
          </div>
        </div>
      </div>

      <div className="lexi-cms-main-grid">
        <div className="lexi-cms-panel-card">
          <div className="lexi-cms-panel-header">
            <h2>Phân bổ nội dung</h2>
            <select className="lexi-cms-panel-select" defaultValue="current">
              <option value="current">Dữ liệu hiện tại</option>
            </select>
          </div>
          <div className="lexi-cms-chart-box">
            {chartData.map((item, index) => (
              <div className="lexi-cms-chart-column-wrapper" key={item.label}>
                <span
                  className={`lexi-cms-chart-bar ${index === 2 ? "highlighted" : ""}`}
                  style={{ height: `${Math.max((item.value / maxChartValue) * 200, item.value ? 24 : 4)}px` }}
                  data-value={String(item.value)}
                ></span>
                <span className="lexi-cms-chart-label">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lexi-cms-panel-card">
          <div className="lexi-cms-panel-header">
            <h2>Bài học mới cập nhật</h2>
            <a href="#lessons" className="lexi-cms-link-all" onClick={(event) => { event.preventDefault(); setActiveTab("lessons"); }}>
              Xem tất cả
            </a>
          </div>
          <div className="lexi-cms-lessons-stack">
            {recentLessons.map((lesson, index) => (
              <div className="lexi-cms-lesson-row" key={lesson.id}>
                <span className="lexi-cms-lesson-num">{String(index + 1).padStart(2, "0")}</span>
                <div className="lexi-cms-lesson-details">
                  <span className="lexi-cms-lesson-name">{lesson.title}</span>
                  <span className="lexi-cms-lesson-stats">
                    {lesson.module?.title || lesson.category?.title || "Chưa gán module"} - {lesson.updatedAt ? formatDate(lesson.updatedAt) : "Chưa có ngày cập nhật"}
                  </span>
                </div>
                <span className="lexi-cms-lesson-badge">
                  {lesson.reviewStatus === "APPROVED" || lesson.isActive ? "Hoạt động" : "Bản nháp"}
                </span>
              </div>
            ))}
            {!recentLessons.length && (
              <p className="muted">Chưa có bài học nào trong hệ thống.</p>
            )}
          </div>
        </div>
      </div>

      <div className="lexi-cms-ai-mentor">
        <div className="lexi-cms-ai-icon-wrapper">
          <BrainCircuit size={22} />
        </div>
        <div className="lexi-cms-ai-content">
          <h3>Gợi ý từ AI Mentor</h3>
          <p className="lexi-cms-ai-desc">{mentorText}</p>
        </div>
        <div className="lexi-cms-ai-actions">
          <button className="lexi-cms-btn-ai-action" onClick={() => setActiveTab(mentorTargetTab)} type="button">
            {mentorTargetTab === "sources" ? "Thêm nguồn pháp lý" : "Mở trình tạo nội dung AI"}
          </button>
          <button className="lexi-cms-btn-ai-ignore" onClick={() => setActiveTab("logs")} type="button">
            Xem logs
          </button>
        </div>
      </div>
    </>
  );
}

export default DashboardTab;
