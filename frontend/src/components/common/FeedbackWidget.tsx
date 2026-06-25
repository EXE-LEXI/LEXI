import { useState, useEffect, type FormEvent, type MouseEvent } from "react";
import { MessageSquare, X, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { createFeedbackReport, type FeedbackCategory } from "../../api/feedback";
import type { AuthResponse } from "../../types/auth";

interface FeedbackWidgetProps {
  session: AuthResponse | null;
}

export function FeedbackWidget({ session }: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<FeedbackCategory>("SUGGESTION");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close modal when pressing the Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        handleClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!session) {
    return null;
  }

  function handleClose() {
    setIsOpen(false);
    // Reset form states after animation completes (approx. 200ms)
    setTimeout(() => {
      setCategory("SUGGESTION");
      setTitle("");
      setMessage("");
      setSuccess(false);
      setError(null);
    }, 200);
  }

  function handleOverlayClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!session || !title.trim() || !message.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      await createFeedbackReport(session.accessToken, {
        category,
        subject: title.trim(),
        message: message.trim(),
        pagePath: window.location.pathname,
        metadata: {
          userAgent: navigator.userAgent,
          createdFrom: "web-global-feedback-widget",
          timestamp: new Date().toISOString(),
        },
      });

      setSuccess(true);
      // Auto close after 1.5s on success
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra khi gửi feedback.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="feedback-widget">
      <button
        className="feedback-toggle-btn"
        type="button"
        onClick={() => setIsOpen(true)}
        title="Gửi phản hồi, góp ý cho ứng dụng"
      >
        <MessageSquare size={20} />
        <span>Gửi feedback</span>
      </button>

      {isOpen && (
        <div className="feedback-modal-overlay" onClick={handleOverlayClick}>
          <div className="feedback-modal-card">
            <div className="feedback-modal-header">
              <div className="feedback-modal-title-area">
                <h2>Gửi feedback</h2>
                <div className="feedback-modal-subtitle">
                  Góp ý của bạn sẽ được chuyển đến admin.
                </div>
              </div>
              <button
                className="feedback-modal-close"
                type="button"
                onClick={handleClose}
                aria-label="Đóng"
                disabled={submitting}
              >
                <X size={18} />
              </button>
            </div>

            {success && (
              <div className="feedback-success-banner">
                <CheckCircle2 size={18} />
                <span>Gửi phản hồi thành công! Cảm ơn bạn rất nhiều.</span>
              </div>
            )}

            {error && (
              <div className="feedback-error-banner">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {!success && (
              <form onSubmit={handleSubmit}>
                <div className="feedback-form-group">
                  <label htmlFor="feedback-category">Bạn muốn góp ý về điều gì?</label>
                  <select
                    id="feedback-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                    required
                    disabled={submitting}
                  >
                    <option value="SUGGESTION">Đề xuất & Ý tưởng mới 💡</option>
                    <option value="BUG">Báo cáo lỗi kỹ thuật 🐛</option>
                    <option value="CONTENT_ISSUE">Vấn đề nội dung bài học 📚</option>
                    <option value="LEGAL_CORRECTION">Góp ý sửa đổi pháp lý ⚖️</option>
                    <option value="OTHER">Ý kiến khác 💬</option>
                  </select>
                </div>

                <div className="feedback-form-group">
                  <label htmlFor="feedback-title">Tiêu đề</label>
                  <input
                    id="feedback-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: Góp ý về Chatbot"
                    required
                    disabled={submitting}
                    maxLength={100}
                  />
                </div>

                <div className="feedback-form-group">
                  <label htmlFor="feedback-message">Nội dung</label>
                  <textarea
                    id="feedback-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Bạn muốn Lexi cải thiện điều gì?"
                    required
                    rows={4}
                    disabled={submitting}
                    maxLength={2000}
                  />
                </div>

                <div className="feedback-modal-footer">
                  <button
                    type="button"
                    className="feedback-btn-cancel"
                    onClick={handleClose}
                    disabled={submitting}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="feedback-btn-submit"
                    disabled={submitting || !title.trim() || !message.trim()}
                  >
                    <Send size={16} />
                    <span>{submitting ? "Đang gửi..." : "Gửi"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
