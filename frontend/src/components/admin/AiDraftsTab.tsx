import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, BrainCircuit, CheckCircle2, Eye, PlayCircle, RefreshCw, Sparkles } from "lucide-react";
import type { AdminDraft, AdminLesson, AdminModule, AdminSource } from "../../api/admin";
import { createLessonFromDraft, generateAdminLessonDraft, getAdminLessonDraft, updateAdminLessonDraft } from "../../api/admin";
import { formatDate } from "../../utils/format";

type AiDraftsTabProps = {
  token: string;
  initialDrafts: AdminDraft[];
  sources: AdminSource[];
  modules: AdminModule[];
  lessons: AdminLesson[];
  onLessonCreated?: (newLesson: AdminLesson) => void;
};

const draftStatuses = ["DRAFT", "IN_REVIEW", "ACCEPTED", "REJECTED"] as const;

function sourceTitle(draft: AdminDraft) {
  return draft.sourceDocument?.title || draft.source?.title || "Nguồn pháp lý";
}

function statusLabel(status?: string) {
  if (status === "IN_REVIEW") return "Đang duyệt";
  if (status === "ACCEPTED") return "Đã duyệt";
  if (status === "REJECTED") return "Từ chối";
  return "Bản nháp";
}

function statusClass(status?: string) {
  if (status === "ACCEPTED") return "active";
  if (status === "REJECTED") return "inactive";
  return "pending";
}

