import type { PaginatedResponse } from "./api";

export type ModuleLesson = {
  id: string;
  title: string;
  sortOrder: number;
  progress: {
    status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
    lastScore: number | null;
    completedAt: string | null;
  } | null;
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
  optionId: string;
};

export type QuizSubmissionResult = {
  questionId: string;
  selectedOptionId: string;
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
  coinsAwarded: number;
  coinBalance: number;
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

// AI Learning Features
export type ContentRecommendation = {
  lessonId: string;
  title: string;
  reason: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  relevantScore: number;
};

export type UserLearningProfile = {
  userId: string;
  completedLessonsCount: number;
  averageScore: number;
  weakAreas: string[];
  strongAreas: string[];
  learningPace: "slow" | "medium" | "fast";
  recommendedNextTopics: string[];
};

export type AdaptiveQuestionOption = {
  id: string;
  text: string;
};

export type AdaptiveQuestion = {
  questionId: string;
  questionText: string;
  difficulty: "easy" | "medium" | "hard";
  explanation: string;
  options: AdaptiveQuestionOption[];
  hintAvailable: boolean;
};

export type LearningMilestone = {
  name: string;
  completed: boolean;
  progress: number;
};

export type LearningPath = {
  userId: string;
  currentPhase: string;
  completedTopics: string[];
  nextTopics: string[];
  estimatedCompletionDays: number;
  milestones: LearningMilestone[];
};

export type PerformanceFeedback = {
  overallFeedback: string;
  strengths: string[];
  areasForImprovement: string[];
  nextSteps: string[];
  motivationalMessage: string;
};

export type QuizImprovement = {
  suggestion: string;
  focusAreas: string[];
  recommendedReview: string[];
};

export type LearningConsistency = {
  consistency: number;
  streak: number;
  recommendedSchedule: string;
  motivationalMessage: string;
};

export type KnowledgeGap = {
  gap: string;
  relatedTopics: string[];
  suggestedLessons: string[];
};

export type LearningPattern = {
  bestTimeToStudy: string[];
  suggestedSessionDuration: number;
  suggestedFrequency: string;
  learningStyle: string;
};

export type ReviewRecommendationItem = {
  lessonId: string;
  title: string;
  reason: string;
  lastReviewedAt: string | null;
};

export type QuestionHint = {
  hint: string;
  hintLevel: number;
  remainingAttempts: number;
};
