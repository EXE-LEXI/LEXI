export type ProgressSummary = {
  user: {
    id: string;
    email: string | null;
    fullName: string;
    avatarUrl: string | null;
  };
  stats: {
    xp: number;
    streak: number;
    level: number;
    currentLevelXp: number;
    nextLevelXp: number;
  };
  lessons: {
    total: number;
    completed: number;
    remaining: number;
    completionRate: number;
  };
  dailyGoal: {
    targetLessons: number;
    completedLessons: number;
    completionRate: number;
  };
  recentAttempts: {
    id: string;
    lessonId: string;
    lessonTitle: string;
    moduleTitle: string;
    categoryTitle: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    finishedAt: string | null;
  }[];
};
