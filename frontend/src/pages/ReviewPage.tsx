import { formatDate } from "../utils/format";
import type { ReviewMistake, ReviewRecommendation } from "../types/learning";
import {
  BookOpen,
  Award,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Calendar,
  ChevronRight,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  RotateCcw
} from "lucide-react";

type ReviewPageProps = {
  recommendations: ReviewRecommendation[];
  mistakes: ReviewMistake[];
  isLoading: boolean;
  error: string | null;
  onOpenLesson: (lessonId: string) => void;
};

export function ReviewPage({
  recommendations,
  mistakes,
  isLoading,
  error,
  onOpenLesson,
}: ReviewPageProps) {
  return (
    <main className="lexi-review-root lexi-animate-fade page">
      <div className="lexi-review-header">
        <span className="eyebrow">
          <Award size={14} className="fill-gold stroke-gold" /> Phòng Ôn Luyện
        </span>
        <h1>Ôn tập và sửa lỗi</h1>
        <p className="summary">
          Hệ thống AI tự động ghi nhận các câu trả lời chưa đúng và gợi ý các bài học quan trọng để bạn củng cố kiến thức, duy trì phong độ tốt nhất.
        </p>
      </div>

      {isLoading ? (
        <div className="lexi-review-status loading panel">
          <RefreshCw className="animate-spin" size={24} style={{ color: "var(--color-primary)" }} />
          <span>Đang đồng bộ hóa dữ liệu ôn luyện từ máy chủ...</span>
        </div>
      ) : null}

      {error ? (
        <div className="lexi-review-status error panel">
          <AlertTriangle size={24} style={{ color: "var(--color-red)" }} />
          <span>Lỗi tải dữ liệu: {error}</span>
        </div>
      ) : null}

      {!isLoading && !error && (
        <section className="lexi-review-grid">
          {/* Left Column: Recommendations */}
          <article className="panel lexi-review-panel">
            <h2>
              <Sparkles size={18} className="fill-gold stroke-gold" />
              <span>Bài học được gợi ý ôn tập</span>
            </h2>
            
            {recommendations.length === 0 ? (
              <div className="lexi-review-empty">
                <BookOpen size={40} className="stroke-muted" />
                <p>Tuyệt vời! Không có gợi ý ôn tập nào hôm nay. Hãy tiếp tục học bài mới nhé!</p>
              </div>
            ) : (
              <div className="lexi-review-list">
                {recommendations.map((item) => (
                  <div
                    key={`${item.lesson.id}-${item.reasonCode}`}
                    className="lexi-review-card"
                    onClick={() => onOpenLesson(item.lesson.id)}
                  >
                    <div className="lexi-review-card-icon">
                      <BookOpen size={18} />
                    </div>
                    <div className="lexi-review-card-info">
                      <strong>{item.lesson.title}</strong>
                      <span className="lexi-review-card-meta">
                        {item.module.title} • <span className="reason-text">{item.reasonText}</span>
                      </span>
                    </div>
                    <ChevronRight size={16} className="lexi-review-card-arrow" />
                  </div>
                ))}
              </div>
            )}
          </article>

          {/* Right Column: Mistakes */}
          <article className="panel lexi-review-panel">
            <h2>
              <ShieldAlert size={18} style={{ color: "var(--color-red)" }} />
              <span>Danh sách câu trả lời sai</span>
            </h2>

            {mistakes.length === 0 ? (
              <div className="lexi-review-empty">
                <CheckCircle2 size={40} style={{ color: "var(--color-primary)" }} />
                <p>Hộp thư trống! Bạn chưa trả lời sai câu nào, hoặc các câu sai đã được ôn luyện thành công.</p>
              </div>
            ) : (
              <div className="lexi-mistake-list">
                {mistakes.map((mistake) => (
                  <div key={mistake.questionId} className="lexi-mistake-card">
                    <div className="lexi-mistake-card-header">
                      <span className="lexi-mistake-badge">
                        {mistake.module.title}
                      </span>
                      <div className="lexi-mistake-time">
                        <Calendar size={12} />
                        <span>{formatDate(mistake.lastWrongAt)}</span>
                      </div>
                    </div>

                    <h3 className="lexi-mistake-question">{mistake.questionText}</h3>

                    <div className="lexi-mistake-options">
                      {/* Selected option */}
                      <div className="lexi-option-review user-choice">
                        <div className="option-marker">
                          <XCircle size={14} />
                        </div>
                        <div className="option-text">
                          <span className="label">Lựa chọn của bạn:</span>
                          <strong>{mistake.selectedOption.text}</strong>
                        </div>
                      </div>

                      {/* Correct option */}
                      {mistake.correctOption && (
                        <div className="lexi-option-review correct-choice">
                          <div className="option-marker">
                            <CheckCircle2 size={14} />
                          </div>
                          <div className="option-text">
                            <span className="label">Đáp án đúng:</span>
                            <strong>{mistake.correctOption.text}</strong>
                          </div>
                        </div>
                      )}
                    </div>

                    {mistake.explanation && (
                      <div className="lexi-mistake-explanation">
                        <strong>Phân tích từ AI Mentor:</strong>
                        <p>{mistake.explanation}</p>
                      </div>
                    )}

                    <div className="lexi-mistake-actions">
                      <button
                        className="lexi-btn-review-now"
                        onClick={() => onOpenLesson(mistake.lesson.id)}
                      >
                        <RotateCcw size={13} />
                        <span>Ôn tập bài học: {mistake.lesson.title}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>
        </section>
      )}
    </main>
  );
}

export default ReviewPage;
