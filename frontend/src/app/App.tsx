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
import { ToastContainer } from "../components/Toast/Toast";
import { useToast } from "../hooks/useToast";
import {
  crawlAdminLegalSources,
  getAdminLessonDrafts,
  getAdminLessons,
  getAdminMediaAssets,
  getAdminNotificationLogs,
  getAdminSources,
  processAdminLegalSources,
  type AdminCrawlResponse,
  type AdminDeliveryLog,
  type AdminDraft,
  type AdminLesson,
  type AdminMediaAsset,
  type AdminSource,
} from "../api/admin";
import { API_BASE_URL } from "../api/config";
import { login, logout, register } from "../api/auth";
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
import {
  getRecommendations,
  getLearningProfile,
  getLearningConsistency,
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
  ContentRecommendation,
  UserLearningProfile,
  LearningConsistency,
} from "../types/learning";
import type { CurrentLesson, LearningHistoryItem, ProgressSummary } from "../types/progress";

type PageState = {
  path: string;
};

function App() {
  const [page, setPage] = useState<PageState>(() => ({
    path: window.location.pathname,
  }));
  const [session, setSession] = useState<AuthResponse | null>(() =>
    readAuthSession()
  );
  const { toasts, removeToast, success, error, info, warning } = useToast();
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
  const [adminLessons, setAdminLessons] = useState<AdminLesson[]>([]);
  const [adminSources, setAdminSources] = useState<AdminSource[]>([]);
  const [adminDrafts, setAdminDrafts] = useState<AdminDraft[]>([]);
  const [adminMedia, setAdminMedia] = useState<AdminMediaAsset[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminDeliveryLog[]>([]);
  const [adminCrawlResult, setAdminCrawlResult] = useState<AdminCrawlResponse | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<ContentRecommendation[]>([]);
  const [aiLearningProfile, setAiLearningProfile] = useState<UserLearningProfile | null>(null);
  const [aiConsistency, setAiConsistency] = useState<LearningConsistency | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const lessonId = useMemo(() => {
    const match = page.path.match(/^\/lessons\/([^/]+)$/);
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
    if (!session && page.path !== ROUTES.home && page.path !== ROUTES.login && page.path !== ROUTES.register) {
      navigate(ROUTES.login, true);
    }
  }, [session, page.path]);

  useEffect(() => {
    if (!session) {
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
  }, [session, page.path, lessonId, selectedCategoryId]);

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
        nextAiRecommendations,
        nextAiProfile,
        nextAiConsistency,
      ] = await Promise.all([
        getProgressSummary(token),
        getCurrentLesson(token),
        getDailyChallenges(token),
        getBadges(token),
        getWeeklyLeaderboard(token),
        getReviewRecommendations(token),
        getLearningHistory(token, 1, 6),
        getRecommendations(token, 5).catch(() => []),
        getLearningProfile(token).catch(() => null),
        getLearningConsistency(token).catch(() => null),
      ]);
      setSummary(nextSummary);
      setCurrentLesson(nextCurrentLesson);
      setChallenges(nextChallenges.items);
      setBadges(nextBadges.items);
      setLeaderboard(nextLeaderboard);
      setRecommendations(nextRecommendations.items);
      setHistory(nextHistory.items);
      setAiRecommendations(nextAiRecommendations);
      setAiLearningProfile(nextAiProfile);
      setAiConsistency(nextAiConsistency);
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
      const [lessons, sources, drafts, media, logs] = await Promise.all([
        getAdminLessons(token),
        getAdminSources(token),
        getAdminLessonDrafts(token),
        getAdminMediaAssets(token),
        getAdminNotificationLogs(token),
      ]);
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

  async function refreshAdmin(token: string) {
    await loadAdmin(token);
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
      navigate(ROUTES.dashboard, true);
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
          selectedOptionId,
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

  async function handleCrawlLegalSources(payload: {
    urls: string[];
    moduleId?: string | null;
    generateDrafts?: boolean;
    questionCount?: number;
  }) {
    if (!session) {
      return;
    }

    if (payload.urls.length === 0) {
      warning("Vui lòng nhập ít nhất một URL");
      return;
    }

    setLoading(true);
    setPageError(null);
    const toastId = info(`Đang cào ${payload.urls.length} URL...`, 0);
    try {
      const result = await crawlAdminLegalSources(session.accessToken, payload);
      removeToast(toastId);

      if (result.errors.length > 0) {
        const errorCount = result.errors.length;
        const successCount = result.sources.length;
        warning(
          `Hoàn tất: ${successCount} thành công, ${errorCount} lỗi. Xem chi tiết dưới đây.`
        );
        result.errors.forEach((err) => {
          error(`${err.url}: ${err.message}`, 5000);
        });
      } else if (result.sources.length > 0) {
        success(
          `Cào thành công ${result.sources.length} nguồn${
            result.drafts.length > 0 ? ` và tạo ${result.drafts.length} bản nháp` : ""
          }`
        );
      } else {
        info("Không tìm thấy nội dung để cào");
      }

      setAdminCrawlResult(result);
      await refreshAdmin(session.accessToken);
    } catch (err) {
      removeToast(toastId);
      const errorMsg = getErrorMessage(err);
      error(errorMsg);
      setPageError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  async function handleProcessLegalSources(payload: {
    moduleId?: string | null;
    limit?: number;
    questionCount?: number;
  }) {
    if (!session) {
      return;
    }

    setLoading(true);
    setPageError(null);
    const toastId = info("Đang xử lý nguồn đã cào...", 0);
    try {
      const drafts = await processAdminLegalSources(session.accessToken, payload);
      removeToast(toastId);
      success(`Tạo thành công ${drafts.length} bản nháp mới`);
      await refreshAdmin(session.accessToken);
    } catch (err) {
      removeToast(toastId);
      const errorMsg = getErrorMessage(err);
      error(errorMsg);
      setPageError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  const mode = page.path === ROUTES.register ? "register" : "login";

  if (!session) {
    if (page.path === ROUTES.home) {
      return <LandingPage onNavigate={navigate} />;
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
          lessons={adminLessons}
          sources={adminSources}
          drafts={adminDrafts}
          mediaAssets={adminMedia}
          deliveryLogs={adminLogs}
          isLoading={loading}
          error={pageError}
          crawlResult={adminCrawlResult}
          onCrawlLegalSources={handleCrawlLegalSources}
          onProcessLegalSources={handleProcessLegalSources}
        />
      ) : page.path === ROUTES.profile ? (
        <ProfilePage
          session={session}
          aiRecommendations={aiRecommendations}
          aiLearningProfile={aiLearningProfile}
          aiConsistency={aiConsistency}
          onNavigate={navigate}
        />
      ) : page.path === ROUTES.resources ? (
        <ResourcesPage />
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
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </AppLayout>
  );
}

export default App;
