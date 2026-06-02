import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import {
  AiRecommendationService,
  UserLearningProfile,
  ContentRecommendation,
} from "../services/ai-recommendation.service";
import {
  AiEnhancedLearningService,
  AdaptiveQuestion,
  LearningPath,
} from "../services/ai-enhanced-learning.service";
import { VietnameseLawCrawlerService } from "../services/vietnamese-law-crawler.service";
import { AiJobProcessor } from "../services/ai-job-processor.service";

interface UserRequest {
  id: string;
  email: string;
  role: UserRole;
}

@ApiTags("ai-learning")
@ApiBearerAuth()
@Controller("api/ai-learning")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiLearningController {
  constructor(
    private readonly recommendationService: AiRecommendationService,
    private readonly enhancedLearningService: AiEnhancedLearningService,
    private readonly lawCrawlerService: VietnameseLawCrawlerService,
    private readonly aiJobProcessor: AiJobProcessor
  ) {}

  // Recommendations

  @Get("recommendations")
  @Roles(UserRole.LEARNER, UserRole.ADMIN)
  @ApiOperation({
    summary: "Get personalized learning recommendations",
  })
  @ApiOkResponse({
    schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          lessonId: { type: "string" },
          title: { type: "string" },
          reason: { type: "string" },
          difficulty: { type: "string" },
          estimatedMinutes: { type: "number" },
          relevantScore: { type: "number" },
        },
      },
    },
  })
  async getRecommendations(
    @CurrentUser() user: UserRequest,
    @Query("limit") limit: string = "5"
  ): Promise<ContentRecommendation[]> {
    return this.recommendationService.getPersonalizedRecommendations(
      user.id,
      parseInt(limit)
    );
  }

  @Get("learning-profile")
  @Roles(UserRole.LEARNER, UserRole.ADMIN)
  @ApiOperation({ summary: "Get user's learning profile and statistics" })
  async getLearningProfile(@CurrentUser() user: UserRequest): Promise<UserLearningProfile> {
    return this.recommendationService.analyzeUserLearningProfile(user.id);
  }

  @Get("quiz-improvements/:lessonId")
  @Roles(UserRole.LEARNER, UserRole.ADMIN)
  @ApiOperation({ summary: "Get suggestions for improving quiz performance" })
  async getQuizImprovements(
    @CurrentUser() user: UserRequest,
    @Param("lessonId") lessonId: string
  ) {
    return this.recommendationService.getQuizImprovementSuggestions(
      user.id,
      lessonId
    );
  }

  @Get("consistency-analysis")
  @Roles(UserRole.LEARNER, UserRole.ADMIN)
  @ApiOperation({
    summary: "Analyze learning consistency and suggest study schedule",
  })
  async getConsistencyAnalysis(@CurrentUser() user: UserRequest) {
    return this.recommendationService.analyzeLearningConsistency(user.id);
  }

  @Get("knowledge-gaps")
  @Roles(UserRole.LEARNER, UserRole.ADMIN)
  @ApiOperation({ summary: "Get content suggestions to fill knowledge gaps" })
  async getKnowledgeGaps(@CurrentUser() user: UserRequest) {
    return this.recommendationService.getKnowledgeGapSuggestions(user.id);
  }

  // Adaptive Learning

  @Get("adaptive-quiz/:lessonId")
  @Roles(UserRole.LEARNER, UserRole.ADMIN)
  @ApiOperation({ summary: "Get adaptive quiz questions based on user level" })
  async getAdaptiveQuiz(
    @CurrentUser() user: UserRequest,
    @Param("lessonId") lessonId: string,
    @Query("count") count: string = "3"
  ): Promise<AdaptiveQuestion[]> {
    return this.enhancedLearningService.getAdaptiveQuizQuestions(
      user.id,
      lessonId,
      parseInt(count)
    );
  }

  @Get("learning-path")
  @Roles(UserRole.LEARNER, UserRole.ADMIN)
  @ApiOperation({
    summary: "Get personalized learning path and milestones",
  })
  async getLearningPath(@CurrentUser() user: UserRequest): Promise<LearningPath> {
    return this.enhancedLearningService.generatePersonalizedContentPath(
      user.id
    );
  }

  @Get("attempt/:attemptId/feedback")
  @Roles(UserRole.LEARNER, UserRole.ADMIN)
  @ApiOperation({
    summary: "Get AI-generated feedback on quiz performance",
  })
  async getPerformanceFeedback(
    @CurrentUser() user: UserRequest,
    @Param("attemptId") attemptId: string
  ) {
    return this.enhancedLearningService.generatePerformanceFeedback(
      user.id,
      attemptId
    );
  }

  @Get("hint/:questionId")
  @Roles(UserRole.LEARNER, UserRole.ADMIN)
  @ApiOperation({ summary: "Get AI-generated hint for a question" })
  async getQuestionHint(@Param("questionId") questionId: string) {
    return this.enhancedLearningService.getQuestionHint(questionId);
  }

  @Get("learning-patterns")
  @Roles(UserRole.LEARNER, UserRole.ADMIN)
  @ApiOperation({
    summary: "Analyze learning patterns and get study recommendations",
  })
  async getLearningPatterns(@CurrentUser() user: UserRequest) {
    return this.enhancedLearningService.analyzeLearningPatterns(user.id);
  }

  @Get("review-recommendations")
  @Roles(UserRole.LEARNER, UserRole.ADMIN)
  @ApiOperation({ summary: "Get personalized review recommendations" })
  async getReviewRecommendations(
    @CurrentUser() user: UserRequest,
    @Query("limit") limit: string = "5"
  ) {
    return this.enhancedLearningService.getReviewRecommendations(
      user.id,
      parseInt(limit)
    );
  }

  // Admin: Vietnamese Law Crawling

  @Get("admin/legal-sources")
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Get list of Vietnamese legal sources" })
  async getVietnameseLegalSources(
    @Query("source") source?: string,
    @Query("limit") limit: string = "50"
  ) {
    return this.lawCrawlerService.crawlVietnameseLegalSources(
      source,
      parseInt(limit)
    );
  }

  @Get("admin/government-laws")
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Get Vietnamese government laws database" })
  async getGovernmentLaws() {
    return this.lawCrawlerService.crawlGovernmentDatabase();
  }

  @Get("admin/legal-topics")
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Get relevant Vietnamese legal topics" })
  async getLegalTopics() {
    return this.lawCrawlerService.getRelevantLegalTopics();
  }

  @Post("admin/legal-metadata")
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Extract metadata from legal document URL" })
  async extractLegalMetadata(@Body() payload: { url: string }) {
    return this.lawCrawlerService.extractLegalDocumentMetadata(payload.url);
  }

  // Admin: Job Processing

  @Post("admin/batch-generate-drafts")
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Batch generate lesson drafts from legal sources" })
  async batchGenerateDrafts(
    @Body()
    payload: {
      sourceIds: string[];
      moduleId?: string;
      questionCount?: number;
    }
  ) {
    return this.aiJobProcessor.batchGenerateLessonDrafts(
      payload.sourceIds,
      payload.moduleId,
      payload.questionCount
    );
  }

  @Get("admin/job/:jobId/status")
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Get AI job processing status" })
  async getJobStatus(@Param("jobId") jobId: string) {
    return this.aiJobProcessor.getJobStatus(jobId);
  }

  @Post("admin/job/:jobId/cancel")
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Cancel a pending AI job" })
  async cancelJob(@Param("jobId") jobId: string) {
    await this.aiJobProcessor.cancelJob(jobId);
    return { success: true, message: "Job cancelled successfully" };
  }
}
