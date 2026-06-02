import React, { useState, useEffect } from "react";
import { Search, Filter, History, ChevronLeft, ChevronRight, Calendar, BookOpen, AlertCircle, RefreshCw } from "lucide-react";
import type { LearningHistoryItem } from "../types/progress";
import type { PaginatedResponse } from "../types/api";
import { getLearningHistory } from "../api/learning";

type LearningHistoryPageProps = {
  token: string;
  onNavigate: (path: string) => void;
};

export const LearningHistoryPage: React.FC<LearningHistoryPageProps> = ({ token, onNavigate }) => {
  const [historyData, setHistoryData] = useState<PaginatedResponse<LearningHistoryItem> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Local filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState("all");

  const limit = 8;

  const fetchHistory = async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getLearningHistory(token, page, limit);
      setHistoryData(data);
    } catch (err: any) {
      setError(err.message || "Không thể tải lịch sử học tập.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchHistory(currentPage);
  }, [currentPage, token]);

  const uniqueCategories = React.useMemo(() => {
    if (!historyData?.items) return [];
    return Array.from(
      new Set(historyData.items.map((item) => item.category?.title).filter(Boolean))
    );
  }, [historyData]);

  // Apply filters on the current list
  const filteredItems = React.useMemo(() => {
    if (!historyData?.items) return [];
    return historyData.items.filter((item) => {
      const matchesSearch = item.lessonTitle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || item.category?.title === categoryFilter;
      
      let matchesScore = true;
      if (scoreFilter === "high") matchesScore = item.score >= 80;
      else if (scoreFilter === "medium") matchesScore = item.score >= 50 && item.score < 80;
      else if (scoreFilter === "low") matchesScore = item.score < 50;

      return matchesSearch && matchesCategory && matchesScore;
    });
  }, [historyData, searchQuery, categoryFilter, scoreFilter]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (historyData?.meta && currentPage < historyData.meta.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const getScoreColorClass = (score: number) => {
    if (score >= 80) return "score-high";
    if (score >= 50) return "score-medium";
    return "score-low";
  };

  return (
    <div className="lexi-history-root lexi-animate-fade">
      <div className="lexi-history-container">
        
        {/* Header */}
        <header className="lexi-history-header">
          <div className="header-badge">
            <History size={16} />
            <span>Nhật ký học tập</span>
          </div>
          <h1>Lịch Sử Học Tập</h1>
          <p>Xem lại tiến trình rèn luyện, kết quả các lần làm quiz và ôn tập lại bài cũ.</p>
        </header>

        {/* Filters Panel */}
        <div className="lexi-history-filters-panel">
          <div className="search-field">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm theo tên bài học..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-selects">
            <div className="select-wrapper">
              <Filter size={14} className="filter-icon" />
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="all">Tất cả danh mục</option>
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="select-wrapper">
              <select value={scoreFilter} onChange={(e) => setScoreFilter(e.target.value)}>
                <option value="all">Tất cả điểm số</option>
                <option value="high">Điểm cao (≥ 80%)</option>
                <option value="medium">Đạt yêu cầu (50% - 79%)</option>
                <option value="low">Cần cố gắng (&lt; 50%)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status Blocks */}
        {isLoading && (
          <div className="lexi-history-status loading">
            <RefreshCw className="animate-spin" size={24} style={{ color: "var(--color-primary)" }} />
            <span>Đang tải danh sách bài thi...</span>
          </div>
        )}

        {error && (
          <div className="lexi-history-status error">
            <AlertCircle size={24} style={{ color: "#ef4444" }} />
            <span>{error}</span>
            <button className="btn-retry" onClick={() => fetchHistory(currentPage)}>Thử lại</button>
          </div>
        )}

        {/* List of Attempts */}
        {!isLoading && !error && (
          <div className="lexi-history-list-wrapper">
            <div className="attempts-grid">
              {filteredItems.map((item) => {
                const finishedDate = item.finishedAt
                  ? new Date(item.finishedAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Chưa hoàn thành";

                return (
                  <div key={item.id} className="attempt-item-card">
                    {/* Top Info */}
                    <div className="card-top-row">
                      <span className="category-pill">{item.category?.title || "LUẬT HỌC"}</span>
                      <div className="date-group">
                        <Calendar size={13} />
                        <span>{finishedDate}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="lesson-title" title={item.lessonTitle}>
                      {item.lessonTitle}
                    </h3>
                    
                    <span className="module-title-sub">
                      <BookOpen size={12} style={{ marginRight: "4px" }} />
                      {item.module?.title}
                    </span>

                    {/* Progress Bar & Score */}
                    <div className="score-summary-block">
                      <div className="score-label">
                        <span>Điểm số đạt được</span>
                        <strong>{item.score}%</strong>
                      </div>
                      <div className="progress-bar-container">
                        <div
                          className={`progress-bar-fill ${getScoreColorClass(item.score)}`}
                          style={{ width: `${item.score}%` }}
                        ></div>
                      </div>
                      <div className="correct-stats">
                        Đúng <strong>{item.correctAnswers}</strong> / {item.totalQuestions} câu hỏi
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="card-footer-row">
                      <button
                        className="btn-view-details"
                        onClick={() => onNavigate(`/history/${item.id}`)}
                      >
                        Xem chi tiết & Giải thích
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredItems.length === 0 && (
              <div className="history-empty-state">
                <History size={48} style={{ color: "#94a3b8", marginBottom: "12px" }} />
                <h3>Không tìm thấy lịch sử học tập</h3>
                <p>Bạn chưa thực hiện bài kiểm tra nào hoặc bộ lọc không khớp với kết quả nào.</p>
              </div>
            )}

            {/* Pagination Controls */}
            {historyData?.meta && historyData.meta.totalPages > 1 && (
              <div className="lexi-history-pagination">
                <button
                  className="btn-page-nav"
                  disabled={currentPage <= 1}
                  onClick={handlePrevPage}
                >
                  <ChevronLeft size={16} />
                  <span>Trang trước</span>
                </button>
                <div className="page-indicator">
                  Trang <strong>{currentPage}</strong> / {historyData.meta.totalPages}
                </div>
                <button
                  className="btn-page-nav"
                  disabled={currentPage >= historyData.meta.totalPages}
                  onClick={handleNextPage}
                >
                  <span>Trang sau</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
export default LearningHistoryPage;
