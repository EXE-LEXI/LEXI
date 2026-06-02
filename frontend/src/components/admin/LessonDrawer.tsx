import React, { useState } from "react";
import type { AdminLesson } from "../../api/admin";
import { updateAdminLesson } from "../../api/admin";

type LessonDrawerProps = {
  lesson: AdminLesson;
  token: string;
  onClose: () => void;
  onSave: (updated: AdminLesson) => void;
};

export function LessonDrawer({
  lesson,
  token,
  onClose,
  onSave,
}: LessonDrawerProps) {
  const [localLesson, setLocalLesson] = useState<AdminLesson>({ ...lesson });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const updated = await updateAdminLesson(token, localLesson.id, {
        title: localLesson.title,
        reviewStatus: localLesson.reviewStatus,
        isActive: localLesson.isActive,
      });

      onSave({ ...localLesson, ...updated });
      onClose();
    } catch (err: any) {
      setError("Khong cap nhat duoc bai hoc: " + (err.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="lexi-cms-drawer-overlay" onClick={onClose}>
      <div className="lexi-cms-drawer" onClick={(event) => event.stopPropagation()}>
        <div className="lexi-cms-drawer-header">
          <h3>Hieu chinh thong tin bai hoc</h3>
          <button
            style={{ background: "transparent", border: "none", fontSize: "18px", color: "#94a3b8", cursor: "pointer" }}
            onClick={onClose}
            type="button"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <p className="form-error">{error}</p>}

          <div className="lexi-cms-form-group">
            <label>Tieu de bai hoc</label>
            <input
              required
              type="text"
              className="lexi-cms-form-input"
              value={localLesson.title}
              onChange={(event) => setLocalLesson((prev) => ({ ...prev, title: event.target.value }))}
            />
          </div>

          <div className="lexi-cms-form-group">
            <label>Duong dan tinh (Slug)</label>
            <input
              type="text"
              className="lexi-cms-form-input"
              style={{ background: "#f1f5f9", color: "#64748b" }}
              readOnly
              value={localLesson.slug || ""}
            />
          </div>

          <div className="lexi-cms-form-group">
            <label>Trang thai duyet bai viet</label>
            <select
              className="lexi-cms-form-select"
              value={localLesson.reviewStatus || "DRAFT"}
              onChange={(event) => setLocalLesson((prev) => ({ ...prev, reviewStatus: event.target.value as any }))}
            >
              <option value="DRAFT">Nhap (DRAFT)</option>
              <option value="PENDING_REVIEW">Dang cho duyet (PENDING)</option>
              <option value="APPROVED">Da phe duyet (APPROVED)</option>
            </select>
          </div>

          <div className="lexi-cms-form-group">
            <label>Trang thai phat hanh</label>
            <select
              className="lexi-cms-form-select"
              value={localLesson.isActive ? "true" : "false"}
              onChange={(event) => setLocalLesson((prev) => ({ ...prev, isActive: event.target.value === "true" }))}
            >
              <option value="true">Hoat dong cong khai</option>
              <option value="false">Tam an bai hoc</option>
            </select>
          </div>

          <div className="lexi-cms-drawer-actions">
            <button type="submit" className="lexi-cms-btn-save" disabled={isSaving}>
              {isSaving ? "Dang luu..." : "Luu thay doi"}
            </button>
            <button type="button" className="lexi-cms-btn-cancel" onClick={onClose}>
              Huy bo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
