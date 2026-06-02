import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../../core/prisma.service";
import { ConfigService } from "@nestjs/config";

export interface UserLearningProfile {
  userId: string;
  completedLessonsCount: number;
  averageScore: number;
  weakAreas: string[];
  strongAreas: string[];
  learningPace: "slow" | "medium" | "fast";
  recommendedNextTopics: string[];
}

export interface ContentRecommendation {
  lessonId: string;
  title: string;
  reason: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  relevantScore: 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1.0;
}

/**
 * AI-powered recommendation engine that analyzes user progress
 * and provides personalized learning paths
 */
@Injectable()
export class AiRecommendationService {
  private readonly logger = new Logger(AiRecommendationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {}

  /**
   * Generate personalized learning recommendations for a user
   */
  async getPersonalizedRecommendations(
    userId: string,
    limit: number = 5
  ): Promise<ContentRecommendation[]> {
    try {
      const profile = await this.analyzeUserLearningProfile(userId);
      const recommendations = await this.generateRecommendations(profile, limit);
      return recommendations;
    } catch (error) {
      this.logger.error(
        `Failed to generate recommendations for user ${userId}:`,
        error
      );
      return this.getDefaultRecommendations(userId, limit);
    }
  }

  /**
   * Analyze user's learning profile based on their progress
   */
  async analyzeUserLearningProfile(userId: string): Promise<UserLearningProfile> {
    // Get user's progress data
    const userProgress = await this.prisma.userProgress.findMany({
      where: { userId },
      include: {
        lesson: {
          include: {
            module: true,
          },
        },
      },
    });

    const completedLessons = userProgress.filter(
      (p) => p.status === "COMPLETED"
    );

    // Get user's quiz scores
    const attempts = await this.prisma.lessonAttempt.findMany({
      where: { userId },
      include: {
        lesson: {
          include: {
            module: true,
          },
        },
      },
    });

    // Calculate average score
    const totalScore =
      attempts.reduce((sum, attempt) => sum + attempt.score, 0) || 0;
    const averageScore =
      attempts.length > 0
        ? Math.round((totalScore / attempts.length / 100) * 100)
        : 0;

    // Identify weak and strong areas based on performance
    const performanceByModule = this.groupPerformanceByModule(attempts);
    const weakAreas = this.identifyWeakAreas(performanceByModule);
    const strongAreas = this.identifyStrongAreas(performanceByModule);

    // Determine learning pace
    const learningPace = this.calculateLearningPace(attempts, completedLessons);

    // Get recommended next topics
    const recommendedNextTopics = this.getNextTopicsToLearn(
      userProgress,
      weakAreas,
      strongAreas
    );

    return {
      userId,
      completedLessonsCount: completedLessons.length,
      averageScore,
      weakAreas,
      strongAreas,
      learningPace,
      recommendedNextTopics,
    };
  }

  /**
   * Generate content recommendations based on learning profile
   */
  private async generateRecommendations(
    profile: UserLearningProfile,
    limit: number
  ): Promise<ContentRecommendation[]> {
    const recommendations: ContentRecommendation[] = [];

    // 1. Recommend lessons in weak areas for improvement
    const weakAreaLessons = await this.getLessonsByTopics(
      profile.weakAreas,
      Math.ceil(limit / 2)
    );
    recommendations.push(
      ...weakAreaLessons.map((lesson, index) => ({
        lessonId: lesson.id,
        title: lesson.title,
        reason: `Cải thiện kỹ năng: ${profile.weakAreas[0] || "Chủ đề"}`,
        difficulty: this.estimateDifficulty(index) as
          | "beginner"
          | "intermediate"
          | "advanced",
        estimatedMinutes: 15 + Math.random() * 15,
        relevantScore: (0.6 + Math.random() * 0.4) as
          | 0.5
          | 0.6
          | 0.7
          | 0.8
          | 0.9
          | 1.0,
      }))
    );

    // 2. Recommend next logical topics based on learning progress
    const nextTopicLessons = await this.getLessonsByTopics(
      profile.recommendedNextTopics,
      Math.ceil(limit / 2)
    );
    recommendations.push(
      ...nextTopicLessons.map((lesson, index) => ({
        lessonId: lesson.id,
        title: lesson.title,
        reason: "Bước tiếp theo trong hành trình học tập",
        difficulty: this.estimateDifficulty(index + 1) as
          | "beginner"
          | "intermediate"
          | "advanced",
        estimatedMinutes: 20 + Math.random() * 10,
        relevantScore: (0.7 + Math.random() * 0.3) as
          | 0.5
          | 0.6
          | 0.7
          | 0.8
          | 0.9
          | 1.0,
      }))
    );

    // Sort by relevance and return top N
    return recommendations
      .sort((a, b) => b.relevantScore - a.relevantScore)
      .slice(0, limit);
  }

  /**
   * Get default recommendations when AI analysis fails
   */
  private async getDefaultRecommendations(
    userId: string,
    limit: number
  ): Promise<ContentRecommendation[]> {
    const lessons = await this.prisma.lesson.findMany({
      where: { isActive: true, reviewStatus: "PUBLISHED" },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return lessons.map((lesson, index) => ({
      lessonId: lesson.id,
      title: lesson.title,
      reason: "Bài học mới được thêm",
      difficulty: index % 3 === 0 ? "beginner" : index % 3 === 1 ? "intermediate" : "advanced",
      estimatedMinutes: 15 + Math.random() * 15,
      relevantScore: (0.5 + Math.random() * 0.5) as
        | 0.5
        | 0.6
        | 0.7
        | 0.8
        | 0.9
        | 1.0,
    }));
  }

  /**
   * Get suggestions for improving quiz performance
   */
  async getQuizImprovementSuggestions(
    userId: string,
    lessonId: string
  ): Promise<
    Array<{
      suggestion: string;
      focusAreas: string[];
      recommendedReview: string[];
    }>
  > {
    const attempts = await this.prisma.lessonAttempt.findMany({
      where: { userId, lessonId },
      include: {
        answers: {
          include: {
            question: {
              include: {
                options: true,
              },
            },
            selectedOption: true,
          },
        },
      },
      orderBy: { finishedAt: "desc" },
      take: 5,
    });

    if (attempts.length === 0) {
      return [
        {
          suggestion: "Hoàn thành bài quiz để nhận gợi ý cải thiện",
          focusAreas: [],
          recommendedReview: [],
        },
      ];
    }

    const latestAttempt = attempts[0];
    const incorrectAnswers = latestAttempt.answers.filter((a) => !a.isCorrect);
    const focusAreas = incorrectAnswers
      .map((a) => a.question?.questionText?.substring(0, 50) || "")
      .filter(Boolean);

    return [
      {
        suggestion:
          incorrectAnswers.length > 0
            ? `Bạn trả lời sai ${incorrectAnswers.length} câu. Hãy xem lại các giải thích để hiểu rõ hơn.`
            : "Bạn làm rất tốt! Hãy tiếp tục với bài học tiếp theo.",
        focusAreas: focusAreas.slice(0, 3),
        recommendedReview: focusAreas.slice(0, 2),
      },
    ];
  }

  /**
   * Analyze learning consistency and suggest study schedules
   */
  async analyzeLearningConsistency(userId: string): Promise<{
    consistency: number;
    streak: number;
    recommendedSchedule: string;
    motivationalMessage: string;
  }> {
    const userProgress = await this.prisma.userProgress.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 30,
    });

    if (userProgress.length === 0) {
      return {
        consistency: 0,
        streak: 0,
        recommendedSchedule: "Hãy bắt đầu với 2-3 bài học mỗi tuần",
        motivationalMessage: "Bắt đầu hành trình học tập của bạn ngay hôm nay!",
      };
    }

    const consistency = this.calculateConsistency(userProgress);
    const streak = this.calculateStreak(userProgress);

    return {
      consistency,
      streak,
      recommendedSchedule:
        consistency > 0.7
          ? "Tiếp tục duy trì nhịp độ học hiện tại - bạn đang làm tốt!"
          : "Hãy cố gắng học tập đều đặn 3-4 lần mỗi tuần",
      motivationalMessage:
        streak > 7
          ? `Tuyệt vời! Bạn đã giữ streak ${streak} ngày. Tiếp tục nhé!`
          : "Mỗi bài học bạn hoàn thành đều đưa bạn gần hơn đến mục tiêu!",
    };
  }

  /**
   * Get content suggestions to fill knowledge gaps
   */
  async getKnowledgeGapSuggestions(userId: string): Promise<
    Array<{
      gap: string;
      relatedTopics: string[];
      suggestedLessons: Array<{
        id: string;
        title: string;
      }>;
    }>
  > {
    const profile = await this.analyzeUserLearningProfile(userId);

    if (profile.weakAreas.length === 0) {
      return [];
    }

    const suggestions = await Promise.all(
      profile.weakAreas.map(async (area) => {
        const lessons = await this.getLessonsByTopics([area], 3);
        return {
          gap: area,
          relatedTopics: this.getRelatedTopics(area),
          suggestedLessons: lessons.map((l) => ({
            id: l.id,
            title: l.title,
          })),
        };
      })
    );

    return suggestions;
  }

  // Helper methods

  private groupPerformanceByModule(attempts: any[]) {
    const performanceMap = new Map<string, number[]>();

    for (const attempt of attempts) {
      const moduleName = attempt.lesson?.module?.title || "Unknown";
      if (!performanceMap.has(moduleName)) {
        performanceMap.set(moduleName, []);
      }
      performanceMap.get(moduleName)!.push(attempt.score);
    }

    return performanceMap;
  }

  private identifyWeakAreas(performanceByModule: Map<string, number[]>): string[] {
    return Array.from(performanceByModule.entries())
      .map(([module, scores]) => ({
        module,
        avgScore:
          scores.reduce((a, b) => a + b, 0) / scores.length,
      }))
      .filter((item) => item.avgScore < 60)
      .map((item) => item.module);
  }

  private identifyStrongAreas(performanceByModule: Map<string, number[]>): string[] {
    return Array.from(performanceByModule.entries())
      .map(([module, scores]) => ({
        module,
        avgScore:
          scores.reduce((a, b) => a + b, 0) / scores.length,
      }))
      .filter((item) => item.avgScore >= 80)
      .map((item) => item.module);
  }

  private calculateLearningPace(attempts: any[], completedLessons: any[]) {
    const daysLearning = attempts.length;
    const lessonsPerDay = daysLearning > 0 ? completedLessons.length / daysLearning : 0;

    if (lessonsPerDay > 1) return "fast";
    if (lessonsPerDay > 0.3) return "medium";
    return "slow";
  }

  private getNextTopicsToLearn(
    userProgress: any[],
    weakAreas: string[],
    strongAreas: string[]
  ): string[] {
    if (weakAreas.length > 0) {
      return weakAreas;
    }
    return ["Advanced Topics", "Special Cases", "Practical Applications"];
  }

  private async getLessonsByTopics(topics: string[], limit: number) {
    const lessons = await this.prisma.lesson.findMany({
      where: {
        isActive: true,
        reviewStatus: "PUBLISHED",
        OR: topics.map((topic) => ({
          title: {
            contains: topic,
            mode: "insensitive",
          },
        })),
      },
      take: limit,
    });

    return lessons;
  }

  private estimateDifficulty(index: number): string {
    if (index === 0) return "beginner";
    if (index === 1) return "intermediate";
    return "advanced";
  }

  private getRelatedTopics(topic: string): string[] {
    const topicMap: Record<string, string[]> = {
      "Civil Law": [
        "Family Law",
        "Contract Law",
        "Property Rights",
      ],
      "Criminal Law": [
        "Criminal Procedure",
        "Penalties",
        "Criminal Liability",
      ],
      "Labor Law": ["Employment Rights", "Labor Contracts", "Workplace Safety"],
    };

    return topicMap[topic] || ["General Law", "Legal Principles"];
  }

  private calculateConsistency(userProgress: any[]): number {
    if (userProgress.length === 0) return 0;

    let consistentDays = 0;
    let currentStreak = 0;

    for (let i = 0; i < userProgress.length - 1; i++) {
      const currentDate = new Date(userProgress[i].updatedAt).toDateString();
      const nextDate = new Date(userProgress[i + 1].updatedAt).toDateString();

      if (currentDate === nextDate) {
        currentStreak++;
      } else {
        consistentDays += currentStreak > 0 ? 1 : 0;
        currentStreak = 0;
      }
    }

    return Math.min(consistentDays / 30, 1);
  }

  private calculateStreak(userProgress: any[]): number {
    let streak = 0;
    const today = new Date().toDateString();
    let checkDate = new Date();

    while (true) {
      const dateStr = checkDate.toDateString();
      const hasActivity = userProgress.some(
        (p) => new Date(p.updatedAt).toDateString() === dateStr
      );

      if (!hasActivity && dateStr !== today) break;

      streak++;
      checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);

      if (streak > 365) break;
    }

    return streak;
  }
}
