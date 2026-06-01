import React, { useState } from "react";
import { Sparkles, BrainCircuit, RefreshCw, AlertCircle, Eye, CheckCircle2, ChevronRight, PlayCircle, Settings, Clipboard } from "lucide-react";
import type { AdminDraft, AdminSource, AdminLesson } from "../../api/admin";
import { generateAdminLessonDraft, updateAdminLessonDraft, createLessonFromDraft } from "../../api/admin";
import { formatDate } from "../../utils/format";

type AiDraftsTabProps = {
  token: string;
  initialDrafts: AdminDraft[];
  sources: AdminSource[];
  lessons: AdminLesson[];
  onLessonCreated?: (newLesson: AdminLesson) => void;
};

export function AiDraftsTab({
  token,
  initialDrafts,
  sources,
  lessons,
  onLessonCreated,
}: AiDraftsTabProps) {
  const [drafts, setDrafts] = useState<AdminDraft[]>(initialDrafts);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notice, setNotice] = useState<string | null>(null);

  // Generator Panel States
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState("");
  const [titleHint, setTitleHint] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [genError, setGenError] = useState<string | null>(null);

  // Drawer Edit/Review States
  const [selectedDraft, setSelectedDraft] = useState<AdminDraft | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [reviewerNote, setReviewerNote] = useState("");
  const [draftStatus, setDraftStatus] = useState("DRAFT");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Convert to Lesson States
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState("");
  const [slug, setSlug] = useState("");
  const [sortOrder, setSortOrder] = useState(1);
  const [isConverting, setIsConverting] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);

  // Extract unique modules from lessons for target options
  const uniqueModules = React.useMemo(() => {
    const modulesMap: Record<string, string> = {};
    lessons.forEach((l) => {
      // If lesson belongs to a module
      const moduleName = l.module?.title || "Module pháp chế";
      const moduleId = l.id; // Fallback identifier
      modulesMap[moduleId] = moduleName;
    });
    return Object.entries(modulesMap).map(([id, title]) => ({ id, title }));
  }, [lessons]);

  const handleGenerateDraftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSourceId) {
      setGenError("Vui lòng chọn một nguồn luật pháp lý.");
      return;
    }

    setIsGenerating(true);
    setGenError(null);
    setNotice(null);

    const payload = {
      sourceDocumentId: selectedSourceId,
      titleHint: titleHint || null,
      questionCount,
    };

    try {
      const generated = await generateAdminLessonDraft(token, payload);
      setDrafts((prev) => [generated, ...prev]);
      setNotice("Da tao du thao bai hoc va cau hoi trac nghiem tu dong qua mo hinh AI.");
      setTitleHint("");
    } catch (err: any) {
      setGenError(err.message || "Lỗi trong quá trình AI xử lý nguồn pháp lý.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenDraftDrawer = async (draft: AdminDraft & { content?: string; reviewerNote?: string }) => {
    setSelectedDraft(draft);
    setDraftTitle(draft.title);
    setDraftContent(draft.content || "Nội dung giáo trình bài giảng được AI tổng hợp từ nguồn luật gốc...\n\n- Điều 1...\n- Điều 2...");
    setReviewerNote(draft.reviewerNote || "");
    setDraftStatus(draft.status || "DRAFT");
    setSaveError(null);
    setIsDrawerOpen(true);
  };

  const handleSaveDraftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDraft) return;

    setIsSaving(true);
    setSaveError(null);
    setNotice(null);

    const payload = {
      title: draftTitle,
      content: draftContent,
      reviewerNote: reviewerNote || null,
      status: draftStatus,
    };

    try {
      const updated = await updateAdminLessonDraft(token, selectedDraft.id, payload);
      setDrafts((prev) => prev.map((d) => (d.id === selectedDraft.id ? updated : d)));
      setNotice("Da luu chinh sua review du thao.");
      setIsDrawerOpen(false);
    } catch (err: any) {
      setSaveError(err.message || "Lỗi lưu dự thảo.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenConvertModal = () => {
    setSlug(draftTitle.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
    setTargetModuleId(uniqueModules[0]?.id || "");
    setConvertError(null);
    setIsConvertModalOpen(true);
  };

  const handleConvertDraftToLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDraft) return;

    setIsConverting(true);
    setConvertError(null);
    setNotice(null);

    const payload = {
      moduleId: targetModuleId || null,
      slug: slug || null,
      sortOrder,
    };

    try {
      const liveLesson = await createLessonFromDraft(token, selectedDraft.id, payload);
      
      // Update drafts status in state
      setDrafts((prev) => prev.map((d) => (d.id === selectedDraft.id ? { ...d, status: "ACCEPTED" } : d)));
      
      // Notify parent to append to lessons list
      if (onLessonCreated) {
        onLessonCreated(liveLesson);
      }

      setNotice("Bai hoc va quiz da duoc dua vao he thong hoc tap thanh cong.");
      setIsConvertModalOpen(false);
      setIsDrawerOpen(false);
    } catch (err: any) {
      setConvertError(err.message || "Lỗi xuất bản bài giảng.");
    } finally {
      setIsConverting(false);
    }
  };

  const filteredDrafts = drafts.filter((d) => {
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.source?.title || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || d.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="lexi-cms-panel-card" style={{ background: "transparent", border: "none", boxShadow: "none", padding: 0 }}>
      
      {/* Header Row */}
      <div className="lexi-cms-lessons-header-row">
        <div>
          <h1 className="lexi-cms-lessons-title">Không gian Tạo nội dung bằng AI (AI Builder)</h1>
          <p className="lexi-cms-lessons-desc">Tận dụng mô hình ngôn ngữ lớn để biến đổi văn bản nguồn pháp lý thành giáo trình, kịch bản video và bộ câu hỏi trắc nghiệm.</p>
        </div>
      </div>

      {notice && <div className="lexi-inline-notice">{notice}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "24px", alignItems: "start" }}>
        
        {/* Left Side: Drafts list table */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {/* Search Box */}
          <div className="lexi-cms-lessons-filters" style={{ margin: 0 }}>
            <div className="lexi-cms-filter-select-wrapper">
              <input
                type="text"
                placeholder="Tìm dự thảo, nguồn luật gốc..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="lexi-cms-filter-select"
                style={{ width: "260px", border: "1px solid #e2e8f0", padding: "10px 14px", borderRadius: "8px" }}
              />
            </div>

            <div className="lexi-cms-filter-select-wrapper">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="lexi-cms-filter-select">
                <option value="all">Tất cả trạng thái review</option>
                <option value="DRAFT">Chờ kiểm duyệt (Bản nháp)</option>
                <option value="ACCEPTED">Đã xuất bản (Chấp thuận)</option>
                <option value="REJECTED">Bị từ chối</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="lexi-cms-table-wrapper" style={{ background: "#ffffff", borderRadius: "16px", padding: "16px", border: "1px solid #e2e8f0" }}>
            <table className="lexi-cms-table">
              <thead>
                <tr>
                  <th>Tên dự thảo giáo trình</th>
                  <th>Nguồn gốc</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: "right" }}>Review</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrafts.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <strong style={{ fontSize: "14px", color: "#1e293b" }}>{item.title}</strong>
                        <span style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                          Cập nhật: {item.updatedAt ? formatDate(item.updatedAt) : "-"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 550 }}>
                        {item.source?.title || "Văn bản gốc"}
                      </span>
                    </td>
                    <td>
                      <span className={`lexi-cms-badge-status ${item.status === "ACCEPTED" ? "active" : item.status === "REJECTED" ? "inactive" : "pending"}`}>
                        {item.status === "ACCEPTED" ? "Đã duyệt" : item.status === "REJECTED" ? "Từ chối" : "Bản nháp"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button className="lexi-cms-lesson-card-btn-edit" style={{ position: "static", transform: "none" }} onClick={() => handleOpenDraftDrawer(item)} title="Xem chi tiết">
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredDrafts.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", color: "#94a3b8", padding: "40px" }}>
                      Chưa có dự thảo bài giảng nào được khởi tạo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

        {/* Right Side: Generator Form */}
        <form className="panel lexi-settings-panel" onSubmit={handleGenerateDraftSubmit} style={{ margin: 0, background: "#ffffff", borderRadius: "16px", padding: "20px", border: "1px solid #cbd5e1" }}>
          <h2 style={{ display: "flex", alignItems: "center", gap: "10px", margin: 0, fontSize: "18px", fontWeight: 700, color: "#1e293b" }}>
            <BrainCircuit size={20} style={{ color: "#8b5cf6" }} />
            <span>Tạo Dự Thảo Bài Học Bằng AI</span>
          </h2>
          <p style={{ color: "#64748b", fontSize: "13px", lineHeight: "1.55", margin: "8px 0 16px 0", fontWeight: 550 }}>
            Hệ thống AI của Lexi sẽ phân tích sâu nội dung văn bản nguồn luật, tự động sinh giáo trình tóm tắt và 1 bộ câu hỏi trắc nghiệm bám sát nội dung.
          </p>

          {genError && (
            <div className="status-toast error" style={{ marginBottom: "16px" }}>
              <AlertCircle size={16} />
              <span>{genError}</span>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="lexi-form-field">
              <label>Bước 1: Chọn nguồn luật quy phạm</label>
              <select value={selectedSourceId} onChange={(e) => setSelectedSourceId(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} required>
                <option value="">-- Chọn nguồn pháp lý --</option>
                {sources.map((s) => (
                  <option key={s.id} value={s.id}>{s.title} ({s.documentNo || "Không số hiệu"})</option>
                ))}
              </select>
            </div>

            <div className="lexi-form-field">
              <label>Bước 2: Gợi ý tên bài học / Định hướng chủ đề (Hint)</label>
              <input
                type="text"
                placeholder="Ví dụ: Nguyên tắc giao kết hợp đồng và các lỗi thường gặp"
                value={titleHint}
                onChange={(e) => setTitleHint(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
            </div>

            <div className="lexi-form-field">
              <label>Bước 3: Thiết lập số lượng câu hỏi trắc nghiệm (AI Quiz)</label>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  style={{ flex: 1, accentColor: "#8b5cf6" }}
                />
                <strong style={{ fontSize: "16px", color: "#8b5cf6", minWidth: "24px" }}>{questionCount}</strong>
                <span style={{ fontSize: "13px", color: "#64748b" }}>câu</span>
              </div>
            </div>

            <button className="lexi-btn-save-settings" type="submit" disabled={isGenerating} style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", color: "#ffffff", border: "none", cursor: "pointer", display: "flex", gap: "8px", justifyContent: "center", alignItems: "center" }}>
              {isGenerating ? (
                <>
                  <RefreshCw className="animate-spin" size={16} />
                  <span>AI đang biên soạn giáo trình...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Khởi chạy mô hình AI</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>

      {/* Drawer Details & Review Form overlay */}
      {isDrawerOpen && selectedDraft && (
        <div className="lexi-cms-drawer-overlay lexi-animate-fade" onClick={() => setIsDrawerOpen(false)}>
          <div className="lexi-cms-drawer-card" onClick={(e) => e.stopPropagation()} style={{ width: "640px", padding: "24px" }}>
            
            <div className="drawer-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2>Review Dự Thảo Bài Giảng</h2>
              <button onClick={() => setIsDrawerOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#94a3b8" }}>&times;</button>
            </div>

            {saveError && (
              <div className="status-toast error" style={{ marginBottom: "16px" }}>
                <AlertCircle size={16} />
                <span>{saveError}</span>
              </div>
            )}

            <form onSubmit={handleSaveDraftSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              <div className="lexi-form-field">
                <label>Tên bài giảng</label>
                <input
                  type="text"
                  required
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div className="lexi-form-field">
                <label>Nội dung tóm tắt giáo trình (AI generated)</label>
                <textarea
                  required
                  rows={10}
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", resize: "vertical", fontSize: "13px", lineHeight: "1.6" }}
                />
              </div>

              <div className="lexi-form-field">
                <label>Ý kiến nhận xét của Kiểm duyệt viên (Reviewer Notes)</label>
                <textarea
                  rows={3}
                  placeholder="Góp ý hoặc ghi chú điều chỉnh nội dung (ví dụ: Cần cập nhật thêm Nghị định hướng dẫn)..."
                  value={reviewerNote}
                  onChange={(e) => setReviewerNote(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div className="lexi-form-field">
                <label>Trạng thái phê duyệt</label>
                <select value={draftStatus} onChange={(e) => setDraftStatus(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                  <option value="DRAFT">Bản nháp review</option>
                  <option value="ACCEPTED">Phê duyệt thông qua</option>
                  <option value="REJECTED">Không đạt yêu cầu</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                <button className="lexi-btn-save-settings" type="submit" disabled={isSaving} style={{ flex: 1 }}>
                  {isSaving ? "Đang lưu..." : "Lưu phê duyệt review"}
                </button>

                {draftStatus === "ACCEPTED" && (
                  <button className="lexi-btn-save-settings" type="button" onClick={handleOpenConvertModal} style={{ flex: 1.2, background: "linear-gradient(135deg, #10b981, #059669)", border: "none", color: "#ffffff", display: "flex", gap: "6px", justifyContent: "center", alignItems: "center" }}>
                    <PlayCircle size={16} />
                    <span>Xuất bản làm bài học thật</span>
                  </button>
                )}
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Convert to Lesson Modal Confirmation */}
      {isConvertModalOpen && (
        <div className="lexi-pricing-modal-overlay lexi-animate-fade" onClick={() => setIsConvertModalOpen(false)}>
          <div className="modal-card panel-card" onClick={(e) => e.stopPropagation()} style={{ width: "460px", padding: "24px" }}>
            
            <div className="modal-header">
              <Sparkles size={36} className="shield-icon" style={{ color: "#10b981" }} />
              <h3>Xuất Bản Giáo Trình Bài Giảng</h3>
              <p>Hệ thống sẽ tiến hành khởi tạo Bài học & bộ Câu hỏi trắc nghiệm và xếp vào khóa học.</p>
            </div>

            {convertError && (
              <div className="status-toast error" style={{ marginBottom: "16px" }}>
                <AlertCircle size={16} />
                <span>{convertError}</span>
              </div>
            )}

            <form onSubmit={handleConvertDraftToLesson} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              <div className="lexi-form-field">
                <label>Xếp vào khóa học mục tiêu</label>
                <select value={targetModuleId} onChange={(e) => setTargetModuleId(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} required>
                  {uniqueModules.map((m) => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "16px" }}>
                <div className="lexi-form-field">
                  <label>Đường dẫn tĩnh (Slug URL)</label>
                  <input
                    type="text"
                    required
                    placeholder="nguyen-tac-giao-ket-hop-dong"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  />
                </div>

                <div className="lexi-form-field">
                  <label>Thứ tự hiển thị</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                <button className="lexi-btn-action-primary" type="submit" disabled={isConverting} style={{ flex: 1, background: "#10b981" }}>
                  {isConverting ? "Đang xuất bản..." : "Xác nhận xuất bản bài giảng"}
                </button>
                <button className="lexi-btn-action-secondary" type="button" onClick={() => setIsConvertModalOpen(false)}>Hủy</button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