function buildSlug(title: string) {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

export function AiDraftsTab({
  token,
  initialDrafts,
  sources,
  modules,
  lessons,
  onLessonCreated,
}: AiDraftsTabProps) {
  const [drafts, setDrafts] = useState<AdminDraft[]>(initialDrafts);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedSourceId, setSelectedSourceId] = useState("");
  const [titleHint, setTitleHint] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const [selectedDraft, setSelectedDraft] = useState<AdminDraft | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [reviewerNote, setReviewerNote] = useState("");
  const [draftStatus, setDraftStatus] = useState("DRAFT");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState("");
  const [slug, setSlug] = useState("");
  const [sortOrder, setSortOrder] = useState(1);
  const [isConverting, setIsConverting] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);

  useEffect(() => setDrafts(initialDrafts), [initialDrafts]);

  const moduleOptions = useMemo(
    () => modules.map((module) => ({ id: module.id, title: module.title })),
    [modules]
  );

  const filteredDrafts = drafts.filter((draft) => {
    const keyword = searchQuery.trim().toLowerCase();
    return (
      (!keyword ||
        draft.title.toLowerCase().includes(keyword) ||
        sourceTitle(draft).toLowerCase().includes(keyword)) &&
      (statusFilter === "all" || draft.status === statusFilter)
    );
  });

  async function handleGenerate(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedSourceId) {
      setGenError("Vui lòng chọn một nguồn pháp lý.");
      return;
    }
    setIsGenerating(true);
    setGenError(null);
    setNotice(null);
    try {
      const generated = await generateAdminLessonDraft(token, {
        sourceDocumentId: selectedSourceId,
        titleHint: titleHint.trim() || null,
        questionCount,
      });
      setDrafts((prev) => [generated, ...prev]);
      setNotice("Đã tạo bản nháp bài học và bộ câu hỏi bằng AI.");
      setTitleHint("");
    } catch (err: any) {
      setGenError("Không tạo được bản nháp AI: " + (err.message || err));
    } finally {
      setIsGenerating(false);
    }
  }

  async function openDraft(draft: AdminDraft) {
    setSelectedDraft(draft);
    setDraftTitle(draft.title);
    setDraftContent(draft.content || "");
    setReviewerNote(draft.reviewerNote || "");
    setDraftStatus(draft.status || "DRAFT");
    setSaveError(null);
    setIsDrawerOpen(true);
    setIsLoadingDraft(true);
    try {
      const detail = await getAdminLessonDraft(token, draft.id);
      setSelectedDraft(detail);
      setDraftTitle(detail.title);
      setDraftContent(detail.content || "");
      setReviewerNote(detail.reviewerNote || "");
      setDraftStatus(detail.status || "DRAFT");
      setDrafts((prev) => prev.map((item) => (item.id === detail.id ? detail : item)));
    } catch (err: any) {
      setSaveError("Không tải được chi tiết draft: " + (err.message || err));
    } finally {
      setIsLoadingDraft(false);
    }
  }

  async function handleSaveDraft(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedDraft) return;
    setIsSaving(true);
    setSaveError(null);
    setNotice(null);
    try {
      const updated = await updateAdminLessonDraft(token, selectedDraft.id, {
        title: draftTitle.trim(),
        content: draftContent,
        reviewerNote: reviewerNote.trim() || null,
        status: draftStatus,
      });
      setDrafts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setSelectedDraft(updated);
      setNotice("Đã lưu kết quả duyệt bản nháp.");
      setIsDrawerOpen(false);
    } catch (err: any) {
      setSaveError("Không lưu được draft: " + (err.message || err));
    } finally {
      setIsSaving(false);
    }
  }

  function openConvertModal() {
    setSlug(buildSlug(draftTitle));
    setTargetModuleId(selectedDraft?.module?.id || moduleOptions[0]?.id || "");
    setConvertError(null);
    setIsConvertModalOpen(true);
  }

  async function handleConvert(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedDraft) return;
    if (!targetModuleId) {
      setConvertError("Vui lòng chọn khóa học đích.");
      return;
    }
    setIsConverting(true);
    setConvertError(null);
    setNotice(null);
    try {
      const liveLesson = await createLessonFromDraft(token, selectedDraft.id, {
        moduleId: targetModuleId,
        slug: slug.trim() || null,
        sortOrder,
      });
      setDrafts((prev) =>
        prev.map((draft) =>
          draft.id === selectedDraft.id
            ? {
                ...draft,
                status: "ACCEPTED",
                createdLesson: {
                  id: liveLesson.id,
                  slug: liveLesson.slug || "",
                  title: liveLesson.title,
                  reviewStatus: liveLesson.reviewStatus || "IN_REVIEW",
                  isActive: Boolean(liveLesson.isActive),
                },
              }
            : draft
        )
      );
      onLessonCreated?.(liveLesson);
      setNotice("Đã tạo bài học từ draft. Bài học đang chờ duyệt.");
      setIsConvertModalOpen(false);
      setIsDrawerOpen(false);
    } catch (err: any) {
      setConvertError("Không tạo được bài học: " + (err.message || err));
    } finally {
      setIsConverting(false);
    }
  }

  return (
    <div className="lexi-cms-panel-card" style={{ background: "transparent", border: "none", boxShadow: "none", padding: 0 }}>
      <div className="lexi-cms-lessons-header-row">
        <div>
          <h1 className="lexi-cms-lessons-title">Trình tạo nội dung AI</h1>
          <p className="lexi-cms-lessons-desc">Sinh bản nháp từ nguồn pháp lý, duyệt nội dung và chuyển thành bài học.</p>
        </div>
      </div>
      {notice && <div className="lexi-inline-notice">{notice}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "24px", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="lexi-cms-lessons-filters" style={{ margin: 0 }}>
            <input type="text" placeholder="Tìm draft, nguồn pháp lý..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="lexi-cms-filter-select" style={{ width: "280px", border: "1px solid #e2e8f0", padding: "10px 14px", borderRadius: "8px" }} />
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="lexi-cms-filter-select">
              <option value="all">Tất cả trạng thái</option>
              {draftStatuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
            </select>
          </div>

          <div className="lexi-cms-table-wrapper" style={{ background: "#ffffff", borderRadius: "16px", padding: "16px", border: "1px solid #e2e8f0" }}>
            <table className="lexi-cms-table">
              <thead><tr><th>Tên draft</th><th>Nguồn</th><th>Trạng thái</th><th style={{ textAlign: "right" }}>Duyệt</th></tr></thead>
              <tbody>
                {filteredDrafts.map((draft) => (
                  <tr key={draft.id}>
                    <td><strong>{draft.title}</strong><br /><span style={{ color: "#94a3b8", fontSize: 11 }}>{draft.updatedAt ? formatDate(draft.updatedAt) : "-"}</span></td>
                    <td>{sourceTitle(draft)}</td>
                    <td><span className={`lexi-cms-badge-status ${statusClass(draft.status)}`}>{statusLabel(draft.status)}</span></td>
                    <td style={{ textAlign: "right" }}><button className="lexi-cms-lesson-card-btn-edit" style={{ position: "static", transform: "none" }} onClick={() => void openDraft(draft)}><Eye size={14} /></button></td>
                  </tr>
                ))}
                {!filteredDrafts.length && <tr><td colSpan={4} style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>Chưa có draft.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <form className="panel lexi-settings-panel" onSubmit={handleGenerate} style={{ margin: 0, background: "#ffffff", borderRadius: "16px", padding: "20px", border: "1px solid #cbd5e1" }}>
          <h2 style={{ display: "flex", alignItems: "center", gap: 10, margin: 0 }}><BrainCircuit size={20} /> Tạo draft AI</h2>
          {genError && <div className="status-toast error" style={{ marginTop: 12 }}><AlertCircle size={16} />{genError}</div>}
          <div className="lexi-form-field"><label>Nguồn pháp lý</label><select value={selectedSourceId} onChange={(event) => setSelectedSourceId(event.target.value)} required style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }}><option value="">-- Chọn nguồn --</option>{sources.map((source) => <option key={source.id} value={source.id}>{source.title}</option>)}</select></div>
          <div className="lexi-form-field"><label>Gợi ý tiêu đề</label><input value={titleHint} onChange={(event) => setTitleHint(event.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} /></div>
          <div className="lexi-form-field"><label>Số câu hỏi</label><input type="number" min={1} max={10} value={questionCount} onChange={(event) => setQuestionCount(Number(event.target.value))} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} /></div>
          <button className="lexi-btn-save-settings" type="submit" disabled={isGenerating}>{isGenerating ? <><RefreshCw className="animate-spin" size={16} /> Đang tạo...</> : <><Sparkles size={16} /> Tạo draft</>}</button>
        </form>
      </div>

      {isDrawerOpen && selectedDraft && (
        <div className="lexi-cms-drawer-overlay lexi-animate-fade" onClick={() => setIsDrawerOpen(false)}>
          <div className="lexi-cms-drawer-card" onClick={(event) => event.stopPropagation()} style={{ width: "min(720px, calc(100vw - 32px))", padding: 24 }}>
            <div className="lexi-cms-drawer-header"><h3>Duyệt draft bài học</h3><button type="button" onClick={() => setIsDrawerOpen(false)} style={{ background: "transparent", border: "none", fontSize: 18 }}>&times;</button></div>
            {isLoadingDraft && <div className="lexi-inline-notice">Đang tải draft...</div>}
            {saveError && <p className="form-error">{saveError}</p>}
            <form onSubmit={handleSaveDraft} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="lexi-cms-form-group"><label>Tên bài học</label><input className="lexi-cms-form-input" required value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} /></div>
              <div className="lexi-cms-form-group"><label>Nội dung bài học</label><textarea className="lexi-cms-form-input" rows={12} required value={draftContent} onChange={(event) => setDraftContent(event.target.value)} /></div>
              <div className="lexi-cms-form-group"><label>Ghi chú kiểm duyệt</label><textarea className="lexi-cms-form-input" rows={3} value={reviewerNote} onChange={(event) => setReviewerNote(event.target.value)} /></div>
              <div className="lexi-cms-form-group"><label>Trạng thái</label><select className="lexi-cms-form-select" value={draftStatus} onChange={(event) => setDraftStatus(event.target.value)}>{draftStatuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}</select></div>
              {selectedDraft.questions?.length ? <div className="lexi-inline-notice">Draft có {selectedDraft.questions.length} câu hỏi AI.</div> : null}
              <div className="lexi-cms-drawer-actions">
                <button className="lexi-cms-btn-save" type="submit" disabled={isSaving}>{isSaving ? "Đang lưu..." : "Lưu duyệt"}</button>
                {draftStatus === "ACCEPTED" && !selectedDraft.createdLesson && <button className="lexi-cms-btn-save" type="button" onClick={openConvertModal} style={{ background: "#059669" }}><PlayCircle size={16} /> Tạo bài học</button>}
                {selectedDraft.createdLesson && <span className="lexi-inline-notice"><CheckCircle2 size={16} /> Đã tạo bài học</span>}
              </div>
            </form>
          </div>
        </div>
      )}

      {isConvertModalOpen && (
        <div className="lexi-pricing-modal-overlay lexi-animate-fade" onClick={() => setIsConvertModalOpen(false)}>
          <div className="modal-card panel-card" onClick={(event) => event.stopPropagation()} style={{ width: 480, padding: 24 }}>
            <h3>Tạo bài học từ draft</h3>
            {convertError && <p className="form-error">{convertError}</p>}
            <form onSubmit={handleConvert} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="lexi-cms-form-group"><label>Khóa học đích</label><select className="lexi-cms-form-select" value={targetModuleId} onChange={(event) => setTargetModuleId(event.target.value)} required><option value="">-- Chọn khóa học --</option>{moduleOptions.map((module) => <option key={module.id} value={module.id}>{module.title}</option>)}</select></div>
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}><div className="lexi-cms-form-group"><label>Slug</label><input className="lexi-cms-form-input" required value={slug} onChange={(event) => setSlug(event.target.value)} /></div><div className="lexi-cms-form-group"><label>Thứ tự</label><input className="lexi-cms-form-input" type="number" min={0} required value={sortOrder} onChange={(event) => setSortOrder(Number(event.target.value))} /></div></div>
              <div className="lexi-cms-drawer-actions"><button className="lexi-cms-btn-save" type="submit" disabled={isConverting}>{isConverting ? "Đang tạo..." : "Xác nhận"}</button><button className="lexi-cms-btn-cancel" type="button" onClick={() => setIsConvertModalOpen(false)}>Hủy</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
