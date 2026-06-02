import React, { useEffect, useState } from "react";
import type {
  AdminCategory,
  AdminDeliveryLog,
  AdminDraft,
  AdminLesson,
  AdminMediaAsset,
  AdminModule,
  AdminQuestion,
  AdminSource,
} from "../api/admin";
import { deleteAdminQuestion, getAdminQuestions } from "../api/admin";
import type { AuthResponse } from "../types/auth";
import { AdminSidebar } from "../components/admin/AdminSidebar";
import { AdminHeader } from "../components/admin/AdminHeader";
import { DashboardTab } from "../components/admin/DashboardTab";
import { ModulesTab } from "../components/admin/ModulesTab";
import { LessonsTab } from "../components/admin/LessonsTab";
import { QuizzesTab } from "../components/admin/QuizzesTab";
import { UsersTab } from "../components/admin/UsersTab";
import { MediaTab } from "../components/admin/MediaTab";
import { LogsTab } from "../components/admin/LogsTab";
import { SettingsTab } from "../components/admin/SettingsTab";
import { LessonDrawer } from "../components/admin/LessonDrawer";
import { QuestionDrawer } from "../components/admin/QuestionDrawer";
import { SourcesTab } from "../components/admin/SourcesTab";
import { AiDraftsTab } from "../components/admin/AiDraftsTab";
import { FeedbackReportsTab } from "../components/admin/FeedbackReportsTab";
import { VouchersTab } from "../components/admin/VouchersTab";

type AdminTabType =
  | "dashboard"
  | "modules"
  | "lessons"
  | "quizzes"
  | "users"
  | "media"
  | "logs"
  | "settings"
  | "sources"
  | "aiDrafts"
  | "feedback"
  | "vouchers";

type AdminPageProps = {
  categories: AdminCategory[];
  modules: AdminModule[];
  lessons: AdminLesson[];
  sources: AdminSource[];
  drafts: AdminDraft[];
  mediaAssets: AdminMediaAsset[];
  deliveryLogs: AdminDeliveryLog[];
  isLoading: boolean;
  error: string | null;
  session?: AuthResponse | null;
  onNavigate?: (path: string) => void;
  onLogout?: () => void;
};

