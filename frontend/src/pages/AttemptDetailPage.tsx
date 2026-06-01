import React, { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, XCircle, HelpCircle, Calendar, Award, RefreshCw, AlertCircle, Bookmark } from "lucide-react";
import type { AttemptDetail } from "../types/progress";
import { getLearningAttemptDetail } from "../api/learning";

type AttemptDetailPageProps = {
  token: string;
  attemptId: string;
  onNavigate: (path: string) => void;
};

export const AttemptDetailPage: React.FC<AttemptDetailPageProps> = ({
  token,
  attemptId,
  onNavigate,
}) => {
  const [attempt, setAttempt] = useState<AttemptDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttemptDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getLearningAttemptDetail(token, attemptId);
        setAttempt(data);
      } catch (err: any) {
        setError(err.message || "Không thể tải chi tiết bài thi.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchAttemptDetail();
  }, [attemptId, token]);

  if (isLoading) {
    return (
      <div className="lexi-attempt-detail-status loading">
        <RefreshCw className="animate-spin" size={32} style={{ color: "var(--color-primary)" }} />
        <p>Đang tải bảng phân tích câu hỏi chi tiết...</p>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="lexi-attempt-detail-status error">
        <AlertCircle size={40} style={{ color: "#ef4444", marginBottom: "16px" }} />
        <h3>Lỗi tải dữ liệu</h3>
        <p>{error || "Không tìm thấy dữ liệu lượt thi này."}</p>
        <button className="lexi-btn-action-primary" onClick={() => onNavigate("/history")}>
          Quay lại Lịch sử
        </button>
      </div>
    );
  }

  const finishedDateStr = attempt.finishedAt
    ? new Date(attempt.finishedAt).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Chưa hoàn thành";

  return (
    <div className="lexi-attempt-detail-root lexi-animate-fade">
      <div className="lexi-attempt-detail-container">
        
        {/* Back Link */}
        <button className="btn-back" onClick={() => onNavigate("/history")}>
          <ArrowLeft size={16} />
          <span>Quay lại Lịch sử</span>
        </button>

        {/* Heading Panel */}
        <header className="lexi-attempt-detail-header">
          <div className="header-meta">
            <span className="category-tag">{attempt.category?.title || "LUẬT HỌC"}</span>
            <div className="time-badge">
              <Calendar size={14} />
              <span>Hoàn thành lúc: {finishedDateStr}</span>
            </div>
          </div>
          <h1>{attempt.lesson?.title}</h1>
          <p className="module-desc">Module: {attempt.module?.title}</p>
        </header>

        {/* Summary Grid Cards */}
        <div className="lexi-attempt-summary-grid">
          
          {/* Card 1: Score percentage */}
          <div className="summary-card main-score">
            <div className="radial-score-wrapper">
              <Award size={36} className="award-icon" />
              <div className="score-text">
                <h2>{attempt.score}%</h2>
                <span>Điểm đạt được</span>
              </div>
            </div>
          </div>

          {/* Card 2: Question counts */}
          <div className="summary-card stats-count">
            <div className="stat-row">
              <span className="dot success"></span>
              <span className="label">Số câu đúng</span>
              <strong className="value success">{attempt.correctAnswers}</strong>
            </div>
            <div className="stat-row">
              <span className="dot danger"></span>
              <span className="label">Số câu sai</span>
              <strong className="value danger">{attempt.wrongAnswers}</strong>
            </div>
            <div className="stat-row">
              <span className="dot primary"></span>
              <span className="label">Tổng số câu hỏi</span>
              <strong className="value">{attempt.totalQuestions}</strong>
            </div>
          </div>

          {/* Card 3: Status check */}
          <div className="summary-card feedback">
            <h3>Đánh giá kết quả</h3>
            <p>
              {attempt.score >= 80 ? (
                <span className="feedback-text text-success">
                  Tuyệt vời! Bạn đã nắm vững lý thuyết và các trường hợp thực tiễn trong bài học này.
                </span>
              ) : attempt.score >= 50 ? (
                <span className="feedback-text text-warning">
                  Đạt yêu cầu. Hãy ôn luyện lại các câu hỏi sai để củng cố thêm kiến thức cho chắc chắn nhé.
                </span>
              ) : (
                <span className="feedback-text text-danger">
                  Chưa đạt yêu cầu. Bạn nên đọc lại bài giảng và xem kỹ phần giải thích chi tiết dưới đây.
                </span>
              )}
            </p>
          </div>

        </div>

        {/* Detailed Questions Review List */}
        <div className="lexi-attempt-questions-section">
          <h2>Phân Tích Chi Tiết Câu Hỏi</h2>
          
          <div className="questions-list">
            {attempt.answers.map((ans, index) => {
              const isCorrect = ans.isCorrect;
              return (
                <div key={ans.questionId} className={`question-review-card ${isCorrect ? "correct" : "incorrect"}`}>
                  
                  {/* Card Top Row */}
                  <div className="question-header">
                    <span className="question-index">Câu hỏi {index + 1}</span>
                    <div className={`status-badge ${isCorrect ? "success" : "danger"}`}>
                      {isCorrect ? (
                        <>
                          <CheckCircle2 size={16} />
                          <span>Đúng</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={16} />
                          <span>Sai</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Question Text */}
                  <p className="question-body-text">{ans.questionText}</p>

                  {/* Options display */}
                  <div className="options-display-stack">
                    <div className={`option-pill selected ${isCorrect ? "correct" : "incorrect"}`}>
                      <span className="pill-badge">Bạn đã chọn:</span>
                      <p className="pill-text">{ans.selectedOption.text}</p>
                    </div>

                    {!isCorrect && ans.correctOption && (
                      <div className="option-pill correct-key">
                        <span className="pill-badge success">Đáp án đúng:</span>
                        <p className="pill-text">{ans.correctOption.text}</p>
                      </div>
                    )}
                  </div>

                  {/* Educational Explanation Box */}
                  {ans.explanation && (
                    <div className="educational-explanation-box">
                      <div className="expl-header">
                        <HelpCircle size={15} />
                        <span>Phân tích lý thuyết & Căn cứ pháp lý</span>
                      </div>
                      <p className="expl-body">{ans.explanation}</p>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <footer className="lexi-attempt-footer-actions">
          <button className="lexi-btn-action-primary" onClick={() => onNavigate(`/lessons/${attempt.lesson.id}`)}>
            <Bookmark size={16} />
            <span>Ôn Lại Bài Giảng</span>
          </button>
          
          <button className="lexi-btn-action-secondary" onClick={() => onNavigate("/history")}>
            Quay lại danh sách lịch sử
          </button>
        </footer>

      </div>
    </div>
  );
};
export default AttemptDetailPage;
