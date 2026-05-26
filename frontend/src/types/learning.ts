import type { PaginatedResponse } from "./api";

export type ModuleLesson = {
  id: string;
  title: string;
  sortOrder: number;
};

export type LearningModule = {
  id: string;
  categoryId: string;
  slug: string;
  title: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lessons: ModuleLesson[];
};

export type ModulesListResponse = PaginatedResponse<LearningModule>;

export type LessonOption = {
  id: string;
  text: string;
  sortOrder: number;
};

export type LessonQuestion = {
  id: string;
  text: string;
  sortOrder: number;
  options: LessonOption[];
};

export type LessonDetail = {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  videoUrl: string | null;
  sourceTitle: string | null;
  sourceUrl: string | null;
  legalDocumentNo: string | null;
  effectiveDate: string | null;
  reviewedAt: string | null;
  reviewerNote: string | null;
  module: {
    id: string;
    title: string;
  };
  category: {
    id: string;
    title: string;
  };
  questions: LessonQuestion[];
};

export type QuizSubmissionAnswer = {
  questionId: string;
  selectedOptionId: string;
};

export type QuizSubmissionResult = QuizSubmissionAnswer & {
  isCorrect: boolean;
  correctOptionId: string | null;
  explanation: string | null;
};

export type QuizSubmission = {
  attemptId: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  xpAwarded: number;
  bestScore: number;
  completedAt: string;
  results: QuizSubmissionResult[];
  newBadges?: {
    id: string;
    code: string;
    title: string;
    description: string;
    iconName: string;
    unlockedAt: string;
  }[];
};
