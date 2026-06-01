import React, { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Send } from "lucide-react";
import {
  createFeedbackReport,
  type FeedbackCategory,
} from "../api/feedback";
import { ROUTES } from "../routes/paths";

type FeedbackPageProps = {
  token: string;
  onNavigate: (path: string) => void;
};

const categoryOptions: Array<{ value: FeedbackCategory; label: string }> = [
  { value: "LEGAL_CORRECTION", label: "Góp ý sửa đổi pháp lý" },
  { value: "CONTENT_ISSUE", label: "Vấn đề nội dung bài học" },
  { value: "BUG", label: "Báo cáo lỗi kỹ thuật" },
  { value: "SUGGESTION", label: "Đề xuất & Ý tưởng mới" },
  { value: "OTHER", label: "Ý kiến khác" },
];

export function FeedbackPage({ token, onNavigate }: FeedbackPageProps) {
  const initialPath = useMemo(() => {
    const storedPath = window.sessionStorage.getItem("lexiFeedbackPath");
    window.sessionStorage.removeItem("lexiFeedbackPath");
    return storedPath || window.location.pathname;
  }, []);
  const [category, setCategory] = useState<FeedbackCategory>("LEGAL_CORRECTION");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [pagePath, setPagePath] = useState(initialPath);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccessId(null);
    setIsSubmitting(true);

    try {
      const report = await createFeedbackReport(token, {
        category,
        subject,
        message,
        pagePath,
        metadata: {
          userAgent: navigator.userAgent,
          createdFrom: "web-feedback-page",
        },
      });
      setSuccessId(report.id);
      setSubject("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể gửi báo cáo");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page feedback-page">
      <section className="panel feedback-panel">
        <div className="feedback-header">
          <div className="feedback-icon">
            <AlertTriangle size={22} />
          </div>
          <div>
            <h1>Báo cáo nội dung hoặc lỗi sản phẩm</h1>
            <p>
              Gửi các góp ý sửa đổi nội dung pháp lý, báo cáo lỗi hệ thống hoặc
              phản hồi thử nghiệm trực tiếp đến đội ngũ phát triển LEXI.
            </p>
          </div>
        </div>

        <form className="feedback-form" onSubmit={handleSubmit}>
          <label>
            <span>Danh mục góp ý</span>
            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as FeedbackCategory)
              }
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Trang liên quan</span>
            <input
              value={pagePath}
              onChange={(event) => setPagePath(event.target.value)}
              placeholder="Ví dụ: /lessons/..."
            />
          </label>

          <label>
            <span>Tiêu đề</span>
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              minLength={4}
              maxLength={160}
              required
              placeholder="Mô tả ngắn gọn vấn đề gặp phải"
            />
          </label>

          <label>
            <span>Chi tiết phản hồi</span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              minLength={10}
              maxLength={4000}
              required
              rows={7}
              placeholder="Mô tả chi tiết lỗi xảy ra, kết quả mong đợi và bất kỳ nguồn pháp lý hoặc tài liệu tham khảo nào cần được kiểm tra."
            />
          </label>

          {error ? (
            <div className="error-text">
              <span>{error}</span>
            </div>
          ) : null}

          {successId ? (
            <div className="lexi-inline-notice feedback-success">
              <CheckCircle2 size={16} />
              <span>Đã gửi báo cáo thành công. Mã tham chiếu: {successId}</span>
            </div>
          ) : null}

          <div className="feedback-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={() => onNavigate(ROUTES.dashboard)}
            >
              Quay lại Bảng điều khiển
            </button>
            <button
              type="submit"
              className="button button-primary"
              disabled={isSubmitting}
            >
              <Send size={16} />
              <span>{isSubmitting ? "Đang gửi..." : "Gửi báo cáo"}</span>
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default FeedbackPage;
