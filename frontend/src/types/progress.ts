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

export type CurrentLesson = {
  currentLesson: {
    id: string;
    slug: string;
    title: string;
    module: { id: string; title: string };
    category: { id: string; title: string };
  } | null;
  progress: {
    status: string;
    lastScore: number | null;
    completedAt: string | null;
  } | null;
  isCourseCompleted: boolean;
};

export type LearningHistoryItem = {
  id: string;
  lessonId: string;
  lessonTitle: string;
  module: { id: string; title: string };
  category: { id: string; title: string };
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalQuestions: number;
  startedAt: string;
  finishedAt: string | null;
};

export type AttemptOption = {
  id: string;
  text: string;
};

export type AttemptAnswer = {
  questionId: string;
  questionText: string;
  explanation: string | null;
  isCorrect: boolean;
  selectedOption: AttemptOption;
  correctOption: AttemptOption | null;
};

export type AttemptDetail = {
  id: string;
  lesson: {
    id: string;
    title: string;
  };
  module: {
    id: string;
    title: string;
  };
  category: {
    id: string;
    title: string;
  };
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalQuestions: number;
  startedAt: string;
  finishedAt: string | null;
  answers: AttemptAnswer[];
};
