import React, { useState } from "react";
import type { AdminQuestion, AdminQuestionPayload } from "../../api/admin";
import { createAdminQuestion, updateAdminQuestion } from "../../api/admin";

type QuestionDrawerForm = {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOptionIndex: number;
  explanation: string;
};

type QuestionDrawerProps = {
  token: string;
  selectedLessonIdForQuiz: string;
  initialData: QuestionDrawerForm | null;
  onClose: () => void;
  onSave: (savedQuestion: AdminQuestion, isEdit: boolean) => void;
};

export function QuestionDrawer({
  token,
  selectedLessonIdForQuiz,
  initialData,
  onClose,
  onSave,
}: QuestionDrawerProps) {
  const [form, setForm] = useState<QuestionDrawerForm>(
    initialData || {
      id: "",
      questionText: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctOptionIndex: 0,
      explanation: "",
    }
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedLessonIdForQuiz) {
      setError("Vui long chon mot khoa hoc phap ly cu the truoc khi them hoac sua cau hoi.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const options = [
        { id: form.id ? "opt-a" : undefined, text: form.optionA, isCorrect: form.correctOptionIndex === 0 },
        { id: form.id ? "opt-b" : undefined, text: form.optionB, isCorrect: form.correctOptionIndex === 1 },
        { id: form.id ? "opt-c" : undefined, text: form.optionC, isCorrect: form.correctOptionIndex === 2 },
        { id: form.id ? "opt-d" : undefined, text: form.optionD, isCorrect: form.correctOptionIndex === 3 },
      ];

      const payload: AdminQuestionPayload = {
        text: form.questionText,
        options,
        explanation: form.explanation,
      };

      if (form.id) {
        const updated = await updateAdminQuestion(token, form.id, payload);
        onSave(updated, true);
      } else {
        const created = await createAdminQuestion(token, selectedLessonIdForQuiz, payload);
        onSave(created, false);
      }
      onClose();
    } catch (err: any) {
      setError("Khong luu duoc cau hoi: " + (err.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="lexi-cms-drawer-overlay" onClick={onClose}>
      <div className="lexi-cms-drawer" onClick={(event) => event.stopPropagation()}>
        <div className="lexi-cms-drawer-header">
          <h3>{form.id ? "Hieu chinh cau hoi" : "Them cau hoi moi"}</h3>
          <button
            className="lexi-cms-btn-icon-action"
            onClick={onClose}
            style={{ fontSize: "20px", fontWeight: "bold" }}
            type="button"
          >
            &times;
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "18px", flex: 1, overflowY: "auto", paddingRight: "6px" }}
        >
          {error && <p className="form-error">{error}</p>}

          <div className="lexi-cms-form-group">
            <label>Noi dung cau hoi</label>
            <textarea
              required
              rows={4}
              className="lexi-cms-form-textarea"
              placeholder="Nhap noi dung tinh huong hoac cau hoi trac nghiem..."
              value={form.questionText}
              onChange={(event) => setForm((prev) => ({ ...prev, questionText: event.target.value }))}
            />
          </div>

          <div className="lexi-cms-form-group">
            <label>Cac phuong an tra loi va dap an dung</label>

            {[
              ["optionA", 0, "Phuong an A"],
              ["optionB", 1, "Phuong an B"],
              ["optionC", 2, "Phuong an C"],
              ["optionD", 3, "Phuong an D"],
            ].map(([field, index, placeholder]) => (
              <div className="lexi-cms-option-row" key={field}>
                <input
                  type="radio"
                  name="correctOpt"
                  className="lexi-cms-option-radio"
                  checked={form.correctOptionIndex === index}
                  onChange={() => setForm((prev) => ({ ...prev, correctOptionIndex: index as number }))}
                />
                <input
                  required
                  type="text"
                  className="lexi-cms-form-input"
                  placeholder={placeholder as string}
                  value={form[field as keyof QuestionDrawerForm] as string}
                  onChange={(event) => setForm((prev) => ({ ...prev, [field as string]: event.target.value }))}
                />
              </div>
            ))}
          </div>

          <div className="lexi-cms-form-group">
            <label>Can cu phap ly va giai thich</label>
            <textarea
              required
              rows={3}
              className="lexi-cms-form-textarea"
              placeholder="Nhap can cu va giai thich phap ly chi tiet..."
              value={form.explanation}
              onChange={(event) => setForm((prev) => ({ ...prev, explanation: event.target.value }))}
            />
          </div>

          <div className="lexi-cms-drawer-actions">
            <button className="lexi-cms-btn-save" type="submit" disabled={isSaving}>
              {isSaving ? "Dang luu..." : "Luu cau hoi"}
            </button>
            <button className="lexi-cms-btn-cancel" type="button" onClick={onClose}>
              Huy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
