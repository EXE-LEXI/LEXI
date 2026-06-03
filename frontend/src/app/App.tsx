import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "../components/layout/AppLayout";
import { AdminPage } from "../pages/AdminPage";
import { LessonPage } from "../pages/LessonPage";
import { LoginPage } from "../pages/LoginPage";
import { LandingPage } from "../pages/LandingPage";
import { ModulesPage } from "../pages/ModulesPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { ProfilePage } from "../pages/ProfilePage";
import { ResourcesPage } from "../pages/ResourcesPage";
import { ReviewPage } from "../pages/ReviewPage";
import { SettingsPage } from "../pages/SettingsPage";
import { ShortsPage } from "../pages/ShortsPage";
import { GamePage } from "../pages/GamePage";
import { LeaderboardPage } from "../pages/LeaderboardPage";
import { LearningHistoryPage } from "../pages/LearningHistoryPage";
import { AttemptDetailPage } from "../pages/AttemptDetailPage";
import { AccountSettingsPage } from "../pages/AccountSettingsPage";
import { NotificationCenterPage } from "../pages/NotificationCenterPage";
import { CommunityPage } from "../pages/CommunityPage";
import { SubscriptionPage } from "../pages/SubscriptionPage";
import { FeedbackPage } from "../pages/FeedbackPage";
import { RewardsPage } from "../pages/RewardsPage";
import {
  getAdminCategories,
  getAdminLessonDrafts,
  getAdminLessons,
  getAdminMediaAssets,
  getAdminModules,
  getAdminNotificationLogs,
  getAdminSources,
  type AdminCategory,
  type AdminDeliveryLog,
  type AdminDraft,
  type AdminLesson,
  type AdminMediaAsset,
  type AdminModule,
  type AdminSource,
} from "../api/admin";
import { API_BASE_URL } from "../api/config";
import {
  getCurrentUser,
  login,
  logout,
  refreshAuthSession,
  register,
} from "../api/auth";
import {
  claimDailyChallenge,
  getBadges,
  getCategories,
  getCurrentLesson,
  getDailyChallenges,
  getLessonDetail,
  getLearningHistory,
  getModules,
  getModulesByCategory,
  getNotificationPreferences,
  getProgressSummary,
  getReviewMistakes,
  getReviewRecommendations,
  getWeeklyLeaderboard,
  revokeDeviceToken,
  submitQuiz,
  updateNotificationPreferences,
  upsertDeviceToken,
} from "../api/learning";
import { ApiError } from "../api/http";
import { ROUTES } from "../routes/paths";
import {
  clearAuthSession,
  readAuthSession,
  saveAuthSession,
} from "../features/auth/authStorage";
import type { AuthResponse } from "../types/auth";
import type {
  LearningModule,
  LearningCategory,
  LessonDetail,
  Badge,
  DailyChallenge,
  NotificationPreferences,
  QuizSubmission,
  ReviewMistake,
  ReviewRecommendation,
  WeeklyLeaderboard,
} from "../types/learning";
import type { CurrentLesson, LearningHistoryItem, ProgressSummary } from "../types/progress";

type PageState = {
  path: string;
};

