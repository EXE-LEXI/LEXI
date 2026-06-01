import React, { useState } from "react";
import { 
  LayoutDashboard, 
  Compass, 
  Award, 
  History, 
  Settings, 
  Pencil, 
  Gavel, 
  BookOpen, 
  Scale, 
  Bookmark, 
  Filter, 
  Sparkles,
  Flame,
  Check,
  X,
  Tv,
  Gamepad2,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import type { AuthResponse } from "../types/auth";
import type { ContentRecommendation, UserLearningProfile, LearningConsistency } from "../types/learning";
import { ROUTES } from "../routes/paths";

type ProfilePageProps = {
  session: AuthResponse | null;
  aiRecommendations?: ContentRecommendation[];
  aiLearningProfile?: UserLearningProfile | null;
  aiConsistency?: LearningConsistency | null;
  onNavigate: (path: string) => void;
};

export const ProfilePage: React.FC<ProfilePageProps> = ({ 
  session, 
  aiRecommendations = [],
  aiLearningProfile,
  aiConsistency,
  onNavigate 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(session?.user?.profile?.fullName || "Nguyễn Văn A");
  const [displayName, setDisplayName] = useState(session?.user?.profile?.fullName || "Nguyễn Văn A");

  const joinDate = session?.user?.createdAt 
    ? new Date(session.user.createdAt).toLocaleDateString("vi-VN", { month: "long", year: "numeric" })
    : "tháng 9, 2023";

  const userEmail = session?.user?.email || "nguyenvana@gmail.com";
  const userXp = session?.user?.profile?.xp || 1200;
  const userStreak = session?.user?.profile?.streak || 14;

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  function handleSaveName() {
    setDisplayName(tempName);
    setIsEditing(false);
  }

  function handleCancelEdit() {
    setTempName(displayName);
    setIsEditing(false);
  }

  return (
    <div className="lexi-profile-root">
      <div className="lexi-profile-container">
        
        {/* =======================================================
           LEFT SIDEBAR NAVIGATION
           ======================================================= */}
        <aside className="lexi-profile-sidebar">
          <div className="lexi-sidebar-logo-block">
            <span className="lexi-sidebar-logo">Lexi</span>
          </div>

          <nav className="lexi-sidebar-menu">
            <a href="/" onClick={(e) => { e.preventDefault(); onNavigate(ROUTES.home); }}>
              <LayoutDashboard size={18} />
              <span>Tổng quan</span>
            </a>
            <a href="/modules" onClick={(e) => { e.preventDefault(); onNavigate(ROUTES.modules); }}>
              <Compass size={18} />
              <span>Khóa học của tôi</span>
            </a>
            <a href="/review" onClick={(e) => { e.preventDefault(); onNavigate(ROUTES.review); }}>
              <Award size={18} />
              <span>Thành tích</span>
            </a>
            <a href="#history" onClick={(e) => e.preventDefault()}>
              <History size={18} />
              <span>Lịch sử học</span>
            </a>
            <a href="/shorts" onClick={(e) => { e.preventDefault(); onNavigate(ROUTES.shorts); }}>
              <Tv size={18} />
              <span>Video Ngắn</span>
            </a>
            <a href="/game" onClick={(e) => { e.preventDefault(); onNavigate(ROUTES.game); }}>
              <Gamepad2 size={18} />
              <span>Đấu trường Game</span>
            </a>
            <a href="/settings" className="active" onClick={(e) => { e.preventDefault(); onNavigate(ROUTES.settings); }}>
              <Settings size={18} />
              <span>Cài đặt</span>
            </a>
          </nav>

          <div className="lexi-sidebar-footer">
            <div className="lexi-sidebar-user-card">
              <div className="lexi-sidebar-avatar">{initials}</div>
              <div className="lexi-sidebar-user-info">
                <strong>Người học Lexi</strong>
                <span>Cấp độ 12 • Hạng Vàng</span>
              </div>
            </div>

            <button 
              className="lexi-sidebar-btn-premium"
              onClick={() => alert("Tính năng Nâng cấp Premium sắp ra mắt!")}
            >
              Nâng cấp Premium
            </button>
          </div>
        </aside>

        {/* =======================================================
           RIGHT MAIN CONTENT CONTAINER
           ======================================================= */}
        <main className="lexi-profile-main">
          
          {/* Header Row: Personal Profile & Level Stats */}
          <div className="lexi-profile-header-grid">
            
            {/* Profile User Card */}
            <div className="lexi-profile-card">
              <div className="lexi-profile-avatar-large">
                <span>{initials}</span>
              </div>

              <div className="lexi-profile-details">
                {isEditing ? (
                  <div className="lexi-profile-editor">
                    <input 
                      type="text" 
                      value={tempName} 
                      onChange={(e) => setTempName(e.target.value)}
                      className="lexi-profile-name-input"
                    />
                    <button className="lexi-btn-save-name" onClick={handleSaveName}>
                      <Check size={14} />
                    </button>
                    <button className="lexi-btn-cancel-name" onClick={handleCancelEdit}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <h2 className="lexi-profile-name">
                    {displayName}
                  </h2>
                )}
                
                <p className="lexi-profile-status-text">
                  Người học chuyên cần • Tham gia từ {joinDate}
                </p>

                <div className="lexi-profile-actions">
                  <button className="lexi-btn-edit-profile" onClick={() => setIsEditing(true)}>
                    <Pencil size={12} />
                    <span>Chỉnh sửa hồ sơ</span>
                  </button>
                  
                  <button className="lexi-btn-account-settings" onClick={() => onNavigate(ROUTES.settings)}>
                    <Settings size={12} />
                    <span>Cài đặt tài khoản</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Level Card */}
            <div className="lexi-profile-level-card">
              <div className="lexi-level-card-header">
                <h3>Cấp độ 12</h3>
                <span className="lexi-level-xp-progress">
                  {userXp} / 1.500 XP đến cấp 13
                </span>
              </div>

              <div className="lexi-level-progress-bar">
                <span style={{ width: `${Math.min((userXp / 1500) * 100, 100)}%` }}></span>
              </div>

              <div className="lexi-streak-pill-badge">
                <Flame size={16} className="fill-gold stroke-gold" />
                <span>{userStreak} ngày liên tiếp</span>
              </div>
            </div>

          </div>

          {/* AI Features Section: Learning Profile & Recommendations */}
          {(aiLearningProfile || aiRecommendations.length > 0 || aiConsistency) && (
            <div className="lexi-ai-features-section">
              {/* Learning Profile & Consistency Stats */}
              {(aiLearningProfile || aiConsistency) && (
                <div className="lexi-ai-stats-grid">
                  {aiLearningProfile && (
                    <div className="lexi-ai-profile-card">
                      <div className="lexi-ai-card-header">
                        <h3>
                          <TrendingUp size={18} />
                          Hồ sơ học tập
                        </h3>
                      </div>
                      <div className="lexi-ai-stats-list">
                        <div className="lexi-stat-item">
                          <span className="lexi-stat-label">Bài học hoàn thành</span>
                          <span className="lexi-stat-value">{aiLearningProfile.completedLessonsCount}</span>
                        </div>
                        <div className="lexi-stat-item">
                          <span className="lexi-stat-label">Điểm trung bình</span>
                          <span className="lexi-stat-value">{(aiLearningProfile.averageScore * 100).toFixed(0)}%</span>
                        </div>
                        <div className="lexi-stat-item">
                          <span className="lexi-stat-label">Tốc độ học</span>
                          <span className="lexi-stat-value">{aiLearningProfile.learningPace}</span>
                        </div>
                        {aiLearningProfile.weakAreas.length > 0 && (
                          <div className="lexi-areas-list">
                            <span className="lexi-areas-label">Cần cải thiện:</span>
                            <div className="lexi-areas-tags">
                              {aiLearningProfile.weakAreas.slice(0, 3).map((area) => (
                                <span key={area} className="lexi-area-tag weak">
                                  <AlertCircle size={12} />
                                  {area}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {aiLearningProfile.strongAreas.length > 0 && (
                          <div className="lexi-areas-list">
                            <span className="lexi-areas-label">Điểm mạnh:</span>
                            <div className="lexi-areas-tags">
                              {aiLearningProfile.strongAreas.slice(0, 3).map((area) => (
                                <span key={area} className="lexi-area-tag strong">
                                  <Check size={12} />
                                  {area}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {aiConsistency && (
                    <div className="lexi-ai-consistency-card">
                      <div className="lexi-ai-card-header">
                        <h3>
                          <Flame size={18} />
                          Liên tục học tập
                        </h3>
                      </div>
                      <div className="lexi-ai-consistency-content">
                        <div className="lexi-consistency-main">
                          <span className="lexi-consistency-label">Độ liên tục</span>
                          <span className="lexi-consistency-value">{(aiConsistency.consistency * 100).toFixed(0)}%</span>
                        </div>
                        <div className="lexi-consistency-streak">
                          <span className="lexi-streak-label">Chuỗi hiện tại</span>
                          <span className="lexi-streak-val">{aiConsistency.streak} ngày</span>
                        </div>
                        <p className="lexi-consistency-message">{aiConsistency.motivationalMessage}</p>
                        {aiConsistency.recommendedSchedule && (
                          <div className="lexi-schedule-recommendation">
                            <span className="lexi-schedule-label">Thời gian học tối ưu:</span>
                            <span className="lexi-schedule-value">{aiConsistency.recommendedSchedule}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* AI Recommendations */}
              {aiRecommendations.length > 0 && (
                <div className="lexi-ai-recommendations-section">
                  <div className="lexi-ai-card-header">
                    <h3>
                      <Sparkles size={18} />
                      Gợi ý được cá nhân hóa
                    </h3>
                    <span className="lexi-ai-badge">AI</span>
                  </div>
                  <div className="lexi-recommendations-list">
                    {aiRecommendations.map((rec) => (
                      <div key={rec.lessonId} className="lexi-recommendation-item">
                        <div className="lexi-rec-content">
                          <h4>{rec.title}</h4>
                          <p className="lexi-rec-reason">{rec.reason}</p>
                          <div className="lexi-rec-meta">
                            <span className={`lexi-difficulty lexi-difficulty-${rec.difficulty}`}>
                              {rec.difficulty === "easy" && "Dễ"}
                              {rec.difficulty === "medium" && "Trung bình"}
                              {rec.difficulty === "hard" && "Khó"}
                            </span>
                            <span className="lexi-rec-time">~{rec.estimatedMinutes} phút</span>
                            <span className="lexi-rec-score">Phù hợp: {(rec.relevantScore * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                        <button 
                          className="lexi-btn-start-lesson"
                          onClick={() => onNavigate(`/lessons/${rec.lessonId}`)}
                        >
                          <BookOpen size={14} />
                          Bắt đầu
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Middle Row: Badges Gallery & Study Time Chart */}
          <div className="lexi-profile-middle-grid">
            
            {/* Badges Gallery */}
            <div className="lexi-badges-showcase">
              <div className="lexi-card-header-row">
                <h3>Bộ sưu tập huy hiệu</h3>
                <a href="#badges" className="lexi-link-see-all" onClick={(e) => e.preventDefault()}>Xem tất cả</a>
              </div>

              <div className="lexi-badges-horizontal-grid">
                {/* Badge 1 */}
                <div className="lexi-badge-item-box gold-bg">
                  <div className="lexi-badge-item-icon text-gavel">
                    <Gavel size={20} />
                  </div>
                  <strong>Luật dân sự</strong>
                </div>

                {/* Badge 2 */}
                <div className="lexi-badge-item-box orange-bg">
                  <div className="lexi-badge-item-icon text-book">
                    <BookOpen size={20} />
                  </div>
                  <strong>Mọt sách dân sự</strong>
                </div>

                {/* Badge 3 */}
                <div className="lexi-badge-item-box locked-bg">
                  <div className="lexi-badge-item-icon text-locked">
                    <Scale size={20} />
                  </div>
                  <strong>Chuyên gia hình sự</strong>
                </div>
              </div>
            </div>

            {/* Weekly Study Time Chart */}
            <div className="lexi-study-chart-card">
              <h3>Thời gian học trong tuần</h3>
              
              <div className="lexi-chart-visual-wrapper">
                <div className="lexi-chart-bars-container">
                  {/* T2 */}
                  <div className="lexi-chart-col">
                    <div className="lexi-chart-bar-value" style={{ height: "30px" }}></div>
                    <span className="lexi-chart-label">T2</span>
                  </div>

                  {/* T3 */}
                  <div className="lexi-chart-col">
                    <div className="lexi-chart-bar-value" style={{ height: "65px" }}></div>
                    <span className="lexi-chart-label">T3</span>
                  </div>

                  {/* T4 */}
                  <div className="lexi-chart-col">
                    <div className="lexi-chart-bar-value" style={{ height: "15px" }}></div>
                    <span className="lexi-chart-label">T4</span>
                  </div>

                  {/* T5 */}
                  <div className="lexi-chart-col">
                    <div className="lexi-chart-bar-value" style={{ height: "80px" }}></div>
                    <span className="lexi-chart-label">T5</span>
                  </div>

                  {/* T6 */}
                  <div className="lexi-chart-col active">
                    <div className="lexi-chart-bar-value" style={{ height: "50px" }}></div>
                    <span className="lexi-chart-label">T6</span>
                  </div>

                  {/* T7 */}
                  <div className="lexi-chart-col">
                    <div className="lexi-chart-bar-value" style={{ height: "0px" }}></div>
                    <span className="lexi-chart-label">T7</span>
                  </div>

                  {/* CN */}
                  <div className="lexi-chart-col">
                    <div className="lexi-chart-bar-value" style={{ height: "0px" }}></div>
                    <span className="lexi-chart-label">CN</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Row: Saved Cases Archive ("Kho lưu trữ tình huống") */}
          <div className="lexi-cases-archive-box">
            <div className="lexi-card-header-row border-bottom">
              <h3 className="lexi-cases-heading">
                <Bookmark size={18} />
                <span>Kho lưu trữ tình huống</span>
              </h3>
              <button className="lexi-btn-filter-cases">
                <Filter size={14} />
              </button>
            </div>

            <div className="lexi-saved-cases-list">
              {/* Case 1 */}
              <div className="lexi-saved-case-card">
                <div className="lexi-case-header-row">
                  <div className="lexi-case-meta-group">
                    <span className="lexi-case-tag tag-green">Hợp đồng</span>
                    <span className="lexi-case-time-text">Lưu 3 ngày trước</span>
                  </div>
                  <button className="lexi-btn-case-bookmark active">
                    <Bookmark size={15} />
                  </button>
                </div>
                <h4 className="lexi-case-title">
                  Tranh chấp hợp đồng thuê nhà xưởng khi có sự kiện bất khả kháng
                </h4>
                <p className="lexi-case-description">
                  Phân tích áp dụng điều khoản bất khả kháng trong Bộ luật Dân sự 2015 đối với trường hợp dịch bệnh kéo dài làm gián đoạn sản xuất...
                </p>
              </div>

              {/* Case 2 */}
              <div className="lexi-saved-case-card">
                <div className="lexi-case-header-row">
                  <div className="lexi-case-meta-group">
                    <span className="lexi-case-tag tag-blue">Hình sự</span>
                    <span className="lexi-case-time-text">Lưu 1 tuần trước</span>
                  </div>
                  <button className="lexi-btn-case-bookmark active">
                    <Bookmark size={15} />
                  </button>
                </div>
                <h4 className="lexi-case-title">
                  Cấu thành tội phạm tội lừa đảo chiếm đoạt tài sản qua mạng
                </h4>
                <p className="lexi-case-description">
                  Tình huống giả định về việc sử dụng công nghệ deepfake để giả mạo người thân gọi video call mượn tiền. Xác định ý thức chủ quan...
                </p>
              </div>
            </div>

            <button 
              className="lexi-btn-load-more-cases"
              onClick={() => alert("Tính năng hiển thị thêm tình huống lưu trữ sắp ra mắt!")}
            >
              Tải thêm tình huống
            </button>
          </div>

          {/* Footer Area */}
          <footer className="lexi-profile-footer">
            <div className="lexi-profile-footer-container">
              <span className="lexi-profile-footer-brand">Lexi Learning</span>
              <span className="lexi-profile-footer-copy">
                © 2024 Lexi Learning. Mọi quyền được bảo lưu.
              </span>
              <div className="lexi-profile-footer-links">
                <a href="#terms" onClick={(e) => e.preventDefault()}>Điều khoản</a>
                <a href="#privacy" onClick={(e) => e.preventDefault()}>Bảo mật</a>
                <a href="#contact" onClick={(e) => e.preventDefault()}>Liên hệ</a>
                <a href="#help" onClick={(e) => e.preventDefault()}>Trợ giúp</a>
              </div>
            </div>
          </footer>

        </main>

      </div>
    </div>
  );
};
export default ProfilePage;
