import { formatDate, formatPercent } from "../utils/format";
import type {
  Badge,
  DailyChallenge,
  ReviewRecommendation,
  WeeklyLeaderboard,
} from "../types/learning";
import type { CurrentLesson, ProgressSummary } from "../types/progress";

type DashboardPageProps = {
  apiBaseUrl: string;
  summary: ProgressSummary | null;
  currentLesson: CurrentLesson | null;
  challenges: DailyChallenge[];
  badges: Badge[];
  leaderboard: WeeklyLeaderboard | null;
  recommendations: ReviewRecommendation[];
  isLoading: boolean;
  error: string | null;
  onOpenModules: () => void;
  onOpenLesson: (lessonId: string) => void;
  onClaimChallenge: (challengeId: string) => void;
};

export function DashboardPage({
  apiBaseUrl,
  summary,
  currentLesson,
  challenges,
  badges,
  leaderboard,
  recommendations,
  isLoading,
  error,
  onOpenModules,
  onOpenLesson,
  onClaimChallenge,
}: DashboardPageProps) {
  const unlockedBadges = badges.filter((badge) => badge.isUnlocked);
  const levelProgress =
    summary && summary.stats.nextLevelXp > 0
      ? (summary.stats.currentLevelXp / summary.stats.nextLevelXp) * 100
      : 0;

  return (
    <main className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">LEXI Academy</p>
          <h1>
            {summary
              ? `Chao, ${summary.user.fullName}`
              : "Dau truong kien thuc phap luat"}
          </h1>
          <p className="summary">
            Hoan thanh nhiem vu ngay, leo bang xep hang, mo huy hieu va ha
            boss quiz bang kien thuc luat thuc chien.
          </p>
          <button
            className="button button-primary hero-action"
            onClick={() =>
              currentLesson?.currentLesson
                ? onOpenLesson(currentLesson.currentLesson.id)
                : onOpenModules()
            }
          >
            {currentLesson?.currentLesson ? "Tiep tuc tran dau" : "Mo ban do hoc"}
          </button>
        </div>
        <aside className="status-panel">
          <span>Server gate</span>
          <strong>{apiBaseUrl}</strong>
          <small>Level {summary?.stats.level ?? 1}</small>
        </aside>
      </section>

      {isLoading ? <p className="notice">Loading dashboard...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      <section className="content-grid">
        <article className="panel">
          <h2>Quest Progress</h2>
          <div className="metric">
            <strong>{summary?.lessons.completed ?? 0}</strong>
            <span>/{summary?.lessons.total ?? 0} lessons completed</span>
          </div>
          <div className="progress-track">
            <span
              style={{ width: `${summary?.lessons.completionRate ?? 0}%` }}
            />
          </div>
          <p className="muted">
            Completion {formatPercent(summary?.lessons.completionRate ?? 0)}
          </p>
        </article>

        <article className="panel">
          <h2>Player Stats</h2>
          <dl className="stat-list">
            <div>
              <dt>XP</dt>
              <dd>{summary?.stats.xp ?? 0}</dd>
            </div>
            <div>
              <dt>Streak</dt>
              <dd>{summary?.stats.streak ?? 0}</dd>
            </div>
            <div>
              <dt>Level</dt>
              <dd>{summary?.stats.level ?? 1}</dd>
            </div>
          </dl>
          <div className="progress-track level-track">
            <span style={{ width: `${Math.min(levelProgress, 100)}%` }} />
          </div>
          <p className="muted">
            {summary?.stats.currentLevelXp ?? 0}/{summary?.stats.nextLevelXp ?? 0} XP
            to next level
          </p>
        </article>

        <article className="panel">
          <h2>Daily Goal</h2>
          <div className="metric">
            <strong>{summary?.dailyGoal.completedLessons ?? 0}</strong>
            <span>/{summary?.dailyGoal.targetLessons ?? 0} quests</span>
          </div>
          <div className="progress-track">
            <span
              style={{ width: `${summary?.dailyGoal.completionRate ?? 0}%` }}
            />
          </div>
          <p className="muted">
            Goal {formatPercent(summary?.dailyGoal.completionRate ?? 0)}
          </p>
        </article>
      </section>

      <section className="wide-grid">
        <article className="panel">
          <h2>Daily Challenges</h2>
          <ul className="quest-list">
            {challenges.map((challenge) => (
              <li key={challenge.id}>
                <div>
                  <strong>{challenge.title}</strong>
                  <span>{challenge.description}</span>
                  <div className="progress-track mini-track">
                    <span style={{ width: `${challenge.progressRate}%` }} />
                  </div>
                </div>
                <button
                  className="button button-secondary"
                  type="button"
                  disabled={!challenge.isCompleted || challenge.isClaimed}
                  onClick={() => onClaimChallenge(challenge.id)}
                >
                  {challenge.isClaimed ? "Claimed" : `+${challenge.rewardXp} XP`}
                </button>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <h2>Weekly Arena</h2>
          {leaderboard?.items.length ? (
            <ol className="rank-list">
              {leaderboard.items.slice(0, 5).map((user) => (
                <li
                  className={user.isCurrentUser ? "rank-row current-player" : "rank-row"}
                  key={user.id}
                >
                  <span>#{user.rank ?? "-"}</span>
                  <strong>{user.fullName}</strong>
                  <em>{user.xp} XP</em>
                </li>
              ))}
            </ol>
          ) : (
            <p className="muted">No leaderboard data yet.</p>
          )}
        </article>

        <article className="panel">
          <h2>Review Radar</h2>
          <ul className="plain-list">
            {recommendations.slice(0, 4).map((item) => (
              <li key={`${item.lesson.id}-${item.reasonCode}`}>
                <button
                  className="text-card-button"
                  type="button"
                  onClick={() => onOpenLesson(item.lesson.id)}
                >
                  <strong>{item.lesson.title}</strong>
                  <span>{item.reasonText}</span>
                </button>
              </li>
            ))}
          </ul>
          {!recommendations.length ? (
            <p className="muted">No review quests waiting.</p>
          ) : null}
        </article>
      </section>

      <section className="content-grid">
        <article className="panel">
          <h2>Badges</h2>
          <div className="badge-grid">
            {badges.slice(0, 8).map((badge) => (
              <span
                className={badge.isUnlocked ? "badge unlocked" : "badge"}
                key={badge.id}
                title={badge.description}
              >
                {badge.title}
              </span>
            ))}
          </div>
          <p className="muted">
            {unlockedBadges.length}/{badges.length} unlocked
          </p>
        </article>

        <article className="panel panel-span-2">
          <h2>Battle Log</h2>
          {summary?.recentAttempts.length ? (
            <ul className="plain-list">
              {summary.recentAttempts.slice(0, 6).map((attempt) => (
                <li key={attempt.id}>
                  <strong>{attempt.lessonTitle}</strong>
                  <span>
                    {attempt.score}% - {formatDate(attempt.finishedAt)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No completed attempts yet.</p>
          )}
        </article>
      </section>
    </main>
  );
}