function App() {
  const [page, setPage] = useState<PageState>(() => ({
    path: window.location.pathname,
  }));
  const [initialSession] = useState<AuthResponse | null>(() => readAuthSession());
  const [session, setSession] = useState<AuthResponse | null>(initialSession);
  const [isSessionChecking, setIsSessionChecking] = useState(Boolean(initialSession));
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [currentLesson, setCurrentLesson] = useState<CurrentLesson | null>(null);
  const [categories, setCategories] = useState<LearningCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [quizResult, setQuizResult] = useState<QuizSubmission | null>(null);
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [leaderboard, setLeaderboard] = useState<WeeklyLeaderboard | null>(null);
  const [recommendations, setRecommendations] = useState<ReviewRecommendation[]>([]);
  const [mistakes, setMistakes] = useState<ReviewMistake[]>([]);
  const [history, setHistory] = useState<LearningHistoryItem[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [deviceToken, setDeviceToken] = useState("");
  const [adminCategories, setAdminCategories] = useState<AdminCategory[]>([]);
  const [adminModules, setAdminModules] = useState<AdminModule[]>([]);
  const [adminLessons, setAdminLessons] = useState<AdminLesson[]>([]);
  const [adminSources, setAdminSources] = useState<AdminSource[]>([]);
  const [adminDrafts, setAdminDrafts] = useState<AdminDraft[]>([]);
  const [adminMedia, setAdminMedia] = useState<AdminMediaAsset[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminDeliveryLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const lessonId = useMemo(() => {
    const match = page.path.match(/^\/lessons\/([^/]+)$/);
    return match?.[1] ?? null;
  }, [page.path]);

  const attemptId = useMemo(() => {
    const match = page.path.match(/^\/history\/([^/]+)$/);
    return match?.[1] ?? null;
  }, [page.path]);

  useEffect(() => {
    function handlePopState() {
      setPage({ path: window.location.pathname });
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (!initialSession) {
      return;
    }

    const refreshToken = initialSession.refreshToken;
    let isCancelled = false;

    async function restoreSession() {
      try {
        const auth = await refreshAuthSession(refreshToken);

        if (isCancelled) {
          return;
        }

        saveAuthSession(auth);
        setSession(auth);
      } catch {
        if (isCancelled) {
          return;
        }

        clearAuthSession();
        setSession(null);
        setPageError(null);
        setAuthError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } finally {
        if (!isCancelled) {
          setIsSessionChecking(false);
        }
      }
    }

    void restoreSession();

    return () => {
      isCancelled = true;
    };
  }, [initialSession]);

  useEffect(() => {
    if (isSessionChecking) {
      return;
    }

    if (
      !session &&
      page.path !== ROUTES.home &&
      page.path !== ROUTES.login &&
      page.path !== ROUTES.register &&
      page.path !== ROUTES.authCallback
    ) {
      navigate(ROUTES.login, true);
    }
  }, [isSessionChecking, session, page.path]);

  useEffect(() => {
    if (page.path !== ROUTES.authCallback || session) {
      return;
    }

    const hashParams = new URLSearchParams(
      window.location.hash.replace(/^#/, "")
    );
    const accessToken = hashParams.get("accessToken");
    const refreshToken = hashParams.get("refreshToken");

    if (!accessToken || !refreshToken) {
      setAuthError("Không thể hoàn tất đăng nhập Google. Vui lòng thử lại.");
      navigate(ROUTES.login, true);
      return;
    }

    let isCancelled = false;

    async function completeGoogleLogin() {
      setIsAuthSubmitting(true);
      setAuthError(null);

      try {
        const user = await getCurrentUser(accessToken as string);
        const auth: AuthResponse = {
          accessToken: accessToken as string,
          refreshToken: refreshToken as string,
          user,
        };

        if (isCancelled) {
          return;
        }

        saveAuthSession(auth);
        setSession(auth);
        navigate(
          auth.user.role === "ADMIN" ? ROUTES.admin : ROUTES.dashboard,
          true
        );
      } catch (error) {
        if (isCancelled) {
          return;
        }

        clearAuthSession();
        setAuthError(getErrorMessage(error));
        navigate(ROUTES.login, true);
      } finally {
        if (!isCancelled) {
          setIsAuthSubmitting(false);
        }
      }
    }

    void completeGoogleLogin();

    return () => {
      isCancelled = true;
    };
  }, [page.path, session]);

  useEffect(() => {
    if (!session || isSessionChecking) {
      return;
    }

    if (page.path === ROUTES.home || page.path === ROUTES.dashboard) {
      void loadDashboard(session.accessToken);
    }

    if (page.path === ROUTES.modules) {
      void loadModules(session.accessToken, selectedCategoryId);
    }

    if (page.path === ROUTES.review) {
      void loadReview(session.accessToken);
    }

    if (page.path === ROUTES.settings) {
      void loadSettings(session.accessToken);
    }

    if (page.path === ROUTES.admin && session.user.role === "ADMIN") {
      void loadAdmin(session.accessToken);
    }

    if (lessonId) {
      void loadLesson(session.accessToken, lessonId);
    }
  }, [isSessionChecking, session, page.path, lessonId, selectedCategoryId]);

  function navigate(path: string, replace = false) {
    if (window.location.pathname !== path) {
      if (replace) {
        window.history.replaceState({}, "", path);
      } else {
        window.history.pushState({}, "", path);
      }
    }
    setPage({ path });
  }

  function getErrorMessage(error: unknown) {
    if (error instanceof ApiError || error instanceof Error) {
      return error.message;
    }

    return "Unexpected error";
  }

  async function loadDashboard(token: string) {
    setLoading(true);
    setPageError(null);
    try {
      const [
        nextSummary,
        nextCurrentLesson,
        nextChallenges,
        nextBadges,
        nextLeaderboard,
        nextRecommendations,
        nextHistory,
      ] = await Promise.all([
        getProgressSummary(token),
        getCurrentLesson(token),
        getDailyChallenges(token),
        getBadges(token),
        getWeeklyLeaderboard(token),
        getReviewRecommendations(token),
        getLearningHistory(token, 1, 6),
      ]);
      setSummary(nextSummary);
      setCurrentLesson(nextCurrentLesson);
      setChallenges(nextChallenges.items);
      setBadges(nextBadges.items);
      setLeaderboard(nextLeaderboard);
      setRecommendations(nextRecommendations.items);
      setHistory(nextHistory.items);
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function loadModules(token: string, categoryId: string | null) {
    setLoading(true);
    setPageError(null);
    try {
      const [nextCategories, response] = await Promise.all([
        getCategories(token),
        categoryId
          ? getModulesByCategory(token, categoryId)
          : getModules(token),
      ]);
      setCategories(nextCategories);
      setModules(response.items);
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function loadLesson(token: string, id: string) {
    setLoading(true);
    setPageError(null);
    setQuizResult(null);
    try {
      setLesson(await getLessonDetail(token, id));
    } catch (error) {
      setLesson(null);
      setPageError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function loadReview(token: string) {
    setLoading(true);
    setPageError(null);
    try {
      const [nextRecommendations, nextMistakes] = await Promise.all([
        getReviewRecommendations(token),
        getReviewMistakes(token, 1, 20),
      ]);
      setRecommendations(nextRecommendations.items);
      setMistakes(nextMistakes.items);
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function loadSettings(token: string) {
    setLoading(true);
    setPageError(null);
    try {
      setPreferences(await getNotificationPreferences(token));
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function loadAdmin(token: string) {
    setLoading(true);
    setPageError(null);
    try {
      const [adminCategoryList, adminModuleList, lessons, sources, drafts, media, logs] = await Promise.all([
        getAdminCategories(token),
        getAdminModules(token),
        getAdminLessons(token),
        getAdminSources(token),
        getAdminLessonDrafts(token),
        getAdminMediaAssets(token),
        getAdminNotificationLogs(token),
      ]);
      setAdminCategories(adminCategoryList);
      setAdminModules(adminModuleList.items);
      setAdminLessons(lessons.items);
      setAdminSources(sources.items);
      setAdminDrafts(drafts.items);
      setAdminMedia(media.items);
      setAdminLogs(logs.items);
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleAuthSubmit(payload: {
    email: string;
    password: string;
    fullName?: string;
  }) {
    setIsAuthSubmitting(true);
    setAuthError(null);
    try {
      const auth =
        page.path === ROUTES.register
          ? await register({
              email: payload.email,
              password: payload.password,
              fullName: payload.fullName ?? "",
            })
          : await login({ email: payload.email, password: payload.password });

      saveAuthSession(auth);
      setSession(auth);
      navigate(auth.user.role === "ADMIN" ? ROUTES.admin : ROUTES.dashboard, true);
    } catch (error) {
      setAuthError(getErrorMessage(error));
    } finally {
      setIsAuthSubmitting(false);
    }
  }

  async function handleLogout() {
    const refreshToken = session?.refreshToken;
    clearAuthSession();
    setSession(null);
    setSummary(null);
    setCurrentLesson(null);
    setChallenges([]);
    setBadges([]);
    setLeaderboard(null);
    setRecommendations([]);
    setMistakes([]);
    setHistory([]);
    setPreferences(null);
    setModules([]);
    setLesson(null);
    setQuizResult(null);
    navigate(ROUTES.login);

    if (refreshToken) {
      try {
        await logout(refreshToken);
      } catch {
        // Local logout should still complete when the token is already invalid.
      }
    }
  }

  async function handleQuizSubmit(answersByQuestion: Record<string, string>) {
    if (!session || !lesson) {
      return;
    }

    setLoading(true);
    setPageError(null);
    try {
      const answers = Object.entries(answersByQuestion).map(
        ([questionId, selectedOptionId]) => ({
          questionId,
          optionId: selectedOptionId,
        })
      );
      setQuizResult(await submitQuiz(session.accessToken, lesson.id, answers));
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleClaimChallenge(challengeId: string) {
    if (!session) {
      return;
    }

    setLoading(true);
    setPageError(null);
    try {
      await claimDailyChallenge(session.accessToken, challengeId);
      const [nextChallenges, nextSummary] = await Promise.all([
        getDailyChallenges(session.accessToken),
        getProgressSummary(session.accessToken),
      ]);
      setChallenges(nextChallenges.items);
      setSummary(nextSummary);
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleSavePreferences(payload: Partial<NotificationPreferences>) {
    if (!session) {
      return;
    }

    setLoading(true);
    setPageError(null);
    try {
      setPreferences(
        await updateNotificationPreferences(session.accessToken, payload)
      );
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterDeviceToken() {
    if (!session || !deviceToken) {
      return;
    }

    setLoading(true);
    setPageError(null);
    try {
      await upsertDeviceToken(session.accessToken, deviceToken);
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleRevokeDeviceToken() {
    if (!session || !deviceToken) {
      return;
    }

    setLoading(true);
    setPageError(null);
    try {
      await revokeDeviceToken(session.accessToken, deviceToken);
      setDeviceToken("");
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  const mode = page.path === ROUTES.register ? "register" : "login";

  if (isSessionChecking) {
    return null;
  }

  if (!session) {
    if (page.path === ROUTES.home) {
      return <LandingPage onNavigate={navigate} />;
    }
    if (page.path === ROUTES.authCallback) {
      return (
        <div className="lexi-auth-root">
          <div className="lexi-register-form-container">
            <h2>Đang hoàn tất đăng nhập Google</h2>
            <p className="subtitle">
              Vui lòng chờ trong giây lát để LEXI thiết lập phiên đăng nhập.
            </p>
          </div>
        </div>
      );
    }
    return (
      <LoginPage
        mode={mode}
        isSubmitting={isAuthSubmitting}
        error={authError}
        onSubmit={handleAuthSubmit}
        onModeChange={(nextMode) =>
          navigate(nextMode === "register" ? ROUTES.register : ROUTES.login)
        }
      />
    );
  }

  if (page.path === ROUTES.admin && session?.user?.role === "ADMIN") {
    return (
      <AdminPage
        categories={adminCategories}
        modules={adminModules}
        lessons={adminLessons}
        sources={adminSources}
        drafts={adminDrafts}
        mediaAssets={adminMedia}
        deliveryLogs={adminLogs}
        isLoading={loading}
        error={pageError}
        session={session}
        onNavigate={navigate}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <AppLayout session={session} onNavigate={navigate} onLogout={handleLogout}>
      {page.path === ROUTES.home || page.path === ROUTES.dashboard ? (
        <LandingPage
          onNavigate={navigate}
          session={session}
        />
      ) : page.path === ROUTES.modules ? (
        <ModulesPage
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          modules={modules}
          isLoading={loading}
          error={pageError}
          onSelectCategory={setSelectedCategoryId}
          onOpenLesson={(id) => navigate(`/lessons/${id}`)}
          session={session}
          onNavigate={navigate}
        />
      ) : page.path === ROUTES.review ? (
        <ReviewPage
          recommendations={recommendations}
          mistakes={mistakes}
          isLoading={loading}
          error={pageError}
          onOpenLesson={(id) => navigate(`/lessons/${id}`)}
        />
      ) : page.path === ROUTES.settings ? (
        <SettingsPage
          preferences={preferences}
          deviceToken={deviceToken}
          isLoading={loading}
          error={pageError}
          onSavePreferences={handleSavePreferences}
          onDeviceTokenChange={setDeviceToken}
          onRegisterDeviceToken={handleRegisterDeviceToken}
          onRevokeDeviceToken={handleRevokeDeviceToken}
        />
      ) : page.path === ROUTES.admin && session.user.role === "ADMIN" ? (
        <AdminPage
          categories={adminCategories}
          modules={adminModules}
          lessons={adminLessons}
          sources={adminSources}
          drafts={adminDrafts}
          mediaAssets={adminMedia}
          deliveryLogs={adminLogs}
          isLoading={loading}
          error={pageError}
          session={session}
          onNavigate={navigate}
          onLogout={handleLogout}
        />
      ) : page.path === ROUTES.profile ? (
        <ProfilePage
          session={session}
          onNavigate={navigate}
        />
      ) : page.path === ROUTES.leaderboard ? (
        <LeaderboardPage
          leaderboard={leaderboard}
          isLoading={loading}
          error={pageError}
          onRefresh={() => loadDashboard(session.accessToken)}
          session={session}
        />
      ) : page.path === ROUTES.history ? (
        <LearningHistoryPage
          token={session.accessToken}
          onNavigate={navigate}
        />
      ) : attemptId ? (
        <AttemptDetailPage
          token={session.accessToken}
          attemptId={attemptId}
          onNavigate={navigate}
        />
      ) : page.path === ROUTES.account ? (
        <AccountSettingsPage
          token={session.accessToken}
          session={session}
          onUpdateSession={setSession}
        />
      ) : page.path === ROUTES.notifications ? (
        <NotificationCenterPage
          session={session}
          onNavigate={navigate}
        />
      ) : page.path === ROUTES.community ? (
        <CommunityPage
          session={session}
          onNavigate={navigate}
        />
      ) : page.path === ROUTES.subscription ? (
        <SubscriptionPage
          session={session}
          onNavigate={navigate}
        />
      ) : page.path === ROUTES.feedback ? (
        <FeedbackPage
          token={session.accessToken}
          onNavigate={navigate}
        />
      ) : page.path === ROUTES.rewards ? (
        <RewardsPage token={session.accessToken} />
      ) : page.path === ROUTES.resources ? (
        <ResourcesPage token={session.accessToken} />
      ) : page.path === ROUTES.shorts ? (
        <ShortsPage
          session={session}
          onNavigate={navigate}
        />
      ) : page.path === ROUTES.game ? (
        <GamePage
          session={session}
          onNavigate={navigate}
        />
      ) : lessonId ? (
        <LessonPage
          token={session.accessToken}
          lesson={lesson}
          result={quizResult}
          isLoading={loading && !lesson}
          isSubmitting={loading && Boolean(lesson)}
          error={pageError}
          onSubmit={handleQuizSubmit}
          onBack={() => navigate(ROUTES.modules)}
        />
      ) : (
        <NotFoundPage />
      )}
    </AppLayout>
  );
}

export default App;