export function AdminPage({
  categories: initialCategories,
  modules: initialModules,
  lessons: initialLessons,
  sources,
  drafts,
  mediaAssets: initialMedia,
  deliveryLogs,
  session,
  onNavigate,
  onLogout,
}: AdminPageProps) {
  const [activeTab, setActiveTab] = useState<AdminTabType>("dashboard");
  const [localCategories, setLocalCategories] = useState<AdminCategory[]>([]);
  const [localModules, setLocalModules] = useState<AdminModule[]>([]);
  const [localLessons, setLocalLessons] = useState<AdminLesson[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [questionTypeFilter, setQuestionTypeFilter] = useState("all");
  const [isQuestionDrawerOpen, setIsQuestionDrawerOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<AdminLesson | null>(null);
  const [isCreatingLesson, setIsCreatingLesson] = useState(false);
  const [selectedLessonIdForQuiz, setSelectedLessonIdForQuiz] = useState("");
  const [quizQuestions, setQuizQuestions] = useState<AdminQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [adminNotice, setAdminNotice] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<AdminQuestion | null>(null);

  const token = session?.accessToken || "";

  useEffect(() => setLocalCategories(initialCategories), [initialCategories]);
  useEffect(() => setLocalModules(initialModules), [initialModules]);
  useEffect(() => setLocalLessons(initialLessons), [initialLessons]);

  useEffect(() => {
    if (selectedLessonIdForQuiz && session) {
      void fetchQuestions(selectedLessonIdForQuiz);
    } else {
      setQuizQuestions([]);
    }
  }, [selectedLessonIdForQuiz, session]);

  async function fetchQuestions(lessonId: string) {
    setIsLoadingQuestions(true);
    try {
      const data = await getAdminQuestions(token, lessonId);
      setQuizQuestions(data || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách câu hỏi:", err);
    } finally {
      setIsLoadingQuestions(false);
    }
  }

  function handleEditQuestion(question: AdminQuestion) {
    setEditingQuestion(question);
    setIsQuestionDrawerOpen(true);
  }

  async function handleDeleteQuestion(questionId: string) {
    if (!window.confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) return;
    try {
      await deleteAdminQuestion(token, questionId);
      setQuizQuestions((prev) => prev.filter((question) => question.id !== questionId));
      setAdminNotice("Đã xóa câu hỏi.");
    } catch (err: any) {
      setAdminNotice("Không thể xóa câu hỏi: " + (err.message || err));
    }
  }

  function handleSaveQuestion(savedQuestion: AdminQuestion, isEdit: boolean) {
    setQuizQuestions((prev) =>
      isEdit
        ? prev.map((question) => (question.id === savedQuestion.id ? savedQuestion : question))
        : [...prev, savedQuestion]
    );
  }

  function handleEditLesson(lesson: AdminLesson) {
    setIsCreatingLesson(false);
    setEditingLesson({ ...lesson });
  }

  function handleCreateLesson() {
    setEditingLesson(null);
    setIsCreatingLesson(true);
  }

  function updateModuleLessonCount(lesson: AdminLesson) {
    if (!lesson.module?.id) return;
    setLocalModules((prev) =>
      prev.map((module) =>
        module.id === lesson.module?.id
          ? { ...module, lessonCount: module.lessonCount + 1 }
          : module
      )
    );
  }

  function handleSaveLesson(updatedLesson: AdminLesson, isCreate?: boolean) {
    setLocalLessons((prev) =>
      isCreate
        ? [updatedLesson, ...prev]
        : prev.map((lesson) => (lesson.id === updatedLesson.id ? updatedLesson : lesson))
    );
    if (isCreate) updateModuleLessonCount(updatedLesson);
  }

  function handleManageLessonQuiz(lessonId: string) {
    setSelectedLessonIdForQuiz(lessonId);
    setActiveTab("quizzes");
  }

  function handleSetQuizForm(form: any) {
    setEditingQuestion(form);
    setIsQuestionDrawerOpen(true);
  }

  function handleAddQuestion() {
    setEditingQuestion(null);
    setIsQuestionDrawerOpen(true);
  }

  return (
    <div className="lexi-cms-root">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />

      <main className="lexi-cms-main">
        <AdminHeader activeTab={activeTab} searchQuery={searchQuery} setSearchQuery={setSearchQuery} session={session} onNavigate={onNavigate} />

        {adminNotice && <div className="lexi-inline-notice"><span>{adminNotice}</span></div>}

        {activeTab === "dashboard" && (
          <DashboardTab
            lessons={localLessons}
            sources={sources}
            drafts={drafts}
            mediaAssets={initialMedia}
            deliveryLogs={deliveryLogs}
            setActiveTab={setActiveTab}
            setSelectedLessonIdForQuiz={setSelectedLessonIdForQuiz}
            setQuizForm={handleSetQuizForm}
          />
        )}

        {activeTab === "modules" && (
          <ModulesTab
            token={token}
            categories={localCategories}
            initialModules={localModules}
            searchQuery={searchQuery}
            onModulesChange={setLocalModules}
          />
        )}

        {activeTab === "lessons" && (
          <LessonsTab
            lessons={localLessons}
            searchQuery={searchQuery}
            onEditLesson={handleEditLesson}
            onCreateLesson={handleCreateLesson}
            onManageQuiz={handleManageLessonQuiz}
          />
        )}

        {activeTab === "quizzes" && (
          <QuizzesTab
            token={token}
            lessons={localLessons}
            quizQuestions={quizQuestions}
            selectedLessonIdForQuiz={selectedLessonIdForQuiz}
            setSelectedLessonIdForQuiz={setSelectedLessonIdForQuiz}
            questionTypeFilter={questionTypeFilter}
            setQuestionTypeFilter={setQuestionTypeFilter}
            searchQuery={searchQuery}
            isLoadingQuestions={isLoadingQuestions}
            onEditQuestion={handleEditQuestion}
            onDeleteQuestion={(questionId) => void handleDeleteQuestion(questionId)}
            onAddQuestion={handleAddQuestion}
            onRefreshQuestions={() => fetchQuestions(selectedLessonIdForQuiz)}
          />
        )}

        {activeTab === "users" && (session ? <UsersTab token={session.accessToken} searchQuery={searchQuery} /> : <p className="form-error">Yêu cầu phiên đăng nhập quản trị viên.</p>)}
        {activeTab === "media" && <MediaTab token={token} initialMedia={initialMedia} lessons={localLessons} />}
        {activeTab === "feedback" && (session ? <FeedbackReportsTab token={session.accessToken} searchQuery={searchQuery} /> : <p className="form-error">Yêu cầu phiên đăng nhập quản trị viên.</p>)}
        {activeTab === "vouchers" && (session ? <VouchersTab token={session.accessToken} /> : <p className="form-error">Yêu cầu phiên đăng nhập quản trị viên.</p>)}
        {activeTab === "logs" && <LogsTab deliveryLogs={deliveryLogs} />}
        {activeTab === "settings" && <SettingsTab />}
        {activeTab === "sources" && <SourcesTab token={token} initialSources={sources} modules={localModules} />}
        {activeTab === "aiDrafts" && (
          <AiDraftsTab
            token={token}
            initialDrafts={drafts}
            sources={sources}
            modules={localModules}
            lessons={localLessons}
            onLessonCreated={(newLesson) => {
              setLocalLessons((prev) => [newLesson, ...prev]);
              updateModuleLessonCount(newLesson);
            }}
          />
        )}
      </main>

      {isQuestionDrawerOpen && (
        <QuestionDrawer
          token={token}
          selectedLessonIdForQuiz={selectedLessonIdForQuiz}
          initialData={editingQuestion}
          lessons={localLessons}
          onClose={() => setIsQuestionDrawerOpen(false)}
          onSave={handleSaveQuestion}
        />
      )}

      {(editingLesson || isCreatingLesson) && (
        <LessonDrawer
          lesson={editingLesson}
          lessons={localLessons}
          modules={localModules}
          token={token}
          onClose={() => {
            setEditingLesson(null);
            setIsCreatingLesson(false);
          }}
          onSave={handleSaveLesson}
        />
      )}
    </div>
  );
}
