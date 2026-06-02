import React, { useState, useEffect } from "react";
import type {
  AdminDeliveryLog,
  AdminDraft,
  AdminLesson,
  AdminMediaAsset,
  AdminSource,
  AdminQuestion
} from "../api/admin";
import {
  getAdminQuestions,
  deleteAdminQuestion
} from "../api/admin";
import type { AuthResponse } from "../types/auth";

// Import modularized sub-components
import { AdminSidebar } from "../components/admin/AdminSidebar";
import { AdminHeader } from "../components/admin/AdminHeader";
import { DashboardTab } from "../components/admin/DashboardTab";
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
  lessons: initialLessons,
  sources,
  drafts,
  mediaAssets: initialMedia,
  deliveryLogs,
  isLoading,
  error: pageError,
  session,
  onNavigate,
  onLogout,
}: AdminPageProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<AdminTabType>("dashboard");

  // Local state for interactive updates
  const [localLessons, setLocalLessons] = useState<AdminLesson[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [questionTypeFilter, setQuestionTypeFilter] = useState("all");
  const [isQuestionDrawerOpen, setIsQuestionDrawerOpen] = useState(false);

  // Drawer edit states
  const [editingLesson, setEditingLesson] = useState<AdminLesson | null>(null);

  // Quiz builder states
  const [selectedLessonIdForQuiz, setSelectedLessonIdForQuiz] = useState<string>("");
  const [quizQuestions, setQuizQuestions] = useState<AdminQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [adminNotice, setAdminNotice] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<{
    id: string;
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOptionIndex: number;
    explanation: string;
  } | null>(null);

  // Sync initial props to state
  useEffect(() => {
    setLocalLessons(initialLessons);
  }, [initialLessons]);

  // Load questions when selected lesson changes
  useEffect(() => {
    if (selectedLessonIdForQuiz && session) {
      void fetchQuestions(selectedLessonIdForQuiz);
    } else {
      setQuizQuestions([]);
    }
  }, [selectedLessonIdForQuiz, session]);

  const token = session?.accessToken || "";

  // ── QUIZ QUESTIONS LOGIC ──
  const fetchQuestions = async (lessonId: string) => {
    setIsLoadingQuestions(true);
    try {
      const data = await getAdminQuestions(token, lessonId);
      setQuizQuestions(data || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách câu hỏi:", err);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleEditQuestion = (q: AdminQuestion) => {
    setEditingQuestion({
      id: q.id,
      questionText: q.text,
      optionA: q.options[0]?.text || "",
      optionB: q.options[1]?.text || "",
      optionC: q.options[2]?.text || "",
      optionD: q.options[3]?.text || "",
      correctOptionIndex: q.options.findIndex((o: any) => o.isCorrect) >= 0 ? q.options.findIndex((o: any) => o.isCorrect) : 0,
      explanation: q.explanation || ""
    });
    setIsQuestionDrawerOpen(true);
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) return;

    try {
      await deleteAdminQuestion(token, qId);
      setQuizQuestions(prev => prev.filter(q => q.id !== qId));
      setAdminNotice("Đã xóa câu hỏi.");
    } catch (err: any) {
      setAdminNotice("Không thể xóa câu hỏi: " + (err.message || err));
    }
  };

  const handleSaveQuestion = (savedQuestion: AdminQuestion, isEdit: boolean) => {
    if (isEdit) {
      setQuizQuestions(prev => prev.map(q => q.id === savedQuestion.id ? savedQuestion : q));
    } else {
      setQuizQuestions(prev => [...prev, savedQuestion]);
    }
  };

  const handleEditLesson = (lesson: AdminLesson) => {
    setEditingLesson({ ...lesson });
  };

  const handleSaveLesson = (updatedLesson: AdminLesson) => {
    setLocalLessons(prev =>
      prev.map(l => l.id === updatedLesson.id ? updatedLesson : l)
    );
  };

  const handleSetQuizForm = (form: any) => {
    setEditingQuestion(form);
    setIsQuestionDrawerOpen(true);
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setIsQuestionDrawerOpen(true);
  };

  return (
    <div className="lexi-cms-root">
      
      {/* SIDEBAR NAVIGATION */}
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={onLogout} 
      />

      {/* MAIN WORKSPACE CONTENT AREA */}
      <main className="lexi-cms-main">
        
        {/* Top Header Row */}
        <AdminHeader 
          activeTab={activeTab} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          session={session} 
          onNavigate={onNavigate} 
        />

        {adminNotice ? (
          <div className="lexi-inline-notice">
            <span>{adminNotice}</span>
          </div>
        ) : null}

        {/* Dynamic Panel Content based on Active Tab */}
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

        {activeTab === "lessons" && (
          <LessonsTab 
            lessons={localLessons} 
            searchQuery={searchQuery} 
            onEditLesson={handleEditLesson} 
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
            onDeleteQuestion={handleDeleteQuestion} 
            onAddQuestion={handleAddQuestion} 
            onRefreshQuestions={() => fetchQuestions(selectedLessonIdForQuiz)}
          />
        )}

        {activeTab === "users" && (
          session ? (
            <UsersTab
              token={session.accessToken}
              searchQuery={searchQuery}
            />
          ) : (
            <p className="form-error">Yêu cầu phiên đăng nhập quản trị viên.</p>
          )
        )}

        {activeTab === "media" && (
          <MediaTab 
            token={token} 
            initialMedia={initialMedia} 
            lessons={localLessons} 
          />
        )}

        {activeTab === "feedback" && (
          session ? (
            <FeedbackReportsTab
              token={session.accessToken}
              searchQuery={searchQuery}
            />
          ) : (
            <p className="form-error">Yêu cầu phiên đăng nhập quản trị viên.</p>
          )
        )}

        {activeTab === "vouchers" && (
          session ? (
            <VouchersTab token={session.accessToken} />
          ) : (
            <p className="form-error">Yêu cầu phiên đăng nhập quản trị viên.</p>
          )
        )}

        {activeTab === "logs" && (
          <LogsTab 
            deliveryLogs={deliveryLogs} 
          />
        )}

        {activeTab === "settings" && (
          <SettingsTab />
        )}

        {activeTab === "sources" && (
          <SourcesTab 
            token={token} 
            initialSources={sources} 
          />
        )}

        {activeTab === "aiDrafts" && (
          <AiDraftsTab 
            token={token} 
            initialDrafts={drafts} 
            sources={sources}
            lessons={localLessons}
            onLessonCreated={(newLesson) => {
              setLocalLessons((prev) => [newLesson, ...prev]);
            }}
          />
        )}

      </main>

      {/* Slide-over Side Drawer Question Editor overlay */}
      {isQuestionDrawerOpen && (
        <QuestionDrawer 
          token={token} 
          selectedLessonIdForQuiz={selectedLessonIdForQuiz} 
          initialData={editingQuestion} 
          onClose={() => setIsQuestionDrawerOpen(false)} 
          onSave={handleSaveQuestion} 
        />
      )}

      {/* SLIDE-OVER SIDE DRAWER PANEL (For Lesson Editing) */}
      {editingLesson && (
        <LessonDrawer 
          lesson={editingLesson} 
          token={token} 
          onClose={() => setEditingLesson(null)} 
          onSave={handleSaveLesson} 
        />
      )}

    </div>
  );
}