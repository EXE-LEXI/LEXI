import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../../core/prisma.service";

export interface AdaptiveQuestion {
  questionId: string;
  questionText: string;
  difficulty: "easy" | "medium" | "hard";
  explanation: string;
  options: Array<{
    id: string;
    text: string;
  }>;
  hintAvailable: boolean;
}

export interface LearningPath {
  userId: string;
  currentPhase: string;
  completedTopics: string[];
  nextTopics: string[];
  estimatedCompletionDays: number;
  milestones: Array<{
    name: string;
    completed: boolean;
    progress: number;
  }>;
}

/**
 * AI-enhanced learning service that personalizes the learning experience
 * Adapts content difficulty, provides targeted feedback, and creates personalized learning paths
 */
@Injectable()
export class AiEnhancedLearningService {
  private readonly logger = new Logger(AiEnhancedLearningService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get adaptive quiz questions based on user performance level
   * Adjusts difficulty based on user's score history
   */
  async getAdaptiveQuizQuestions(
    userId: string,
    lessonId: string,
    questionCount: number = 3
  ): Promise<AdaptiveQuestion[]> {
    // Get user's performance level
    const performanceLevel = await this.getUserPerformanceLevel(userId, lessonId);

    // Get quiz questions for the lesson
    const questions = await this.prisma.quizQuestion.findMany({
      where: { lessonId },
      include: { options: { orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
      take: questionCount,
    });

    // Adjust difficulty and order based on user's level
    return this.adaptQuestionsForUser(questions, performanceLevel);
  }

  /**
   * Generate personalized content recommendations based on user data
   */
  async generatePersonalizedContentPath(userId: string): Promise<LearningPath> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        progress: {
          include: {
            lesson: {
              include: {
                module: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const completedTopics = user.progress
      .filter((p) => p.status === "COMPLETED")
      .map((p) => p.lesson?.module?.title || "")
      .filter(Boolean);

    const nextTopics = await this.getRecommendedNextTopics(
      userId,
      completedTopics
    );

    const milestones = this.generateMilestones(completedTopics);

    return {
      userId,
      currentPhase: this.getCurrentPhase(completedTopics),
      completedTopics,
      nextTopics,
      estimatedCompletionDays: this.estimateCompletionTime(
        user.progress.length
      ),
      milestones,
    };
  }

  /**
   * Provide AI-generated feedback on quiz performance
   */
  async generatePerformanceFeedback(
    userId: string,
    attemptId: string
  ): Promise<{
    overallFeedback: string;
    strengths: string[];
    areasForImprovement: string[];
    nextSteps: string[];
    motivationalMessage: string;
  }> {
    const attempt = await this.prisma.lessonAttempt.findUnique({
      where: { id: attemptId },
      include: {
        answers: {
          include: {
            question: true,
            selectedOption: true,
          },
        },
        lesson: true,
      },
    });

    if (!attempt) {
      throw new Error("Attempt not found");
    }

    const scorePercentage = Math.round(
      (attempt.correctAnswers / attempt.totalQuestions) * 100
    );
    const incorrectAnswers = attempt.answers.filter((a) => !a.isCorrect);

    const strengths = this.identifyStrengths(attempt);
    const areasForImprovement = this.identifyWeakPoints(
      attempt,
      incorrectAnswers
    );
    const nextSteps = this.generateNextSteps(scorePercentage, attempt.lesson);
    const motivationalMessage = this.generateMotivationalMessage(scorePercentage);

    const overallFeedback =
      scorePercentage >= 80
        ? `Tuyệt vời! Bạn đã đạt ${scorePercentage}% với bài kiểm tra này. Kiến thức của bạn về chủ đề này rất vững chắc.`
        : scorePercentage >= 60
          ? `Tốt! Bạn đã đạt ${scorePercentage}%. Có một vài lĩnh vực cần ôn luyện thêm.`
          : `Bạn đã đạt ${scorePercentage}%. Hãy xem lại nội dung bài học và thử lại.`;

    return {
      overallFeedback,
      strengths,
      areasForImprovement,
      nextSteps,
      motivationalMessage,
    };
  }

  /**
   * Get AI-generated hints for difficult questions
   */
  async getQuestionHint(questionId: string, userAnswers?: string[]): Promise<{
    hint: string;
    hintLevel: number;
    remainingAttempts: number;
  }> {
    const question = await this.prisma.quizQuestion.findUnique({
      where: { id: questionId },
      include: { options: true },
    });

    if (!question) {
      throw new Error("Question not found");
    }

    const correctOption = question.options.find((o) => o.isCorrect);

    // Generate progressively more helpful hints
    const hint = this.generateHint(
      question.questionText,
      correctOption?.optionText || ""
    );

    return {
      hint,
      hintLevel: 1,
      remainingAttempts: 2,
    };
  }

  /**
   * Analyze learning patterns and suggest optimal study schedule
   */
  async analyzeLearningPatterns(userId: string): Promise<{
    bestTimeToStudy: string[];
    suggestedSessionDuration: number;
    suggestedFrequency: string;
    learningStyle: "visual" | "kinesthetic" | "reading";
  }> {
    const attempts = await this.prisma.lessonAttempt.findMany({
      where: { userId },
      orderBy: { startedAt: "asc" },
      take: 30,
    });

    if (attempts.length === 0) {
      return {
        bestTimeToStudy: ["morning", "afternoon"],
        suggestedSessionDuration: 30,
        suggestedFrequency: "4-5 times per week",
        learningStyle: "reading",
      };
    }

    // Analyze patterns
    const hourCounts = new Map<number, number>();
    for (const attempt of attempts) {
      const hour = new Date(attempt.startedAt).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    }

    const bestHours = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((entry) => {
        const hour = entry[0];
        if (hour < 12) return "morning";
        if (hour < 18) return "afternoon";
        return "evening";
      });

    return {
      bestTimeToStudy: [...new Set(bestHours)],
      suggestedSessionDuration: 30,
      suggestedFrequency: "4-5 times per week",
      learningStyle: "reading",
    };
  }

  /**
   * Create personalized review recommendations
   */
  async getReviewRecommendations(userId: string, limit: number = 5) {
    const weakLessons = await this.prisma.userProgress.findMany({
      where: {
        userId,
        status: { in: ["NOT_STARTED", "IN_PROGRESS"] },
      },
      include: {
        lesson: true,
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
    });

    return weakLessons.map((progress) => ({
      lessonId: progress.lessonId,
      title: progress.lesson.title,
      status: progress.status,
      lastAttempt: progress.updatedAt,
      reason:
        progress.status === "NOT_STARTED"
          ? "Chưa bắt đầu"
          : "Cần hoàn thành",
      estimatedTime: 20,
    }));
  }

  // Helper methods

  private async getUserPerformanceLevel(
    userId: string,
    lessonId: string
  ): Promise<"beginner" | "intermediate" | "advanced"> {
    const attempts = await this.prisma.lessonAttempt.findMany({
      where: { userId, lessonId },
      orderBy: { finishedAt: "desc" },
      take: 5,
    });

    if (attempts.length === 0) {
      return "beginner";
    }

    const averageScore =
      attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length;

    if (averageScore >= 80) {
      return "advanced";
    }
    if (averageScore >= 60) {
      return "intermediate";
    }
    return "beginner";
  }

  private adaptQuestionsForUser(
    questions: any[],
    performanceLevel: string
  ): AdaptiveQuestion[] {
    return questions.map((q, index) => ({
      questionId: q.id,
      questionText: q.questionText,
      difficulty: (
        performanceLevel === "advanced"
          ? "hard"
          : performanceLevel === "intermediate"
            ? "medium"
            : "easy"
      ) as "easy" | "medium" | "hard",
      explanation: q.explanation,
      options: q.options.map((o: any) => ({
        id: o.id,
        text: o.optionText,
      })),
      hintAvailable: true,
    }));
  }

  private async getRecommendedNextTopics(
    userId: string,
    completedTopics: string[]
  ): Promise<string[]> {
    const allModules = await this.prisma.learningModule.findMany({
      where: { isActive: true },
      select: { title: true },
    });

    return allModules
      .map((m) => m.title)
      .filter((topic) => !completedTopics.includes(topic))
      .slice(0, 3);
  }

  private generateMilestones(completedTopics: string[]) {
    const allMilestones = [
      { name: "Bắt đầu hành trình", target: 1 },
      { name: "Hoàn thành 5 bài học", target: 5 },
      { name: "Hoàn thành 10 bài học", target: 10 },
      { name: "Trở thành chuyên gia", target: 20 },
    ];

    return allMilestones.map((m) => ({
      name: m.name,
      completed: completedTopics.length >= m.target,
      progress: Math.min((completedTopics.length / m.target) * 100, 100),
    }));
  }

  private getCurrentPhase(completedTopics: string[]): string {
    const count = completedTopics.length;
    if (count === 0) return "Bắt đầu";
    if (count < 5) return "Căn bản";
    if (count < 10) return "Trung cấp";
    return "Nâng cao";
  }

  private estimateCompletionTime(completedCount: number): number {
    const totalLessons = 20;
    const averageDaysPerLesson = 3;
    const remaining = Math.max(0, totalLessons - completedCount);
    return Math.ceil(remaining * averageDaysPerLesson);
  }

  private identifyStrengths(attempt: any): string[] {
    if (attempt.correctAnswers >= attempt.totalQuestions - 1) {
      return [
        "Hiểu rõ nội dung pháp luật",
        "Trả lời nhanh và chính xác",
      ];
    }
    if (attempt.correctAnswers >= attempt.totalQuestions / 2) {
      return [
        "Nắm bắt được các khái niệm chính",
        "Có khả năng áp dụng kiến thức",
      ];
    }
    return ["Sẵn sàng học tập", "Kiên trì hoàn thành bài tập"];
  }

  private identifyWeakPoints(attempt: any, incorrectAnswers: any[]): string[] {
    if (incorrectAnswers.length === 0) {
      return [];
    }

    return [
      "Cần ôn luyện lại các chi tiết pháp luật",
      "Nên xem lại phần giải thích của các câu sai",
      "Hãy thực hành thêm với các tình huống tương tự",
    ];
  }

  private generateNextSteps(scorePercentage: number, lesson: any): string[] {
    if (scorePercentage >= 80) {
      return [
        `Tiến hành đến bài học tiếp theo`,
        `Hoàn thành các bài tập thêm về chủ đề này`,
      ];
    }
    if (scorePercentage >= 60) {
      return [
        `Xem lại nội dung bài học ${lesson.title}`,
        `Làm bài kiểm tra lại sau 1-2 ngày`,
      ];
    }
    return [
      `Đọc kỹ lại toàn bộ nội dung ${lesson.title}`,
      `Xem video giải thích`,
      `Liên hệ với giáo viên nếu cần trợ giúp`,
    ];
  }

  private generateMotivationalMessage(scorePercentage: number): string {
    const messages = {
      high: "Bạn làm rất tốt! Tiếp tục duy trì tiến độ này nhé!",
      good: "Bạn đang tiến bộ tốt. Cố gắng thêm một chút nữa!",
      acceptable: "Bạn đang trên đúng hướng. Hãy tiếp tục cố gắng!",
      needImprovement:
        "Đừng nản lòng! Mỗi nỗ lực đều giúp bạn tiến gần hơn đến mục tiêu.",
    };

    if (scorePercentage >= 80) return messages.high;
    if (scorePercentage >= 70) return messages.good;
    if (scorePercentage >= 60) return messages.acceptable;
    return messages.needImprovement;
  }

  private generateHint(questionText: string, correctAnswer: string): string {
    return `Gợi ý: Hãy tìm tìm kiếm từ khóa "${correctAnswer.substring(0, 10)}..." trong nội dung bài học.`;
  }
}
