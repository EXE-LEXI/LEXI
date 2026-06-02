import React, { useState } from "react";
import { Compass, Edit, Plus, Sliders } from "lucide-react";
import type { AdminLesson } from "../../api/admin";
import { formatDate } from "../../utils/format";

type LessonsTabProps = {
  lessons: AdminLesson[];
  searchQuery: string;
  onEditLesson: (lesson: AdminLesson) => void;
};

export function LessonsTab({
  lessons,
  searchQuery,
  onEditLesson,
}: LessonsTabProps) {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch =
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lesson.module?.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lesson.category?.title || "").toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (categoryFilter !== "all") {
      const category = lesson.category?.title || lesson.module?.title || "";
      if (category !== categoryFilter) return false;
    }

    if (statusFilter !== "all") {
      const isPublished = lesson.reviewStatus === "APPROVED" || lesson.isActive;
      if (statusFilter === "published" && !isPublished) return false;
      if (statusFilter === "draft" && isPublished) return false;
    }

    return true;
  });

  const uniqueCategories = Array.from(
    new Set(lessons.map((lesson) => lesson.category?.title || lesson.module?.title).filter(Boolean))
  ) as string[];

  return (
    <div className="lexi-cms-panel-card" style={{ background: "transparent", border: "none", boxShadow: "none", padding: 0 }}>
      <div className="lexi-cms-lessons-header-row">
        <div>
          <h1 className="lexi-cms-lessons-title">Quản lý khóa học</h1>
          <p className="lexi-cms-lessons-desc">Danh sách bài học được tải từ API quản trị.</p>
        </div>
        <button
          className="lexi-cms-btn-create-course"
          onClick={() => onEditLesson(lessons[0])}
          disabled={!lessons.length}
        >
          <Plus size={16} />
          <span>Chỉnh sửa bài học đầu tiên</span>
        </button>
      </div>

      <div className="lexi-cms-lessons-filters">
        <div className="lexi-cms-filter-select-wrapper">
          <Sliders size={14} className="lexi-cms-filter-icon" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="lexi-cms-filter-select"
          >
            <option value="all">Tất cả danh mục</option>
            {uniqueCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="lexi-cms-filter-select-wrapper">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="lexi-cms-filter-select"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đã xuất bản</option>
            <option value="draft">Bản nháp</option>
          </select>
        </div>
      </div>

      <div className="lexi-cms-panel-content" style={{ marginTop: 0 }}>
        <div className="lexi-cms-lessons-grid">
          {filteredLessons.map((lesson) => {
            const isPublished = lesson.reviewStatus === "APPROVED" || lesson.isActive;
            const categoryLabel = (lesson.category?.title || lesson.module?.title || "LEXI").toUpperCase();
            return (
              <div key={lesson.id} className="lexi-cms-lesson-card">
                <div className="lexi-cms-lesson-card-cover-wrapper">
                  <div
                    className="lexi-cms-lesson-card-cover"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#eef2ff",
                      color: "#334155",
                      fontWeight: 800,
                      padding: "16px",
                      textAlign: "center",
                    }}
                  >
                    {lesson.module?.title || lesson.category?.title || "LEXI"}
                  </div>
                  <span className={`lexi-cms-lesson-card-status-pill ${isPublished ? "published" : "draft"}`}>
                    {isPublished ? "Đã xuất bản" : "Bản nháp"}
                  </span>
                </div>

                <div className="lexi-cms-lesson-card-body">
                  <span className="lexi-cms-lesson-card-category">{categoryLabel}</span>
                  <h3 className="lexi-cms-lesson-card-title" title={lesson.title}>
                    {lesson.title}
                  </h3>
                  <p className="lexi-cms-lesson-card-desc">
                    {lesson.module?.title || "Chưa gán module"} - {lesson.reviewStatus === "APPROVED" ? "Đã duyệt" : lesson.reviewStatus === "DRAFT" ? "Bản nháp" : lesson.reviewStatus === "PENDING" ? "Chờ duyệt" : lesson.reviewStatus === "REVIEWING" ? "Đang đánh giá" : "Chưa có trạng thái"}
                  </p>
                </div>

                <div className="lexi-cms-lesson-card-footer">
                  <div className="lexi-cms-lesson-card-meta">
                    <span className="lexi-cms-meta-item">
                      <Compass size={14} />
                      <span>{lesson.updatedAt ? formatDate(lesson.updatedAt) : "Chưa cập nhật"}</span>
                    </span>
                  </div>

                  <button
                    className="lexi-cms-lesson-card-btn-edit"
                    onClick={() => onEditLesson(lesson)}
                    title="Chỉnh sửa bài học"
                  >
                    <Edit size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredLessons.length === 0 && (
          <div style={{ textAlign: "center", color: "#94a3b8", padding: "60px 20px", background: "#ffffff", borderRadius: "16px", border: "1px dashed #cbd5e1" }}>
            <Compass size={40} style={{ color: "#cbd5e1", marginBottom: "12px" }} />
            <p style={{ fontWeight: 600, fontSize: "14px" }}>Không tìm thấy bài học nào phù hợp.</p>
          </div>
        )}
      </div>
    </div>
  );
}
export default LessonsTab;
