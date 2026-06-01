import React from "react";
import { Trophy, Crown, RefreshCw, AlertCircle, Calendar } from "lucide-react";
import type { WeeklyLeaderboard, LeaderboardUser } from "../types/learning";
import type { AuthResponse } from "../types/auth";
import { formatDate } from "../utils/format";

type LeaderboardPageProps = {
  leaderboard: WeeklyLeaderboard | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  session: AuthResponse | null;
};

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({
  leaderboard,
  isLoading,
  error,
  onRefresh,
  session,
}) => {
  // Sort items to make sure top 3 are absolute first
  const sortedItems = React.useMemo(() => {
    if (!leaderboard?.items) return [];
    return [...leaderboard.items].sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
  }, [leaderboard]);

  const top3 = React.useMemo(() => {
    const podium: { [key: number]: LeaderboardUser } = {};
    sortedItems.slice(0, 3).forEach((item) => {
      if (item.rank === 1 || item.rank === 2 || item.rank === 3) {
        podium[item.rank] = item;
      }
    });

    // Fallbacks if ranks are not numbered 1, 2, 3 exactly
    const list = sortedItems.slice(0, 3);
    return {
      first: podium[1] || list[0] || null,
      second: podium[2] || list[1] || null,
      third: podium[3] || list[2] || null,
    };
  }, [sortedItems]);

  const remainingUsers = React.useMemo(() => {
    return sortedItems.slice(3);
  }, [sortedItems]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading && !leaderboard) {
    return (
      <div className="lexi-leaderboard-status loading">
        <RefreshCw className="animate-spin" size={32} style={{ color: "var(--color-primary)" }} />
        <p>Đang tải bảng xếp hạng tuần mới nhất...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lexi-leaderboard-status error">
        <AlertCircle size={40} style={{ color: "#ef4444", marginBottom: "16px" }} />
        <h3>Lỗi kết nối máy chủ</h3>
        <p>{error}</p>
        <button className="lexi-btn-action-primary" onClick={onRefresh}>
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="lexi-leaderboard-root lexi-animate-fade">
      <div className="lexi-leaderboard-container">
        
        {/* Header */}
        <header className="lexi-leaderboard-header">
          <div className="header-badge">
            <Trophy size={16} />
            <span>Bảng Vinh Danh</span>
          </div>
          <h1>Bảng Xếp Hạng Tuần</h1>
          
          {leaderboard?.window ? (
            <div className="time-badge">
              <Calendar size={14} />
              <span>
                {new Date(leaderboard.window.startAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
                {" - "}
                {new Date(leaderboard.window.endAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
              </span>
            </div>
          ) : null}
        </header>

        {/* Podium for Top 3 */}
        {sortedItems.length > 0 ? (
          <div className="lexi-leaderboard-podium">
            
            {/* Second Place (Left) */}
            {top3.second && (
              <div className="podium-col second-place">
                <div className="podium-avatar-wrapper">
                  <div className="podium-rank-badge silver">2</div>
                  <div className="podium-avatar-ring silver">
                    {top3.second.avatarUrl ? (
                      <img src={top3.second.avatarUrl} alt={top3.second.fullName} />
                    ) : (
                      <span className="avatar-fallback">{getInitials(top3.second.fullName)}</span>
                    )}
                  </div>
                </div>
                <div className="podium-user-info">
                  <span className="name" title={top3.second.fullName}>
                    {top3.second.fullName}
                  </span>
                  <span className="xp-pill">{top3.second.xp} XP</span>
                </div>
                <div className="podium-pedestal silver">
                  <div className="shine"></div>
                </div>
              </div>
            )}

            {/* First Place (Center) */}
            {top3.first && (
              <div className="podium-col first-place">
                <Crown size={28} className="crown-icon" />
                <div className="podium-avatar-wrapper">
                  <div className="podium-rank-badge gold">1</div>
                  <div className="podium-avatar-ring gold">
                    {top3.first.avatarUrl ? (
                      <img src={top3.first.avatarUrl} alt={top3.first.fullName} />
                    ) : (
                      <span className="avatar-fallback">{getInitials(top3.first.fullName)}</span>
                    )}
                  </div>
                </div>
                <div className="podium-user-info">
                  <span className="name" title={top3.first.fullName}>
                    {top3.first.fullName}
                  </span>
                  <span className="xp-pill gold">{top3.first.xp} XP</span>
                </div>
                <div className="podium-pedestal gold">
                  <div className="shine"></div>
                </div>
              </div>
            )}

            {/* Third Place (Right) */}
            {top3.third && (
              <div className="podium-col third-place">
                <div className="podium-avatar-wrapper">
                  <div className="podium-rank-badge bronze">3</div>
                  <div className="podium-avatar-ring bronze">
                    {top3.third.avatarUrl ? (
                      <img src={top3.third.avatarUrl} alt={top3.third.fullName} />
                    ) : (
                      <span className="avatar-fallback">{getInitials(top3.third.fullName)}</span>
                    )}
                  </div>
                </div>
                <div className="podium-user-info">
                  <span className="name" title={top3.third.fullName}>
                    {top3.third.fullName}
                  </span>
                  <span className="xp-pill">{top3.third.xp} XP</span>
                </div>
                <div className="podium-pedestal bronze">
                  <div className="shine"></div>
                </div>
              </div>
            )}

          </div>
        ) : null}

        {/* Current User Standing Card */}
        {leaderboard?.currentUser && (
          <div className="lexi-leaderboard-my-card">
            <div className="my-standing-label">VỊ TRÍ CỦA BẠN</div>
            <div className="my-card-content">
              <div className="rank">
                #{leaderboard.currentUser.rank ?? "-"}
              </div>
              <div className="avatar">
                {leaderboard.currentUser.avatarUrl ? (
                  <img src={leaderboard.currentUser.avatarUrl} alt={leaderboard.currentUser.fullName} />
                ) : (
                  <span>{getInitials(leaderboard.currentUser.fullName)}</span>
                )}
              </div>
              <div className="user-details">
                <strong className="name">{leaderboard.currentUser.fullName} (Bạn)</strong>
                <span className="email">{session?.user?.email}</span>
              </div>
              <div className="xp">
                <strong>{leaderboard.currentUser.xp}</strong>
                <span>XP Tuần</span>
              </div>
            </div>
          </div>
        )}

        {/* Full List */}
        <div className="lexi-leaderboard-list-card">
          <table className="lexi-leaderboard-table">
            <thead>
              <tr>
                <th className="col-rank">Thứ hạng</th>
                <th className="col-user">Học viên</th>
                <th className="col-xp">XP tuần</th>
              </tr>
            </thead>
            <tbody>
              {remainingUsers.map((user) => {
                const isMe = user.isCurrentUser;
                return (
                  <tr key={user.id} className={isMe ? "row-me" : ""}>
                    <td className="col-rank">
                      <span className="rank-number">#{user.rank}</span>
                    </td>
                    <td className="col-user">
                      <div className="user-cell">
                        <div className="user-avatar">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.fullName} />
                          ) : (
                            <span>{getInitials(user.fullName)}</span>
                          )}
                        </div>
                        <div className="user-name">
                          <strong>{user.fullName}</strong>
                          {isMe && <span className="me-badge">Bạn</span>}
                        </div>
                      </div>
                    </td>
                    <td className="col-xp">
                      <span className="xp-text">{user.xp} XP</span>
                    </td>
                  </tr>
                );
              })}
              {sortedItems.length === 0 && (
                <tr>
                  <td colSpan={3} className="empty-cell">
                    Chưa có hoạt động học tập nào trong tuần này.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};
export default LeaderboardPage;
