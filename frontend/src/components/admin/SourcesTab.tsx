import React, { useState } from "react";
import { Plus, Search, Sliders, Edit, Trash2, Globe, FileText, CheckCircle, RefreshCw, AlertCircle, Calendar } from "lucide-react";
import type { AdminSource } from "../../api/admin";
import { createAdminSource, updateAdminSource, deleteAdminSource } from "../../api/admin";
import { formatDate } from "../../utils/format";

type SourcesTabProps = {
  token: string;
  initialSources: AdminSource[];
};

export function SourcesTab({ token, initialSources }: SourcesTabProps) {
  const [sources, setSources] = useState<AdminSource[]>(initialSources);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Drawer Form State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<AdminSource | null>(null);
  
  // Form fields
  const [title, setTitle] = useState("");
  const [documentNo, setDocumentNo] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [crawlStatus, setCrawlStatus] = useState("COMPLETED");

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleOpenAddDrawer = () => {
    setEditingSource(null);
    setTitle("");
    setDocumentNo("");
    setEffectiveDate("");
    setSourceUrl("");
    setRawText("");
    setCrawlStatus("COMPLETED");
    setError(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEditDrawer = (src: AdminSource & { rawText?: string; effectiveDate?: string; sourceUrl?: string }) => {
    setEditingSource(src);
    setTitle(src.title);
    setDocumentNo(src.documentNo || "");
    setEffectiveDate(src.effectiveDate || "");
    setSourceUrl(src.sourceUrl || "");
    setRawText(src.rawText || "Nội dung văn bản quy phạm pháp luật...");
    setCrawlStatus(src.crawlStatus || "COMPLETED");
    setError(null);
    setIsDrawerOpen(true);
  };

  const handleSaveSourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !rawText.trim()) {
      setError("Vui lòng điền đầy đủ Tiêu đề và Nội dung văn bản.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setNotice(null);

    const payload = {
      title,
      documentNo: documentNo || null,
      effectiveDate: effectiveDate || null,
      sourceUrl: sourceUrl || null,
      rawText,
      crawlStatus,
    };

    try {
      if (editingSource) {
        // Edit Source
        const updated = await updateAdminSource(token, editingSource.id, payload);
        setSources((prev) => prev.map((s) => (s.id === editingSource.id ? updated : s)));
        setNotice("Da cap nhat nguon phap ly thanh cong.");
      } else {
        // Add Source
        const created = await createAdminSource(token, payload);
        setSources((prev) => [created, ...prev]);
        setNotice("Khoi tao nguon phap ly thanh cong.");
      }
      setIsDrawerOpen(false);
    } catch (err: any) {
      setError(err.message || "Lỗi lưu dữ liệu nguồn pháp lý.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSource = async (srcId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa nguồn pháp lý này? Hành vi này sẽ ảnh hưởng đến các bài học được liên kết.")) return;

    try {
      await deleteAdminSource(token, srcId);
      setSources((prev) => prev.filter((s) => s.id !== srcId));
      setNotice("Da xoa nguon phap ly thanh cong.");
    } catch (err: any) {
      setNotice(null);
      setError("Loi khi xoa nguon phap ly: " + (err.message || err));
    }
  };

  // Filter sources
  const filteredSources = sources.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.documentNo || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || s.crawlStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="lexi-cms-panel-card" style={{ background: "transparent", border: "none", boxShadow: "none", padding: 0 }}>
      
      {/* Header Row */}
      <div className="lexi-cms-lessons-header-row">
        <div>
          <h1 className="lexi-cms-lessons-title">Nguồn Pháp Lý & Quy Phạm</h1>
          <p className="lexi-cms-lessons-desc">Quản lý các nguồn luật, tài liệu gốc để huấn luyện AI hoặc phát triển bài giảng.</p>
        </div>
        <button className="lexi-cms-btn-create-course" onClick={handleOpenAddDrawer}>
          <Plus size={16} />
          <span>Thêm nguồn mới</span>
        </button>
      </div>

      {notice && <div className="lexi-inline-notice">{notice}</div>}
      {error && !isDrawerOpen && <p className="form-error">{error}</p>}

      {/* Filter and Search */}
      <div className="lexi-cms-lessons-filters" style={{ marginBottom: "20px" }}>
        <div className="lexi-cms-filter-select-wrapper">
          <Search size={14} className="lexi-cms-filter-icon" />
          <input
            type="text"
            placeholder="Tìm theo tên nguồn, số hiệu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="lexi-cms-filter-select"
            style={{ width: "240px", border: "1px solid #e2e8f0", paddingLeft: "30px", borderRadius: "8px" }}
          />
        </div>

        <div className="lexi-cms-filter-select-wrapper">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="lexi-cms-filter-select">
            <option value="all">Tất cả trạng thái crawl</option>
            <option value="PENDING">Đang chờ (PENDING)</option>
            <option value="RUNNING">Đang xử lý (RUNNING)</option>
            <option value="COMPLETED">Hoàn tất (COMPLETED)</option>
            <option value="FAILED">Thất bại (FAILED)</option>
          </select>
        </div>
      </div>

      {/* Grid or Table list */}
      <div className="lexi-cms-panel-content" style={{ marginTop: 0 }}>
        <div className="lexi-cms-table-wrapper" style={{ background: "#ffffff", borderRadius: "16px", padding: "16px", border: "1px solid #e2e8f0" }}>
          <table className="lexi-cms-table">
            <thead>
              <tr>
                <th>Tên nguồn luật</th>
                <th>Số hiệu văn bản</th>
                <th>Trạng thái crawl</th>
                <th>Ngày cập nhật</th>
                <th style={{ textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredSources.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <FileText size={18} style={{ color: "#3b82f6" }} />
                      <strong style={{ fontSize: "14px", color: "#1e293b" }}>{item.title}</strong>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: "13px", fontWeight: 550, color: "#64748b" }}>
                      {item.documentNo || "-"}
                    </span>
                  </td>
                  <td>
                    <span className={`lexi-cms-badge-status ${item.crawlStatus === "COMPLETED" ? "active" : item.crawlStatus === "FAILED" ? "inactive" : "pending"}`}>
                      {item.crawlStatus === "COMPLETED" ? "Hoàn tất" : item.crawlStatus === "FAILED" ? "Thất bại" : item.crawlStatus === "RUNNING" ? "Đang xử lý" : "Đang chờ"}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: "13px", color: "#64748b" }}>
                      {item.updatedAt ? formatDate(item.updatedAt) : "-"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <button className="lexi-cms-lesson-card-btn-edit" style={{ position: "static", transform: "none" }} onClick={() => handleOpenEditDrawer(item)} title="Chỉnh sửa">
                        <Edit size={14} />
                      </button>
                      <button className="lexi-cms-lesson-card-btn-edit" style={{ position: "static", transform: "none", background: "#fef2f2", color: "#ef4444" }} onClick={() => handleDeleteSource(item.id)} title="Xóa">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSources.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "#94a3b8", padding: "40px" }}>
                    Không tìm thấy nguồn luật pháp lý nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer Form Modal Overlay */}
      {isDrawerOpen && (
        <div className="lexi-cms-drawer-overlay lexi-animate-fade" onClick={() => setIsDrawerOpen(false)}>
          <div className="lexi-cms-drawer-card" onClick={(e) => e.stopPropagation()} style={{ width: "560px", padding: "24px" }}>
            
            <div className="drawer-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2>{editingSource ? "Chỉnh sửa Nguồn Pháp Lý" : "Khởi tạo Nguồn Pháp Lý Mới"}</h2>
              <button onClick={() => setIsDrawerOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#94a3b8" }}>&times;</button>
            </div>

            {error && (
              <div className="status-toast error" style={{ marginBottom: "16px" }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveSourceSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              <div className="lexi-form-field">
                <label>Tiêu đề văn bản nguồn</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Bộ luật Dân sự 2015"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="lexi-form-field">
                  <label>Số hiệu văn bản</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 91/2015/QH13"
                    value={documentNo}
                    onChange={(e) => setDocumentNo(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  />
                </div>

                <div className="lexi-form-field">
                  <label>Ngày có hiệu lực</label>
                  <input
                    type="date"
                    value={effectiveDate ? effectiveDate.slice(0, 10) : ""}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div className="lexi-form-field">
                <label>Đường dẫn gốc văn bản (Source URL)</label>
                <input
                  type="url"
                  placeholder="https://vanban.chinhphu.vn/..."
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div className="lexi-form-field">
                <label>Nội dung chi tiết văn bản (Raw Text)</label>
                <textarea
                  required
                  rows={8}
                  placeholder="Dán toàn bộ nội dung điều khoản, chương mục của văn bản pháp lý tại đây..."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", resize: "vertical", fontFamily: "monospace", fontSize: "12px" }}
                />
              </div>

              <div className="lexi-form-field">
                <label>Trạng thái Crawl</label>
                <select value={crawlStatus} onChange={(e) => setCrawlStatus(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                  <option value="PENDING">Đang chờ (PENDING)</option>
                  <option value="RUNNING">Đang xử lý (RUNNING)</option>
                  <option value="COMPLETED">Hoàn tất (COMPLETED)</option>
                  <option value="FAILED">Thất bại (FAILED)</option>
                </select>
              </div>

              <button className="lexi-btn-save-settings" type="submit" disabled={isSaving} style={{ marginTop: "10px" }}>
                {isSaving ? (
                  <>
                    <RefreshCw className="animate-spin" size={16} />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <span>{editingSource ? "Cập nhật nguồn" : "Khởi tạo nguồn"}</span>
                )}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
