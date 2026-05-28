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

export type LearningCategory = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  iconUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

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

export type DailyChallenge = {
  id: string;
  title: string;
  description: string;
  type: string;
  date: string;
  target: number;
  progress: number;
  progressRate: number;
  rewardXp: number;
  isCompleted: boolean;
  isClaimed: boolean;
  completedAt: string | null;
  claimedAt: string | null;
};

export type DailyChallengesResponse = {
  items: DailyChallenge[];
};

export type DailyChallengeClaimResponse = {
  challenge: DailyChallenge;
  xpAwarded: number;
};

export type Badge = {
  id: string;
  code: string;
  title: string;
  description: string;
  iconName: string;
  criteriaType: string;
  isUnlocked: boolean;
  unlockedAt: string | null;
};

export type BadgesResponse = {
  items: Badge[];
};

export type LeaderboardUser = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  xp: number;
  rank: number | null;
  isCurrentUser: boolean;
};

export type WeeklyLeaderboard = {
  window: {
    startAt: string;
    endAt: string;
  };
  items: LeaderboardUser[];
  currentUser: LeaderboardUser;
};

export type ReviewRecommendation = {
  lesson: { id: string; title: string };
  module: { id: string; title: string };
  category: { id: string; title: string };
  reasonCode: "RECENT_MISTAKE" | "LOW_SCORE" | "IN_PROGRESS";
  reasonText: string;
  questionId: string | null;
  score: number | null;
  lastActivityAt: string | null;
};

export type ReviewRecommendationsResponse = {
  items: ReviewRecommendation[];
};

export type ReviewMistake = {
  questionId: string;
  questionText: string;
  explanation: string | null;
  selectedOption: { id: string; text: string };
  correctOption: { id: string; text: string } | null;
  lesson: { id: string; title: string };
  module: { id: string; title: string };
  category: { id: string; title: string };
  lastWrongAt: string;
  attempt: { id: string; score: number; finishedAt: string | null };
};

export type ReviewMistakesResponse = PaginatedResponse<ReviewMistake>;

export type NotificationPreferences = {
  id: string;
  dailyReminderEnabled: boolean;
  streakReminderEnabled: boolean;
  reviewReminderEnabled: boolean;
  reminderHour: number;
  timezone: string;
  quietHoursStart: number | null;
  quietHoursEnd: number | null;
  createdAt: string;
  updatedAt: string;
};
