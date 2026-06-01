import React, { useEffect, useMemo, useState } from "react";
import {
  Award,
  Bookmark,
  BookOpen,
  Compass,
  Filter,
  Flame,
  Gamepad2,
  History,
  LayoutDashboard,
  Pencil,
  Settings,
  Tv,
  User,
} from "lucide-react";
import { getBadges, getLearningHistory, getProgressSummary } from "../api/learning";
import { ROUTES } from "../routes/paths";
import type { AuthResponse } from "../types/auth";
import type { Badge } from "../types/learning";
import type { LearningHistoryItem, ProgressSummary } from "../types/progress";
import { formatDate } from "../utils/format";

type ProfilePageProps = {
  session: AuthResponse | null;
  onNavigate: (path: string) => void;
};

export const ProfilePage: React.FC<ProfilePageProps> = ({ session, onNavigate }) => {
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [history, setHistory] = useState<LearningHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.accessToken) return;

    let ignore = false;
    const token = session.accessToken;
    async function loadProfileData() {
      setIsLoading(true);
      setError(null);
      try {
        const [nextSummary, nextBadges, nextHistory] = await Promise.all([
          getProgressSummary(token),
          getBadges(token),
          getLearningHistory(token, 1, 6),
        ]);

        if (ignore) return;
        setSummary(nextSummary);
        setBadges(nextBadges.items);
        setHistory(nextHistory.items);
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Không thể tải dữ liệu hồ sơ");
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void loadProfileData();
    return () => {
      ignore = true;
    };
  }, [session?.accessToken]);

  const fullName =
    summary?.user.fullName ||
    session?.user?.profile?.fullName ||
    session?.user?.email ||
    "Học viên";
  const email = summary?.user.email || session?.user?.email || "";
  const joinDate = session?.user?.createdAt
    ? new Date(session.user.createdAt).toLocaleDateString("vi-VN", {
        month: "long",
        year: "numeric",
      })
    : "Chưa có dữ liệu";
  const xp = summary?.stats.xp ?? session?.user?.profile?.xp ?? 0;
  const streak = summary?.stats.streak ?? session?.user?.profile?.streak ?? 0;
  const level = summary?.stats.level ?? 1;
  const currentLevelXp = summary?.stats.currentLevelXp ?? xp;
  const nextLevelXp = summary?.stats.nextLevelXp ?? Math.max(xp, 1);
  const levelProgress =
    nextLevelXp > 0 ? Math.min((currentLevelXp / nextLevelXp) * 100, 100) : 0;

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const unlockedBadges = badges.filter((badge) => badge.isUnlocked).slice(0, 3);
  const weeklyBars = useMemo(() => {
    const counts = Array.from({ length: 7 }, () => 0);
    history.forEach((item) => {
      const date = new Date(item.finishedAt || item.startedAt);
      if (!Number.isNaN(date.getTime())) {
        const index = date.getDay() === 0 ? 6 : date.getDay() - 1;
        counts[index] += 1;
      }
    });
    const max = Math.max(...counts, 1);
    return counts.map((count) => Math.round((count / max) * 80));
  }, [history]);

  function renderBadgeIcon(index: number) {
    if (index === 0) return <Award size={20} />;
    if (index === 1) return <BookOpen size={20} />;
    return <Flame size={20} className="fill-gold stroke-gold" />;
  }

  return (
    <div className="lexi-profile-root">
      <div className="lexi-profile-container">
        <aside className="lexi-profile-sidebar">
          <div className="lexi-sidebar-logo-block">
            <span className="lexi-sidebar-logo">Lexi</span>
          </div>

          <nav className="lexi-sidebar-menu">
            <a href={ROUTES.home} onClick={(e) => { e.preventDefault(); onNavigate(ROUTES.home); }}>
              <LayoutDashboard size={18} />
              <span>Tổng quan</span>
            </a>
            <a href={ROUTES.modules} onClick={(e) => { e.preventDefault(); onNavigate(ROUTES.modules); }}>
              <Compass size={18} />
              <span>Khóa học của tôi</span>
            </a>
            <a href={ROUTES.review} onClick={(e) => { e.preventDefault(); onNavigate(ROUTES.review); }}>
              <Award size={18} />
              <span>Ôn tập</span>
            </a>
            <a href={ROUTES.history} onClick={(e) => { e.preventDefault(); onNavigate(ROUTES.history); }}>
              <History size={18} />
              <span>Lịch sử học</span>
            </a>
            <a href={ROUTES.shorts} onClick={(e) => { e.preventDefault(); onNavigate(ROUTES.shorts); }}>
              <Tv size={18} />
              <span>Video ngắn</span>
            </a>
            <a href={ROUTES.game} onClick={(e) => { e.preventDefault(); onNavigate(ROUTES.game); }}>
              <Gamepad2 size={18} />
              <span>Đấu trường Game</span>
            </a>
            <a href={ROUTES.settings} onClick={(e) => { e.preventDefault(); onNavigate(ROUTES.settings); }}>
              <Settings size={18} />
              <span>Cài đặt</span>
            </a>
          </nav>

          <div className="lexi-sidebar-footer">
            <div className="lexi-sidebar-user-card">
              <div className="lexi-sidebar-avatar">{initials || <User size={16} />}</div>
              <div className="lexi-sidebar-user-info">
                <strong>{fullName}</strong>
                <span>Cấp độ {level} - {xp} XP</span>
              </div>
            </div>

            <button className="lexi-sidebar-btn-premium" onClick={() => onNavigate(ROUTES.subscription)}>
              Nâng cấp Premium
            </button>
          </div>
        </aside>

        <main className="lexi-profile-main">
          {isLoading && <p className="notice">Đang tải dữ liệu hồ sơ...</p>}
          {error && <p className="error-text">{error}</p>}

          <div className="lexi-profile-header-grid">
            <div className="lexi-profile-card">
              <div className="lexi-profile-avatar-large">
                <span>{initials || <User size={28} />}</span>
              </div>

              <div className="lexi-profile-details">
                <h2 className="lexi-profile-name">{fullName}</h2>
                <p className="lexi-profile-status-text">
                  {email} - Tham gia từ {joinDate}
                </p>

                <div className="lexi-profile-actions">
                  <button className="lexi-btn-edit-profile" onClick={() => onNavigate(ROUTES.account)}>
                    <Pencil size={12} />
                    <span>Chỉnh sửa hồ sơ</span>
                  </button>
                  <button className="lexi-btn-account-settings" onClick={() => onNavigate(ROUTES.account)}>
                    <Settings size={12} />
                    <span>Cài đặt tai khoan</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="lexi-profile-level-card">
              <div className="lexi-level-card-header">
                <h3>Cấp độ {level}</h3>
                <span className="lexi-level-xp-progress">
                  {currentLevelXp} / {nextLevelXp} XP đến cấp tiếp theo
                </span>
              </div>

              <div className="lexi-level-progress-bar">
                <span style={{ width: `${levelProgress}%` }}></span>
              </div>

              <div className="lexi-streak-pill-badge">
                <Flame size={16} className="fill-gold stroke-gold" />
                <span>{streak} ngày liên tiếp</span>
              </div>
            </div>
          </div>

          <div className="lexi-profile-middle-grid">
            <div className="lexi-badges-showcase">
              <div className="lexi-card-header-row">
                <h3>Bộ sưu tập huy hiệu</h3>
                <button className="lexi-link-see-all" onClick={() => onNavigate(ROUTES.leaderboard)}>
                  Xem xếp hạng
                </button>
              </div>

              <div className="lexi-badges-horizontal-grid">
                {unlockedBadges.map((badge, index) => (
                  <div className="lexi-badge-item-box gold-bg" key={badge.id}>
                    <div className="lexi-badge-item-icon text-gavel">
                      {renderBadgeIcon(index)}
                    </div>
                    <strong>{badge.title}</strong>
                  </div>
                ))}
                {!unlockedBadges.length && (
                  <p className="muted">Bạn chưa mở khóa huy hiệu nào.</p>
                )}
              </div>
            </div>

            <div className="lexi-study-chart-card">
              <h3>Số buổi học gần đây</h3>
              <div className="lexi-chart-visual-wrapper">
                <div className="lexi-chart-bars-container">
                  {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((label, index) => (
                    <div className={`lexi-chart-col ${index === 4 ? "active" : ""}`} key={label}>
                      <div className="lexi-chart-bar-value" style={{ height: `${weeklyBars[index]}px` }}></div>
                      <span className="lexi-chart-label">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lexi-cases-archive-box">
            <div className="lexi-card-header-row border-bottom">
              <h3 className="lexi-cases-heading">
                <Bookmark size={18} />
                <span>Lịch sử bài học gần đây</span>
              </h3>
              <button className="lexi-btn-filter-cases" onClick={() => onNavigate(ROUTES.history)}>
                <Filter size={14} />
              </button>
            </div>

            <div className="lexi-saved-cases-list">
              {history.map((item) => (
                <button
                  className="lexi-saved-case-card"
                  key={item.id}
                  onClick={() => onNavigate(`/history/${item.id}`)}
                  type="button"
                >
                  <div className="lexi-case-header-row">
                    <div className="lexi-case-meta-group">
                      <span className="lexi-case-tag tag-green">{item.category.title}</span>
                      <span className="lexi-case-time-text">
                        {formatDate(item.finishedAt || item.startedAt)}
                      </span>
                    </div>
                    <span className="lexi-btn-case-bookmark active">
                      {item.score}%
                    </span>
                  </div>
                  <h4 className="lexi-case-title">{item.lessonTitle}</h4>
                  <p className="lexi-case-description">
                    {item.module.title} - Đúng {item.correctAnswers}/{item.totalQuestions} câu.
                  </p>
                </button>
              ))}
              {!history.length && (
                <p className="muted">Chưa có lịch sử học tập để hiển thị.</p>
              )}
            </div>

            <button className="lexi-btn-load-more-cases" onClick={() => onNavigate(ROUTES.history)}>
              Xem toàn bộ lịch sử
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
