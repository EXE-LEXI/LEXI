import React, { useMemo, useState } from "react";
import { Edit, Layers, Plus, Search, X, Folder, Hash, Sparkles, Link, CheckCircle2, AlertCircle } from "lucide-react";
import type { AdminCategory, AdminModule, AdminModulePayload } from "../../api/admin";
import { createAdminModule, updateAdminModule } from "../../api/admin";
import { formatDate } from "../../utils/format";

type ModulesTabProps = {
  token: string;
  categories: AdminCategory[];
  initialModules: AdminModule[];
  searchQuery: string;
  onModulesChange?: (modules: AdminModule[]) => void;
};

function buildSlug(title: string) {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

export function ModulesTab({
  token,
  categories,
  initialModules,
  searchQuery,
  onModulesChange,
}: ModulesTabProps) {
  const [modules, setModules] = useState<AdminModule[]>(initialModules);
  const [editingModule, setEditingModule] = useState<AdminModule | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    setModules(initialModules);
  }, [initialModules]);

  const filteredModules = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    return modules.filter((module) => {
      const matchesSearch =
        !keyword ||
        module.title.toLowerCase().includes(keyword) ||
        module.slug.toLowerCase().includes(keyword) ||
        (module.description || "").toLowerCase().includes(keyword) ||
        module.category.title.toLowerCase().includes(keyword);
      const matchesCategory =
        categoryFilter === "all" || module.categoryId === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [modules, searchQuery, categoryFilter]);

  function syncModules(nextModules: AdminModule[]) {
    setModules(nextModules);
    onModulesChange?.(nextModules);
  }

  function openCreateDrawer() {
    setEditingModule(null);
    setCategoryId(categories[0]?.id || "");
    setTitle("");
    setSlug("");
    setDescription("");
    setSortOrder(0);
    setIsActive(true);
    setError(null);
    setIsDrawerOpen(true);
  }

  function openEditDrawer(module: AdminModule) {
    setEditingModule(module);
    setCategoryId(module.categoryId);
    setTitle(module.title);
    setSlug(module.slug);
    setDescription(module.description || "");
    setSortOrder(module.sortOrder);
    setIsActive(module.isActive);
    setError(null);
    setIsDrawerOpen(true);
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!editingModule && !slug.trim()) {
      setSlug(buildSlug(value));
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!categoryId) {
      setError("Vui lòng chọn danh mục cho khóa học.");
      return;
    }
    if (!title.trim()) {
      setError("Vui lòng nhập tên khóa học.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setNotice(null);

    const payload: AdminModulePayload = {
      categoryId,
      title: title.trim(),
      slug: slug.trim() || null,
      description: description.trim() || null,
      sortOrder,
      isActive,
    };

    try {
      if (editingModule) {
        const updated = await updateAdminModule(token, editingModule.id, payload);
        syncModules(
          modules.map((module) => (module.id === updated.id ? updated : module))
        );
        setNotice("Đã cập nhật khóa học.");
      } else {
        const created = await createAdminModule(token, payload);
        syncModules([created, ...modules]);
        setNotice("Đã tạo khóa học mới.");
      }
      setIsDrawerOpen(false);
    } catch (err: any) {
      setError("Không lưu được khóa học: " + (err.message || err));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="lexi-cms-panel-card" style={{ background: "transparent", border: "none", boxShadow: "none", padding: 0 }}>
      <div className="lexi-cms-lessons-header-row">
        <div>
          <h1 className="lexi-cms-lessons-title">Khóa học</h1>
          <p className="lexi-cms-lessons-desc">
            Tạo module/khóa học trước, sau đó thêm bài học và quiz vào từng khóa học.
          </p>
        </div>
        <button className="lexi-cms-btn-create-course" onClick={openCreateDrawer}>
          <Plus size={16} />
          <span>Tạo khóa học mới</span>
        </button>
      </div>

      {notice && <div className="lexi-inline-notice">{notice}</div>}
      {error && !isDrawerOpen && <p className="form-error">{error}</p>}

      <div className="lexi-cms-lessons-filters">
        <div className="lexi-cms-filter-select-wrapper">
          <Search size={14} className="lexi-cms-filter-icon" />
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="lexi-cms-filter-select"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="lexi-cms-table-wrapper" style={{ background: "#ffffff", borderRadius: "16px", padding: "16px", border: "1px solid #e2e8f0" }}>
        <table className="lexi-cms-table">
          <thead>
            <tr>
              <th>Tên khóa học</th>
              <th>Danh mục</th>
              <th>Bài học</th>
              <th>Trạng thái</th>
              <th>Cập nhật</th>
              <th style={{ textAlign: "right" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredModules.map((module) => (
              <tr key={module.id}>
                <td>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <Layers size={18} style={{ color: "#4f46e5" }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <strong>{module.title}</strong>
                      <span style={{ color: "#64748b", fontSize: "12px" }}>{module.slug}</span>
                    </div>
                  </div>
                </td>
                <td>{module.category.title}</td>
                <td>{module.lessonCount}</td>
                <td>
                  <span className={`lexi-cms-badge-status ${module.isActive ? "active" : "inactive"}`}>
                    {module.isActive ? "Đang mở" : "Tạm ẩn"}
                  </span>
                </td>
                <td>{module.updatedAt ? formatDate(module.updatedAt) : "-"}</td>
                <td>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button className="lexi-cms-lesson-card-btn-edit" style={{ position: "static", transform: "none" }} onClick={() => openEditDrawer(module)} title="Chỉnh sửa khóa học">
                      <Edit size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!filteredModules.length && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "#94a3b8", padding: "40px" }}>
                  Chưa có khóa học phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isDrawerOpen && (
        <div className="lexi-premium-drawer-overlay" onClick={() => setIsDrawerOpen(false)}>
          <div className="lexi-premium-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="lexi-premium-drawer-header">
              <div className="lexi-premium-drawer-badge">KHÓA HỌC</div>
              <h3>{editingModule ? "Chỉnh sửa khóa học" : "Tạo khóa học mới"}</h3>
              <p className="lexi-premium-drawer-sub">Cấu hình các thông tin cơ bản và cài đặt hiển thị của khóa học trong hệ thống.</p>
              <button className="lexi-premium-drawer-close" type="button" onClick={() => setIsDrawerOpen(false)} aria-label="Đóng">
                <X size={18} />
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

                <div className="lexi-premium-form-card">
                  <div className="lexi-premium-form-card-title">
                    <Layers size={15} style={{ color: "#4f46e5" }} />
                    <span>Thông tin cơ bản</span>
                  </div>

                  <div className="lexi-premium-form-group">
                    <label>Danh mục</label>
                    <div className="lexi-premium-input-wrapper">
                      <Folder className="lexi-premium-input-icon" size={16} />
                      <select className="lexi-premium-select" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} required>
                        <option value="">-- Chọn danh mục --</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="lexi-premium-grid-2">
                    <div className="lexi-premium-form-group">
                      <label>Tên khóa học</label>
                      <div className="lexi-premium-input-wrapper">
                        <Sparkles className="lexi-premium-input-icon" size={16} />
                        <input className="lexi-premium-input" placeholder="Nhập tên khóa học..." required value={title} onChange={(event) => handleTitleChange(event.target.value)} />
                      </div>
                    </div>

                    <div className="lexi-premium-form-group">
                      <label>Slug khóa học</label>
                      <div className="lexi-premium-input-wrapper">
                        <Link className="lexi-premium-input-icon" size={16} />
                        <input className="lexi-premium-input" placeholder="auto-generated-slug" value={slug} onChange={(event) => setSlug(event.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div className="lexi-premium-form-group">
                    <label>Mô tả ngắn</label>
                    <textarea className="lexi-premium-textarea" rows={4} placeholder="Tóm tắt mô tả nội dung khóa học..." value={description} onChange={(event) => setDescription(event.target.value)} />
                  </div>
                </div>

                <div className="lexi-premium-form-card">
                  <div className="lexi-premium-form-card-title">
                    <CheckCircle2 size={15} style={{ color: "#4f46e5" }} />
                    <span>Cấu hình hiển thị</span>
                  </div>

                  <div className="lexi-premium-grid-2">
                    <div className="lexi-premium-form-group">
                      <label>Thứ tự hiển thị</label>
                      <div className="lexi-premium-input-wrapper">
                        <Hash className="lexi-premium-input-icon" size={16} />
                        <input className="lexi-premium-input" type="number" min={0} value={sortOrder} onChange={(event) => setSortOrder(Number(event.target.value))} />
                      </div>
                      <span className="lexi-premium-helper-text">Số nhỏ hơn sẽ hiển thị trước.</span>
                    </div>

                    <div className="lexi-premium-form-group">
                      <label>Trạng thái kích hoạt</label>
                      <div className="lexi-premium-segmented">
                        <button
                          type="button"
                          className={`lexi-premium-segmented-btn show-active ${isActive ? "active" : ""}`}
                          onClick={() => setIsActive(true)}
                        >
                          <CheckCircle2 size={14} />
                          <span>Đang mở</span>
                        </button>
                        <button
                          type="button"
                          className={`lexi-premium-segmented-btn show-inactive ${!isActive ? "active" : ""}`}
                          onClick={() => setIsActive(false)}
                        >
                          <X size={14} />
                          <span>Tạm ẩn</span>
                        </button>
                      </div>
                      <span className="lexi-premium-helper-text">Khóa học tạm ẩn sẽ ẩn với học viên.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lexi-premium-drawer-actions">
                <button className="lexi-premium-btn-save" type="submit" disabled={isSaving}>
                  <CheckCircle2 size={16} />
                  <span>{isSaving ? "Đang lưu..." : editingModule ? "Lưu thay đổi" : "Tạo khóa học"}</span>
                </button>
                <button className="lexi-premium-btn-cancel" type="button" onClick={() => setIsDrawerOpen(false)}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ModulesTab;
