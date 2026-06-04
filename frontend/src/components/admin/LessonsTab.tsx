import React, { useMemo, useState } from "react";
import { Compass, Edit, FileText, Plus, Sliders } from "lucide-react";
import type { AdminLesson } from "../../api/admin";
import { formatDate } from "../../utils/format";

type LessonsTabProps = {
  lessons: AdminLesson[];
  searchQuery: string;
  onEditLesson: (lesson: AdminLesson) => void;
  onCreateLesson: () => void;
  onManageQuiz: (lessonId: string) => void;
};

function isPublished(lesson: AdminLesson) {
  return lesson.reviewStatus === "PUBLISHED" && lesson.isActive;
}

function getReviewStatusLabel(status?: string) {
  switch (status) {
    case "PUBLISHED":
      return "Đã publish";
    case "IN_REVIEW":
      return "Chờ duyệt";
    case "ARCHIVED":
      return "Lưu trữ";
    default:
      return "Bản nháp";
  }
}

export function LessonsTab({
  lessons,
  searchQuery,
  onEditLesson,
  onCreateLesson,
  onManageQuiz,
}: LessonsTabProps) {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const uniqueCategories = useMemo(
    () =>
      Array.from(
        new Set(
          lessons
            .map((lesson) => lesson.module?.category?.title || lesson.category?.title || lesson.module?.title)
            .filter(Boolean)
        )
      ) as string[],
    [lessons]
  );

  const filteredLessons = lessons.filter((lesson) => {
    const keyword = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !keyword ||
      lesson.title.toLowerCase().includes(keyword) ||
      (lesson.module?.title || "").toLowerCase().includes(keyword) ||
      (lesson.module?.category?.title || lesson.category?.title || "").toLowerCase().includes(keyword);
    if (!matchesSearch) return false;

    if (categoryFilter !== "all") {
      const category = lesson.module?.category?.title || lesson.category?.title || lesson.module?.title || "";
      if (category !== categoryFilter) return false;
    }

    if (statusFilter === "published" && !isPublished(lesson)) return false;
    if (statusFilter === "draft" && isPublished(lesson)) return false;

    return true;
  });

  return (
    <div className="lexi-cms-panel-card" style={{ background: "transparent", border: "none", boxShadow: "none", padding: 0 }}>
      <div className="lexi-cms-lessons-header-row">
        <div>
          <h1 className="lexi-cms-lessons-title">Bài học</h1>
          <p className="lexi-cms-lessons-desc">
            Quản lý bài học, nội dung, metadata nguồn pháp lý và trạng thái hiển thị.
          </p>
        </div>
        <button className="lexi-cms-btn-create-course" onClick={onCreateLesson}>
          <Plus size={16} />
          <span>Tạo bài học mới</span>
        </button>
      </div>

      <div className="lexi-cms-lessons-filters">
        <div className="lexi-cms-filter-select-wrapper">
          <Sliders size={14} className="lexi-cms-filter-icon" />
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="lexi-cms-filter-select">
            <option value="all">Tất cả danh mục</option>
            {uniqueCategories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div className="lexi-cms-filter-select-wrapper">
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="lexi-cms-filter-select">
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đã publish</option>
            <option value="draft">Chưa publish</option>
          </select>
        </div>
      </div>

      <div className="lexi-cms-panel-content" style={{ marginTop: 0 }}>
        <div className="lexi-cms-lessons-grid">
          {filteredLessons.map((lesson) => {
            const published = isPublished(lesson);
            const categoryLabel = (lesson.module?.category?.title || lesson.category?.title || lesson.module?.title || "LEXI").toUpperCase();
            
            const qCount = lesson.questionsCount ?? lesson.questions?.length ?? 0;
            const hasVideo = !!lesson.videoUrl?.trim();
            const hasEnoughQuiz = qCount >= 10;
            const isReady = hasVideo && hasEnoughQuiz;

            return (
              <div key={lesson.id} className="lexi-cms-lesson-card">
                <div className="lexi-cms-lesson-card-cover-wrapper">
                  <div className="lexi-cms-lesson-card-cover" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#eef2ff", color: "#334155", fontWeight: 800, padding: "16px", textAlign: "center" }}>
                    {lesson.module?.title || "Chưa gán module"}
                  </div>
                  <span className={`lexi-cms-lesson-card-status-pill ${published ? "published" : "draft"}`}>
                    {published ? "Đang hiển thị" : "Chưa publish"}
                  </span>
                </div>

                <div className="lexi-cms-lesson-card-body">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span className="lexi-cms-lesson-card-category">{categoryLabel}</span>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>
                      {qCount} câu hỏi
                    </span>
                  </div>
                  <h3 className="lexi-cms-lesson-card-title" title={lesson.title}>{lesson.title}</h3>
                  <p className="lexi-cms-lesson-card-desc" style={{ marginBottom: "12px" }}>
                    {lesson.module?.title || "Chưa gán module"} - {getReviewStatusLabel(lesson.reviewStatus)}
                  </p>

                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "4px" }}>
                    {isReady ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "10.5px", fontWeight: 700, padding: "2px 8px", borderRadius: "99px", background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0" }}>
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e" }}></span>
                        Sẵn sàng
                      </span>
                    ) : (
                      <>
                        {!hasVideo && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "10.5px", fontWeight: 700, padding: "2px 8px", borderRadius: "99px", background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5" }}>
                            ⚠️ Thiếu video
                          </span>
                        )}
                        {!hasEnoughQuiz && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "10.5px", fontWeight: 700, padding: "2px 8px", borderRadius: "99px", background: "#fef3c7", color: "#d97706", border: "1px solid #fde68a" }}>
                            ⚠️ Thiếu quiz ({qCount}/10)
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="lexi-cms-lesson-card-footer">
                  <div className="lexi-cms-lesson-card-meta">
                    <span className="lexi-cms-meta-item">
                      <Compass size={14} />
                      <span>{lesson.updatedAt ? formatDate(lesson.updatedAt) : "Chưa cập nhật"}</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button className="lexi-cms-lesson-card-btn-edit" onClick={() => onManageQuiz(lesson.id)} title="Thêm quiz cho bài học" style={{ position: "static", transform: "none" }}>
                      <FileText size={14} />
                    </button>
                    <button className="lexi-cms-lesson-card-btn-edit" onClick={() => onEditLesson(lesson)} title="Chỉnh sửa bài học">
                      <Edit size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {!filteredLessons.length && (
          <div style={{ textAlign: "center", color: "#94a3b8", padding: "60px 20px", background: "#ffffff", borderRadius: "16px", border: "1px dashed #cbd5e1" }}>
            <Compass size={40} style={{ color: "#cbd5e1", marginBottom: "12px" }} />
            <p style={{ fontWeight: 600, fontSize: "14px" }}>Chưa có bài học phù hợp.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default LessonsTab;
