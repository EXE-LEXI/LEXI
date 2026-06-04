import React, { useEffect, useMemo, useState } from "react";
import type { AdminLesson, AdminLessonPayload, AdminModule } from "../../api/admin";
import { createAdminLesson, getAdminLesson, updateAdminLesson } from "../../api/admin";
import { X, Save, BookOpen, FileText, Layers, Video, Link, Calendar, Edit3, AlertCircle, Eye, EyeOff, Hash, CheckCircle2, ChevronRight } from "lucide-react";

type ModuleOption = { id: string; title: string };

type LessonDrawerProps = {
  lesson?: AdminLesson | null;
  lessons: AdminLesson[];
  modules: AdminModule[];
  token: string;
  onClose: () => void;
  onSave: (updated: AdminLesson, isCreate?: boolean) => void;
};

const reviewStatuses = ["DRAFT", "IN_REVIEW", "PUBLISHED", "ARCHIVED"] as const;

function buildSlug(title: string) {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

function toDateInput(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

function getStatusLabel(status: string) {
  switch (status) {
    case "PUBLISHED": return "Đã publish";
    case "IN_REVIEW": return "Chờ duyệt";
    case "ARCHIVED": return "Lưu trữ";
    default: return "Bản nháp";
  }
}

export function LessonDrawer({
  lesson,
  lessons,
  modules,
  token,
  onClose,
  onSave,
}: LessonDrawerProps) {
  const isCreate = !lesson;
  const moduleOptions = useMemo<ModuleOption[]>(() => {
    const options = new Map<string, string>();
    for (const item of modules) options.set(item.id, item.title);
    for (const item of lessons) {
      if (item.module?.id && !options.has(item.module.id)) {
        options.set(item.module.id, item.module.title);
      }
    }
    return Array.from(options.entries()).map(([id, title]) => ({ id, title }));
  }, [modules, lessons]);

  const [moduleId, setModuleId] = useState(lesson?.module?.id || moduleOptions[0]?.id || "");
  const [title, setTitle] = useState(lesson?.title || "");
  const [slug, setSlug] = useState(lesson?.slug || "");
  const [content, setContent] = useState(lesson?.content || "");
  const [videoUrl, setVideoUrl] = useState(lesson?.videoUrl || "");
  const [sourceTitle, setSourceTitle] = useState(lesson?.sourceTitle || "");
  const [sourceUrl, setSourceUrl] = useState(lesson?.sourceUrl || "");
  const [legalDocumentNo, setLegalDocumentNo] = useState(lesson?.legalDocumentNo || "");
  const [effectiveDate, setEffectiveDate] = useState(toDateInput(lesson?.effectiveDate));
  const [reviewedAt, setReviewedAt] = useState(toDateInput(lesson?.reviewedAt));
  const [reviewerNote, setReviewerNote] = useState(lesson?.reviewerNote || "");
  const [sortOrder, setSortOrder] = useState(lesson?.sortOrder ?? 0);
  const [reviewStatus, setReviewStatus] = useState(lesson?.reviewStatus || "DRAFT");
  const [isActive, setIsActive] = useState(Boolean(lesson?.isActive));
  const [questionsCount, setQuestionsCount] = useState(lesson?.questionsCount ?? lesson?.questions?.length ?? 0);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  type TabType = "basic" | "content" | "legal";
  const [activeTab, setActiveTab] = useState<TabType>("basic");

  useEffect(() => {
    if (!moduleId && moduleOptions[0]?.id) setModuleId(moduleOptions[0].id);
  }, [moduleId, moduleOptions]);

  useEffect(() => {
    if (!lesson?.id) return;
    setIsLoadingDetail(true);
    setError(null);
    getAdminLesson(token, lesson.id)
      .then((detail) => {
        setModuleId(detail.module?.id || "");
        setTitle(detail.title || "");
        setSlug(detail.slug || "");
        setContent(detail.content || "");
        setVideoUrl(detail.videoUrl || "");
        setSourceTitle(detail.sourceTitle || "");
        setSourceUrl(detail.sourceUrl || "");
        setLegalDocumentNo(detail.legalDocumentNo || "");
        setEffectiveDate(toDateInput(detail.effectiveDate));
        setReviewedAt(toDateInput(detail.reviewedAt));
        setReviewerNote(detail.reviewerNote || "");
        setSortOrder(detail.sortOrder ?? 0);
        setReviewStatus(detail.reviewStatus || "DRAFT");
        setIsActive(Boolean(detail.isActive));
        setQuestionsCount(detail.questionsCount ?? detail.questions?.length ?? 0);
      })
      .catch((err: any) => setError("Không tải được chi tiết bài học: " + (err.message || err)))
      .finally(() => setIsLoadingDetail(false));
  }, [lesson?.id, token]);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (isCreate && !slug.trim()) setSlug(buildSlug(value));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!moduleId) {
      setError("Vui lòng chọn khóa học cho bài học.");
      return;
    }
    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề bài học.");
      return;
    }
    if (reviewStatus === "PUBLISHED") {
      if (!isActive) {
        setError("Bài giảng ở trạng thái 'Đã publish' phải được thiết lập là 'Hiển thị'.");
        return;
      }
      if (!videoUrl.trim()) {
        setError("Không thể publish: Bài học yêu cầu đường dẫn Video bài giảng.");
        return;
      }
      if (questionsCount < 10) {
        setError(`Không thể publish: Bài học yêu cầu tối thiểu 10 câu hỏi trắc nghiệm (hiện có: ${questionsCount}).`);
        return;
      }
      if (!sourceTitle.trim() || !sourceUrl.trim() || !legalDocumentNo.trim() || !reviewedAt) {
        setError("Không thể publish: Bài học yêu cầu đầy đủ thông tin nguồn pháp lý (Tên nguồn, đường dẫn nguồn, số hiệu và ngày duyệt).");
        return;
      }
    }
    setIsSaving(true);
    setError(null);

    const payload: AdminLessonPayload = {
      moduleId,
      title: title.trim(),
      slug: slug.trim() || null,
      content: content.trim() || null,
      videoUrl: videoUrl.trim() || null,
      sourceTitle: sourceTitle.trim() || null,
      sourceUrl: sourceUrl.trim() || null,
      legalDocumentNo: legalDocumentNo.trim() || null,
      effectiveDate: effectiveDate || null,
      reviewedAt: reviewedAt || null,
      reviewerNote: reviewerNote.trim() || null,
      sortOrder,
      reviewStatus: reviewStatus as AdminLessonPayload["reviewStatus"],
      isActive,
    };

    try {
      const saved = isCreate
        ? await createAdminLesson(token, payload)
        : await updateAdminLesson(token, lesson.id, payload);
      onSave(saved, isCreate);
      onClose();
    } catch (err: any) {
      setError("Không lưu được bài học: " + (err.message || err));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="lexi-premium-drawer-overlay" onClick={onClose}>
      <div className="lexi-premium-drawer wide" onClick={(event) => event.stopPropagation()}>
        <div className="lexi-premium-drawer-header">
          <div className="lexi-premium-drawer-badge">BÀI HỌC</div>
          <h3>{isCreate ? "Tạo bài học mới" : "Chỉnh sửa bài học"}</h3>
          <p className="lexi-premium-drawer-sub">Cấu hình các thông tin cơ bản, nội dung chi tiết bài học và thông tin pháp lý đi kèm.</p>
          <button className="lexi-premium-drawer-close" type="button" onClick={onClose} aria-label="Đóng">
            <X size={18} />
          </button>
        </div>

        {isLoadingDetail && (
          <div className="lexi-premium-notice-alert" style={{ margin: "20px 32px 0" }}>
            <AlertCircle size={16} />
            <span>Đang tải thông tin chi tiết bài học...</span>
          </div>
        )}

        <div className="lexi-premium-tabs">
          <button
            type="button"
            className={`lexi-premium-tab-btn ${activeTab === "basic" ? "active" : ""}`}
            onClick={() => setActiveTab("basic")}
          >
            <BookOpen size={15} />
            <span>1. Thông tin chung</span>
          </button>
          <button
            type="button"
            className={`lexi-premium-tab-btn ${activeTab === "content" ? "active" : ""}`}
            onClick={() => setActiveTab("content")}
          >
            <FileText size={15} />
            <span>2. Nội dung bài giảng</span>
          </button>
          <button
            type="button"
            className={`lexi-premium-tab-btn ${activeTab === "legal" ? "active" : ""}`}
            onClick={() => setActiveTab("legal")}
          >
            <Layers size={15} />
            <span>3. Pháp lý & Kiểm duyệt</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
          <div className="lexi-premium-drawer-content">
            {error && (
              <div className="lexi-premium-error-alert">
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>{error}</span>
              </div>
            )}

            {activeTab === "basic" && (
              <div className="lexi-premium-form-card">
                <div className="lexi-premium-form-card-title">
                  <BookOpen size={15} style={{ color: "#4f46e5" }} />
                  <span>Cấu hình chung</span>
                </div>

                <div className="lexi-premium-form-group">
                  <label>Khóa học / Module chứa bài học</label>
                  <div className="lexi-premium-input-wrapper">
                    <BookOpen className="lexi-premium-input-icon" size={16} />
                    <select className="lexi-premium-select" value={moduleId} onChange={(event) => setModuleId(event.target.value)} disabled={!isCreate} required>
                      <option value="">-- Chọn khóa học --</option>
                      {moduleOptions.map((module) => (
                        <option key={module.id} value={module.id}>{module.title}</option>
                      ))}
                    </select>
                  </div>
                  <span className="lexi-premium-helper-text">Chọn khóa học mà bài học này thuộc về (không thể đổi sau khi đã lưu).</span>
                </div>

                <div className="lexi-premium-grid-2">
                  <div className="lexi-premium-form-group">
                    <label>Tiêu đề bài học</label>
                    <div className="lexi-premium-input-wrapper">
                      <FileText className="lexi-premium-input-icon" size={16} />
                      <input required type="text" className="lexi-premium-input" placeholder="Nhập tên bài học..." value={title} onChange={(event) => handleTitleChange(event.target.value)} />
                    </div>
                  </div>
                  <div className="lexi-premium-form-group">
                    <label>Slug bài học</label>
                    <div className="lexi-premium-input-wrapper">
                      <Link className="lexi-premium-input-icon" size={16} />
                      <input type="text" className="lexi-premium-input" placeholder="auto-generated-slug" value={slug} onChange={(event) => setSlug(event.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="lexi-premium-grid-2">
                  <div className="lexi-premium-form-group">
                    <label>Số thứ tự</label>
                    <div className="lexi-premium-input-wrapper">
                      <Hash className="lexi-premium-input-icon" size={16} />
                      <input className="lexi-premium-input" type="number" min={0} value={sortOrder} onChange={(event) => setSortOrder(Number(event.target.value))} />
                    </div>
                    <span className="lexi-premium-helper-text">Sắp xếp hiển thị bài học trong khóa học.</span>
                  </div>

                  <div className="lexi-premium-form-group">
                    <label>Hiển thị cho học viên</label>
                    <div className="lexi-premium-segmented">
                      <button
                        type="button"
                        className={`lexi-premium-segmented-btn show-active ${isActive ? "active" : ""}`}
                        onClick={() => setIsActive(true)}
                      >
                        <Eye size={14} />
                        <span>Hiển thị</span>
                      </button>
                      <button
                        type="button"
                        className={`lexi-premium-segmented-btn show-inactive ${!isActive ? "active" : ""}`}
                        onClick={() => setIsActive(false)}
                      >
                        <EyeOff size={14} />
                        <span>Ẩn bài</span>
                      </button>
                    </div>
                    <span className="lexi-premium-helper-text">Điều khiển việc hiển thị bài giảng tới người học.</span>
                  </div>
                </div>

                <div className="lexi-premium-form-group" style={{ marginTop: "6px" }}>
                  <label>Trạng thái duyệt bài học</label>
                  <div className="lexi-premium-segmented">
                    <button
                      type="button"
                      className={`lexi-premium-segmented-btn ${reviewStatus === "DRAFT" ? "active draft" : ""}`}
                      onClick={() => setReviewStatus("DRAFT")}
                    >
                      <span>Bản nháp</span>
                    </button>
                    <button
                      type="button"
                      className={`lexi-premium-segmented-btn ${reviewStatus === "IN_REVIEW" ? "active in-review" : ""}`}
                      onClick={() => setReviewStatus("IN_REVIEW")}
                    >
                      <span>Chờ duyệt</span>
                    </button>
                    <button
                      type="button"
                      className={`lexi-premium-segmented-btn ${reviewStatus === "PUBLISHED" ? "active published" : ""}`}
                      onClick={() => setReviewStatus("PUBLISHED")}
                    >
                      <span>Đã publish</span>
                    </button>
                    <button
                      type="button"
                      className={`lexi-premium-segmented-btn ${reviewStatus === "ARCHIVED" ? "active archived" : ""}`}
                      onClick={() => setReviewStatus("ARCHIVED")}
                    >
                      <span>Lưu trữ</span>
                    </button>
                  </div>
                </div>

                {reviewStatus === "PUBLISHED" && (
                  <div style={{
                    marginTop: "12px",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    background: (questionsCount >= 10 && !!videoUrl.trim() && !!sourceTitle.trim() && !!sourceUrl.trim() && !!legalDocumentNo.trim() && !!reviewedAt && isActive) ? "#f0fdf4" : "#fff7ed",
                    border: (questionsCount >= 10 && !!videoUrl.trim() && !!sourceTitle.trim() && !!sourceUrl.trim() && !!legalDocumentNo.trim() && !!reviewedAt && isActive) ? "1px solid #bbf7d0" : "1px solid #fed7aa",
                    color: (questionsCount >= 10 && !!videoUrl.trim() && !!sourceTitle.trim() && !!sourceUrl.trim() && !!legalDocumentNo.trim() && !!reviewedAt && isActive) ? "#15803d" : "#c2410c",
                    fontSize: "12.5px",
                    lineHeight: "1.5"
                  }}>
                    <strong style={{ display: "block", marginBottom: "4px" }}>
                      {(questionsCount >= 10 && !!videoUrl.trim() && !!sourceTitle.trim() && !!sourceUrl.trim() && !!legalDocumentNo.trim() && !!reviewedAt && isActive) ? "✓ Đủ điều kiện Publish:" : "⚠️ Chưa đủ điều kiện Publish:"}
                    </strong>
                    <ul style={{ margin: 0, paddingLeft: "16px", listStyleType: "disc" }}>
                      <li style={{ color: isActive ? "inherit" : "#dc2626", fontWeight: isActive ? 500 : 700 }}>
                        Hiển thị cho học viên: {isActive ? "Đã hiển thị" : "Bị ẩn (Yêu cầu hiển thị khi publish)"}
                      </li>
                      <li style={{ color: !!videoUrl.trim() ? "inherit" : "#dc2626", fontWeight: !!videoUrl.trim() ? 500 : 700 }}>
                        Đường dẫn video: {!!videoUrl.trim() ? "Đã có" : "Chưa có"}
                      </li>
                      <li style={{ color: questionsCount >= 10 ? "inherit" : "#dc2626", fontWeight: questionsCount >= 10 ? 500 : 700 }}>
                        Số lượng câu hỏi trắc nghiệm: {questionsCount}/10 câu {questionsCount >= 10 ? "(Đạt)" : "(Chưa đạt)"}
                      </li>
                      <li style={{ color: (!!sourceTitle.trim() && !!sourceUrl.trim() && !!legalDocumentNo.trim() && !!reviewedAt) ? "inherit" : "#dc2626", fontWeight: (!!sourceTitle.trim() && !!sourceUrl.trim() && !!legalDocumentNo.trim() && !!reviewedAt) ? 500 : 700 }}>
                        Thông tin nguồn pháp lý: {(!!sourceTitle.trim() && !!sourceUrl.trim() && !!legalDocumentNo.trim() && !!reviewedAt) ? "Đầy đủ" : "Còn thiếu"}
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === "content" && (
              <div className="lexi-premium-form-card">
                <div className="lexi-premium-form-card-title">
                  <FileText size={15} style={{ color: "#4f46e5" }} />
                  <span>Bài giảng & Video</span>
                </div>

                <div className="lexi-premium-form-group">
                  <label>Đường dẫn Video bài giảng</label>
                  <div className="lexi-premium-input-wrapper">
                    <Video className="lexi-premium-input-icon" size={16} />
                    <input className="lexi-premium-input" type="url" placeholder="https://www.youtube.com/watch?v=..." value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} />
                  </div>
                  <span className="lexi-premium-helper-text">Video trực quan đi kèm nội dung bài giảng.</span>
                </div>

                <div className="lexi-premium-form-group">
                  <label>Nội dung chi tiết bài học (Markdown/Text)</label>
                  <textarea
                    className="lexi-premium-textarea"
                    rows={10}
                    placeholder="Nhập nội dung lý thuyết, tình huống, hoặc văn bản bài học..."
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    style={{ fontFamily: "'SF Mono', SFMono-Regular, Consolas, 'Liberation Mono', Menlo, Courier, monospace", fontSize: "13.5px" }}
                  />
                  <span className="lexi-premium-helper-text">Viết nội dung bài học rõ ràng để đạt trải nghiệm đọc bài tốt nhất.</span>
                </div>
              </div>
            )}

            {activeTab === "legal" && (
              <div className="lexi-premium-form-card">
                <div className="lexi-premium-form-card-title">
                  <Layers size={15} style={{ color: "#4f46e5" }} />
                  <span>Nguồn pháp lý & Phê duyệt</span>
                </div>

                <div className="lexi-premium-grid-2">
                  <div className="lexi-premium-form-group">
                    <label>Tên nguồn pháp lý</label>
                    <div className="lexi-premium-input-wrapper">
                      <Layers className="lexi-premium-input-icon" size={16} />
                      <input className="lexi-premium-input" placeholder="Bộ Luật Lao Động 2019..." value={sourceTitle} onChange={(event) => setSourceTitle(event.target.value)} />
                    </div>
                  </div>
                  <div className="lexi-premium-form-group">
                    <label>Số hiệu văn bản pháp luật</label>
                    <div className="lexi-premium-input-wrapper">
                      <FileText className="lexi-premium-input-icon" size={16} />
                      <input className="lexi-premium-input" placeholder="45/2019/QH14..." value={legalDocumentNo} onChange={(event) => setLegalDocumentNo(event.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="lexi-premium-form-group">
                  <label>Đường dẫn đến văn bản nguồn gốc</label>
                  <div className="lexi-premium-input-wrapper">
                    <Link className="lexi-premium-input-icon" size={16} />
                    <input className="lexi-premium-input" type="url" placeholder="https://vanban.chinhphu.vn/..." value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} />
                  </div>
                </div>

                <div className="lexi-premium-grid-2">
                  <div className="lexi-premium-form-group">
                    <label>Ngày văn bản có hiệu lực</label>
                    <div className="lexi-premium-input-wrapper">
                      <Calendar className="lexi-premium-input-icon" size={16} />
                      <input className="lexi-premium-input" type="date" value={effectiveDate} onChange={(event) => setEffectiveDate(event.target.value)} />
                    </div>
                  </div>
                  <div className="lexi-premium-form-group">
                    <label>Ngày duyệt bài giảng</label>
                    <div className="lexi-premium-input-wrapper">
                      <Calendar className="lexi-premium-input-icon" size={16} />
                      <input className="lexi-premium-input" type="date" value={reviewedAt} onChange={(event) => setReviewedAt(event.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="lexi-premium-form-group">
                  <label>Ghi chú của kiểm duyệt viên</label>
                  <div className="lexi-premium-input-wrapper">
                    <Edit3 className="lexi-premium-input-icon" size={16} style={{ top: "14px" }} />
                    <textarea className="lexi-premium-textarea" style={{ paddingLeft: "42px" }} rows={3} placeholder="Ghi chú nhận xét pháp luật hoặc lý do phê duyệt..." value={reviewerNote} onChange={(event) => setReviewerNote(event.target.value)} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lexi-premium-drawer-actions">
            {activeTab !== "legal" ? (
              <button
                type="button"
                className="lexi-premium-btn-save"
                style={{ background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)", boxShadow: "0 4px 14px rgba(79, 70, 229, 0.25)" }}
                onClick={() => {
                  if (activeTab === "basic") setActiveTab("content");
                  else if (activeTab === "content") setActiveTab("legal");
                }}
              >
                <span>Tiếp theo</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button type="submit" className="lexi-premium-btn-save" disabled={isSaving || isLoadingDetail}>
                <CheckCircle2 size={16} />
                <span>{isSaving ? "Đang lưu..." : isCreate ? "Tạo bài học" : "Lưu thay đổi"}</span>
              </button>
            )}
            <button type="button" className="lexi-premium-btn-cancel" onClick={onClose}>Hủy</button>
          </div>
        </form>
      </div>
    </div>
  );
}
