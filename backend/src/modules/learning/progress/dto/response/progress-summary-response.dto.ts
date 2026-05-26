export class ProgressSummaryUserDto {
  id: string;
  email: string | null;
  fullName: string;
  avatarUrl: string | null;
}

export class ProgressStatsDto {
  xp: number;
  streak: number;
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
}

export class LessonCompletionDto {
  total: number;
  completed: number;
  remaining: number;
  completionRate: number;
}

export class DailyGoalDto {
  targetLessons: number;
  completedLessons: number;
  completionRate: number;
}

export class RecentAttemptDto {
  id: string;
  lessonId: string;
  lessonTitle: string;
  moduleTitle: string;
  categoryTitle: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  finishedAt: Date | null;
}

export class ProgressSummaryResponseDto {
  user: ProgressSummaryUserDto;
  stats: ProgressStatsDto;
  lessons: LessonCompletionDto;
  dailyGoal: DailyGoalDto;
  recentAttempts: RecentAttemptDto[];
}
