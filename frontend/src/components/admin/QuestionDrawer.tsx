import React, { useState } from "react";
import type { AdminQuestion, AdminQuestionPayload, AdminLesson } from "../../api/admin";
import { createAdminQuestion, updateAdminQuestion } from "../../api/admin";
import { X, Save, BookOpen, FileText, CheckCircle2, AlertCircle, Edit3, HelpCircle } from "lucide-react";

type QuestionDrawerProps = {
  token: string;
  selectedLessonIdForQuiz: string;
  initialData: AdminQuestion | null;
  lessons: AdminLesson[];
  onClose: () => void;
  onSave: (savedQuestion: AdminQuestion, isEdit: boolean) => void;
};

export function QuestionDrawer({
  token,
  selectedLessonIdForQuiz,
  initialData,
  lessons,
  onClose,
  onSave,
}: QuestionDrawerProps) {
  const isEdit = !!initialData?.id;

  const [lessonId, setLessonId] = useState(
    selectedLessonIdForQuiz || (lessons[0]?.id || "")
  );

  const [questionText, setQuestionText] = useState(initialData?.text || "");
  const [optionA, setOptionA] = useState(initialData?.options[0]?.text || "");
  const [optionB, setOptionB] = useState(initialData?.options[1]?.text || "");
  const [optionC, setOptionC] = useState(initialData?.options[2]?.text || "");
  const [optionD, setOptionD] = useState(initialData?.options[3]?.text || "");
  const [correctOptionIndex, setCorrectOptionIndex] = useState(
    initialData?.options ? Math.max(0, initialData.options.findIndex((opt) => opt.isCorrect)) : 0
  );
  const [explanation, setExplanation] = useState(initialData?.explanation || "");

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!lessonId) {
      setError("Vui lòng chọn một bài học cụ thể để gắn câu hỏi.");
      return;
    }
    if (!questionText.trim()) {
      setError("Vui lòng nhập nội dung câu hỏi.");
      return;
    }
    if (!optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      setError("Vui lòng điền đầy đủ cả 4 phương án trả lời.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const options = [
        { id: initialData?.options[0]?.id, text: optionA.trim(), isCorrect: correctOptionIndex === 0 },
        { id: initialData?.options[1]?.id, text: optionB.trim(), isCorrect: correctOptionIndex === 1 },
        { id: initialData?.options[2]?.id, text: optionC.trim(), isCorrect: correctOptionIndex === 2 },
        { id: initialData?.options[3]?.id, text: optionD.trim(), isCorrect: correctOptionIndex === 3 },
      ];

      const payload: AdminQuestionPayload = {
        text: questionText.trim(),
        options,
        explanation: explanation.trim() || null,
      };

      if (isEdit && initialData?.id) {
        const updated = await updateAdminQuestion(token, initialData.id, payload);
        onSave(updated, true);
      } else {
        const created = await createAdminQuestion(token, lessonId, payload);
        onSave(created, false);
      }
      onClose();
    } catch (err: any) {
      setError("Không lưu được câu hỏi: " + (err.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="lexi-premium-drawer-overlay" onClick={onClose}>
      <div className="lexi-premium-drawer" onClick={(event) => event.stopPropagation()} style={{ width: "min(640px, 100vw)" }}>
        <div className="lexi-premium-drawer-header">
          <div className="lexi-premium-drawer-badge">CÂU HỎI</div>
          <h3>{isEdit ? "Hiệu chỉnh câu hỏi" : "Thêm câu hỏi mới"}</h3>
          <p className="lexi-premium-drawer-sub">Tạo câu hỏi trắc nghiệm hoặc tình huống để đánh giá kiến thức bài học.</p>
          <button className="lexi-premium-drawer-close" type="button" onClick={onClose} aria-label="Đóng">
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
                <BookOpen size={15} style={{ color: "#4f46e5" }} />
                <span>Cấu hình chung</span>
              </div>

              <div className="lexi-premium-form-group">
                <label>Bài học pháp luật gắn câu hỏi</label>
                <div className="lexi-premium-input-wrapper">
                  <BookOpen className="lexi-premium-input-icon" size={16} />
                  <select
                    className="lexi-premium-select"
                    value={lessonId}
                    onChange={(event) => setLessonId(event.target.value)}
                    disabled={isEdit}
                    required
                  >
                    <option value="">-- Chọn bài học --</option>
                    {lessons.map((lesson) => (
                      <option key={lesson.id} value={lesson.id}>
                        {lesson.title}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="lexi-premium-helper-text">Lọc danh sách bài giảng ở trang chính sẽ tự động chọn bài học này.</span>
              </div>
            </div>

            <div className="lexi-premium-form-card">
              <div className="lexi-premium-form-card-title">
                <HelpCircle size={15} style={{ color: "#4f46e5" }} />
                <span>Nội dung câu hỏi</span>
              </div>

              <div className="lexi-premium-form-group">
                <label>Nội dung chi tiết tình huống / câu hỏi</label>
                <textarea
                  required
                  rows={4}
                  className="lexi-premium-textarea"
                  placeholder="Nhập tình huống thực tế hoặc câu hỏi kiểm tra lý thuyết..."
                  value={questionText}
                  onChange={(event) => setQuestionText(event.target.value)}
                />
              </div>
            </div>

            <div className="lexi-premium-form-card">
              <div className="lexi-premium-form-card-title">
                <CheckCircle2 size={15} style={{ color: "#4f46e5" }} />
                <span>Phương án trả lời & Đáp án đúng</span>
              </div>
              <span className="lexi-premium-helper-text" style={{ marginTop: "-8px", marginBottom: "4px" }}>
                Nhập văn bản cho 4 phương án và tích vào vòng tròn bên trái để chỉ định đáp án đúng (dòng sẽ sáng xanh).
              </span>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { field: "A", val: optionA, setVal: setOptionA, index: 0, placeholder: "Phương án A" },
                  { field: "B", val: optionB, setVal: setOptionB, index: 1, placeholder: "Phương án B" },
                  { field: "C", val: optionC, setVal: setOptionC, index: 2, placeholder: "Phương án C" },
                  { field: "D", val: optionD, setVal: setOptionD, index: 3, placeholder: "Phương án D" },
                ].map((item) => (
                  <div
                    key={item.field}
                    className={`lexi-premium-option-row ${correctOptionIndex === item.index ? "correct" : ""}`}
                    onClick={() => setCorrectOptionIndex(item.index)}
                  >
                    <input
                      type="radio"
                      name="correctOption"
                      className="lexi-premium-option-radio"
                      checked={correctOptionIndex === item.index}
                      onChange={() => setCorrectOptionIndex(item.index)}
                    />
                    <input
                      required
                      type="text"
                      className="lexi-premium-option-input"
                      placeholder={item.placeholder}
                      value={item.val}
                      onChange={(event) => item.setVal(event.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="lexi-premium-form-card">
              <div className="lexi-premium-form-card-title">
                <Edit3 size={15} style={{ color: "#4f46e5" }} />
                <span>Giải thích & Căn cứ pháp lý</span>
              </div>

              <div className="lexi-premium-form-group">
                <label>Lý giải đáp án chính xác</label>
                <textarea
                  required
                  rows={3}
                  className="lexi-premium-textarea"
                  placeholder="Ghi rõ điều khoản pháp lý và lý giải vì sao phương án đó lại đúng..."
                  value={explanation}
                  onChange={(event) => setExplanation(event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="lexi-premium-drawer-actions">
            <button className="lexi-premium-btn-save" type="submit" disabled={isSaving}>
              <CheckCircle2 size={16} />
              <span>{isSaving ? "Đang lưu..." : "Lưu câu hỏi"}</span>
            </button>
            <button className="lexi-premium-btn-cancel" type="button" onClick={onClose}>
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
