import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, Edit, Eye, FileText, Globe, Plus, RefreshCw, Search, Sparkles, Trash2 } from "lucide-react";
import type { AdminModule, AdminSource } from "../../api/admin";
import {
  createAdminSource,
  crawlAdminSources,
  deleteAdminSource,
  generateAdminLessonDraft,
  getAdminSource,
  updateAdminSource,
} from "../../api/admin";
import { formatDate } from "../../utils/format";

type SourcesTabProps = {
  token: string;
  initialSources: AdminSource[];
  modules: AdminModule[];
};

function documentNo(source: AdminSource) {
  return source.legalDocumentNo || source.documentNo || "";
}

function statusLabel(status?: string) {
  if (status === "CRAWLED") return "Đã cào";
  if (status === "FAILED") return "Thất bại";
  if (status === "ARCHIVED") return "Lưu trữ";
  return "Đang chờ";
}

export function SourcesTab({ token, initialSources, modules }: SourcesTabProps) {
  const [sources, setSources] = useState<AdminSource[]>(initialSources);
  const [searchQuery, setSearchQuery] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [crawlUrls, setCrawlUrls] = useState("");
  const [crawlModuleId, setCrawlModuleId] = useState("");
  const [generateDrafts, setGenerateDrafts] = useState(true);
  const [questionCount, setQuestionCount] = useState(5);
  const [isCrawling, setIsCrawling] = useState(false);

  const [editingSource, setEditingSource] = useState<AdminSource | null>(null);
  const [detailSource, setDetailSource] = useState<AdminSource | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [legalDocumentNo, setLegalDocumentNo] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);

  useEffect(() => setSources(initialSources), [initialSources]);

  const filteredSources = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    return sources.filter((source) =>
      !keyword ||
      source.title.toLowerCase().includes(keyword) ||
      documentNo(source).toLowerCase().includes(keyword) ||
      (source.sourceUrl || "").toLowerCase().includes(keyword)
    );
  }, [sources, searchQuery]);

  function openCreateDrawer() {
    setEditingSource(null);
    setTitle("");
    setLegalDocumentNo("");
    setEffectiveDate("");
    setSourceUrl("");
    setRawText("");
    setError(null);
    setIsDrawerOpen(true);
  }

  async function openEditDrawer(source: AdminSource) {
    setEditingSource(source);
    setTitle(source.title);
    setLegalDocumentNo(documentNo(source));
    setEffectiveDate(source.effectiveDate?.slice(0, 10) || "");
    setSourceUrl(source.sourceUrl || "");
    setRawText(source.rawText || "");
    setIsDrawerOpen(true);
    if (!source.rawText) {
      try {
        const detail = await getAdminSource(token, source.id);
        setEditingSource(detail);
        setRawText(detail.rawText || "");
        setSources((prev) => prev.map((item) => (item.id === detail.id ? detail : item)));
      } catch (err: any) {
        setError("Không tải được nguồn: " + (err.message || err));
      }
    }
  }

  async function openDetailDrawer(source: AdminSource) {
    setDetailSource(source);
    setIsDetailLoading(true);
    setError(null);
    try {
      const detail = await getAdminSource(token, source.id);
      setDetailSource(detail);
      setSources((prev) => prev.map((item) => (item.id === detail.id ? detail : item)));
    } catch (err: any) {
      setError("Không tải được nội dung đã cào: " + (err.message || err));
    } finally {
      setIsDetailLoading(false);
    }
  }

  async function handleCrawl(event: React.FormEvent) {
    event.preventDefault();
    const urls = crawlUrls.split(/\r?\n/).map((url) => url.trim()).filter(Boolean);
    if (!urls.length) {
      setError("Vui lòng nhập ít nhất một URL.");
      return;
    }
    setIsCrawling(true);
    setError(null);
    setNotice(null);
    try {
      const result = await crawlAdminSources(token, {
        urls,
        moduleId: crawlModuleId || null,
        generateDrafts,
        questionCount,
      });
      setSources((prev) => {
        const byId = new Map(prev.map((item) => [item.id, item]));
        for (const source of result.sources) byId.set(source.id, source);
        return Array.from(byId.values());
      });
      setCrawlUrls("");
      setNotice(`Đã cào ${result.sources.length} nguồn. Tạo ${result.drafts.length} draft AI. Lỗi: ${result.errors.length}.`);
    } catch (err: any) {
      setError("Không cào được nguồn: " + (err.message || err));
    } finally {
      setIsCrawling(false);
    }
  }

  async function handleSaveSource(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim() || !rawText.trim()) {
      setError("Vui lòng nhập tiêu đề và nội dung văn bản.");
      return;
    }
    setIsSaving(true);
    setError(null);
    setNotice(null);
    const payload = {
      title: title.trim(),
      legalDocumentNo: legalDocumentNo.trim() || null,
      effectiveDate: effectiveDate || null,
      sourceUrl: sourceUrl.trim() || null,
      rawText,
      crawlStatus: "CRAWLED",
      crawledAt: new Date().toISOString(),
    };
    try {
      if (editingSource) {
        const updated = await updateAdminSource(token, editingSource.id, payload);
        setSources((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        setNotice("Đã cập nhật nguồn pháp lý.");
      } else {
        const created = await createAdminSource(token, payload);
        setSources((prev) => [created, ...prev]);
        setNotice("Đã thêm nguồn pháp lý.");
      }
      setIsDrawerOpen(false);
    } catch (err: any) {
      setError("Không lưu được nguồn: " + (err.message || err));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleGenerateDraft(source: AdminSource) {
    setIsGeneratingDraft(true);
    setError(null);
    setNotice(null);
    try {
      await generateAdminLessonDraft(token, {
        sourceDocumentId: source.id,
        questionCount,
      });
      setNotice("Đã tạo bản nháp AI. Vào tab Trình tạo nội dung AI để duyệt.");
      setDetailSource(null);
    } catch (err: any) {
      setError("Không tạo được draft AI: " + (err.message || err));
    } finally {
      setIsGeneratingDraft(false);
    }
  }

  async function handleDeleteSource(sourceId: string) {
    if (!window.confirm("Bạn có chắc muốn xóa nguồn pháp lý này?")) return;
    try {
      await deleteAdminSource(token, sourceId);
      setSources((prev) => prev.filter((source) => source.id !== sourceId));
      setNotice("Đã xóa nguồn pháp lý.");
    } catch (err: any) {
      setError("Không xóa được nguồn: " + (err.message || err));
    }
  }

  return (
    <div className="lexi-cms-panel-card" style={{ background: "transparent", border: "none", boxShadow: "none", padding: 0 }}>
      <div className="lexi-cms-lessons-header-row">
        <div>
          <h1 className="lexi-cms-lessons-title">Nguồn pháp lý</h1>
          <p className="lexi-cms-lessons-desc">Cào, kiểm tra và chuẩn hóa văn bản gốc trước khi tạo bài học.</p>
        </div>
        <button className="lexi-cms-btn-create-course" onClick={openCreateDrawer}>
          <Plus size={16} />
          <span>Thêm thủ công</span>
        </button>
      </div>

      {notice && <div className="lexi-inline-notice">{notice}</div>}
      {error && !isDrawerOpen && <p className="form-error">{error}</p>}

      <form className="panel lexi-settings-panel" onSubmit={handleCrawl} style={{ marginBottom: "20px", background: "#ffffff" }}>
        <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Globe size={18} /> <span>Cào nguồn từ URL</span>
        </h2>
        <div className="lexi-form-field">
          <label>URL văn bản pháp lý, mỗi dòng một URL</label>
          <textarea rows={4} value={crawlUrls} onChange={(event) => setCrawlUrls(event.target.value)} placeholder="https://vanban.chinhphu.vn/..." style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", resize: "vertical" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 160px", gap: "16px", alignItems: "end" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}>
            <input type="checkbox" checked={generateDrafts} onChange={(event) => setGenerateDrafts(event.target.checked)} />
            Tự tạo draft AI
          </label>
          <div className="lexi-form-field">
            <label>Gắn vào khóa học</label>
            <select value={crawlModuleId} onChange={(event) => setCrawlModuleId(event.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
              <option value="">Chọn sau</option>
              {modules.map((module) => <option key={module.id} value={module.id}>{module.title}</option>)}
            </select>
          </div>
          <div className="lexi-form-field">
            <label>Số câu hỏi</label>
            <input type="number" min={1} max={10} value={questionCount} onChange={(event) => setQuestionCount(Number(event.target.value))} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
          </div>
        </div>
        <button className="lexi-btn-save-settings" type="submit" disabled={isCrawling}>
          {isCrawling ? <><RefreshCw className="animate-spin" size={16} /> Đang cào...</> : <><Sparkles size={16} /> Cào nguồn pháp lý</>}
        </button>
      </form>

      <div className="lexi-cms-lessons-filters" style={{ marginBottom: "20px" }}>
        <div className="lexi-cms-filter-select-wrapper">
          <Search size={14} className="lexi-cms-filter-icon" />
          <input type="text" placeholder="Tìm nguồn..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="lexi-cms-filter-select" style={{ width: "280px", border: "1px solid #e2e8f0", paddingLeft: "30px", borderRadius: "8px" }} />
        </div>
      </div>

      <div className="lexi-cms-table-wrapper" style={{ background: "#ffffff", borderRadius: "16px", padding: "16px", border: "1px solid #e2e8f0" }}>
        <table className="lexi-cms-table">
          <thead>
            <tr><th>Tên nguồn</th><th>Số hiệu</th><th>Trạng thái</th><th>Cập nhật</th><th style={{ textAlign: "right" }}>Thao tác</th></tr>
          </thead>
          <tbody>
            {filteredSources.map((source) => (
              <tr key={source.id}>
                <td><FileText size={16} style={{ verticalAlign: "middle", marginRight: 8 }} />{source.title}</td>
                <td>{documentNo(source) || "-"}</td>
                <td><span className={`lexi-cms-badge-status ${source.crawlStatus === "CRAWLED" ? "active" : source.crawlStatus === "FAILED" ? "inactive" : "pending"}`}>{statusLabel(source.crawlStatus)}</span></td>
                <td>{source.updatedAt ? formatDate(source.updatedAt) : "-"}</td>
                <td>
                  <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                    <button className="lexi-cms-lesson-card-btn-edit" style={{ position: "static", transform: "none" }} onClick={() => void openDetailDrawer(source)} title="Xem nội dung"><Eye size={14} /></button>
                    <button className="lexi-cms-lesson-card-btn-edit" style={{ position: "static", transform: "none" }} onClick={() => void openEditDrawer(source)} title="Sửa"><Edit size={14} /></button>
                    <button className="lexi-cms-lesson-card-btn-edit" style={{ position: "static", transform: "none", background: "#fef2f2", color: "#ef4444" }} onClick={() => void handleDeleteSource(source.id)} title="Xóa"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!filteredSources.length && <tr><td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>Chưa có nguồn pháp lý.</td></tr>}
          </tbody>
        </table>
      </div>

      {isDrawerOpen && (
        <div className="lexi-cms-drawer-overlay lexi-animate-fade" onClick={() => setIsDrawerOpen(false)}>
          <div className="lexi-cms-drawer-card" onClick={(event) => event.stopPropagation()} style={{ width: "min(640px, calc(100vw - 32px))", padding: "24px" }}>
            <div className="lexi-cms-drawer-header"><h3>{editingSource ? "Chỉnh sửa nguồn" : "Thêm nguồn thủ công"}</h3><button type="button" onClick={() => setIsDrawerOpen(false)} style={{ background: "transparent", border: "none", fontSize: "18px" }}>&times;</button></div>
            {error && <p className="form-error">{error}</p>}
            <form onSubmit={handleSaveSource} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="lexi-cms-form-group"><label>Tiêu đề</label><input className="lexi-cms-form-input" required value={title} onChange={(event) => setTitle(event.target.value)} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="lexi-cms-form-group"><label>Số hiệu</label><input className="lexi-cms-form-input" value={legalDocumentNo} onChange={(event) => setLegalDocumentNo(event.target.value)} /></div>
                <div className="lexi-cms-form-group"><label>Ngày hiệu lực</label><input className="lexi-cms-form-input" type="date" value={effectiveDate} onChange={(event) => setEffectiveDate(event.target.value)} /></div>
              </div>
              <div className="lexi-cms-form-group"><label>URL nguồn</label><input className="lexi-cms-form-input" type="url" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} /></div>
              <div className="lexi-cms-form-group"><label>Nội dung văn bản</label><textarea className="lexi-cms-form-input" rows={10} required value={rawText} onChange={(event) => setRawText(event.target.value)} /></div>
              <div className="lexi-cms-drawer-actions"><button className="lexi-cms-btn-save" type="submit" disabled={isSaving}>{isSaving ? "Đang lưu..." : "Lưu nguồn"}</button><button className="lexi-cms-btn-cancel" type="button" onClick={() => setIsDrawerOpen(false)}>Hủy</button></div>
            </form>
          </div>
        </div>
      )}

      {detailSource && (
        <div className="lexi-cms-drawer-overlay lexi-animate-fade" onClick={() => setDetailSource(null)}>
          <div className="lexi-cms-drawer-card" onClick={(event) => event.stopPropagation()} style={{ width: "min(760px, calc(100vw - 32px))", padding: "24px" }}>
            <div className="lexi-cms-drawer-header"><h3>Nội dung đã cào</h3><button type="button" onClick={() => setDetailSource(null)} style={{ background: "transparent", border: "none", fontSize: "18px" }}>&times;</button></div>
            {isDetailLoading ? <div className="lexi-inline-notice">Đang tải...</div> : <>
              <p style={{ color: "#64748b" }}>{detailSource.title}</p>
              <textarea readOnly rows={16} value={detailSource.normalizedText || detailSource.rawText || ""} className="lexi-cms-form-input" style={{ resize: "vertical", lineHeight: 1.6 }} />
              <div className="lexi-cms-drawer-actions">
                <button className="lexi-cms-btn-save" type="button" disabled={isGeneratingDraft} onClick={() => void handleGenerateDraft(detailSource)}>{isGeneratingDraft ? "Đang tạo..." : "Tạo draft AI"}</button>
                <button className="lexi-cms-btn-cancel" type="button" onClick={() => void openEditDrawer(detailSource)}>Sửa nguồn</button>
              </div>
            </>}
          </div>
        </div>
      )}
    </div>
  );
}
