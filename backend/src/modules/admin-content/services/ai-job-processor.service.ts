import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { AiGenerationStatus, AiGenerationType } from "@prisma/client";
import { PrismaService } from "../../../core/prisma.service";
import { AdminContentService } from "./admin-content.service";

const DEFAULT_LESSON_QUESTION_COUNT = 10;

/**
 * Background job processor for async AI generation tasks
 * Handles lesson draft generation, video script creation, and quiz enhancement
 */
@Injectable()
export class AiJobProcessor {
  private readonly logger = new Logger(AiJobProcessor.name);
  private isProcessing = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly adminContentService: AdminContentService
  ) {}

  /**
   * Cron job to process pending AI generation tasks
   * Runs every 5 minutes
   */
  @Cron("*/5 * * * *")
  async processPendingAiJobs(): Promise<void> {
    if (this.isProcessing) {
      this.logger.debug("AI job processor already running");
      return;
    }

    this.isProcessing = true;

    try {
      const pendingJobs = await this.getPendingJobs(10);

      if (pendingJobs.length > 0) {
        this.logger.log(
          `Processing ${pendingJobs.length} pending AI generation jobs`
        );
      }

      for (const job of pendingJobs) {
        try {
          await this.processJob(job);
        } catch (error) {
          await this.failJob(
            job.id,
            error instanceof Error ? error.message : "Unknown error"
          );
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single AI generation job
   */
  private async processJob(job: any): Promise<void> {
    try {
      await this.updateJobStatus(job.id, AiGenerationStatus.RUNNING);

      switch (job.type) {
        case AiGenerationType.LESSON:
          await this.generateLessonContent(job);
          break;
        case AiGenerationType.QUIZ:
          await this.generateQuizQuestions(job);
          break;
        case AiGenerationType.VIDEO_SCRIPT:
          await this.generateVideoScript(job);
          break;
        case AiGenerationType.FULL_LESSON_PACKAGE:
          await this.generateFullLessonPackage(job);
          break;
        default:
          throw new Error(`Unknown job type: ${job.type}`);
      }

      await this.updateJobStatus(job.id, AiGenerationStatus.SUCCEEDED);
      this.logger.log(`AI job ${job.id} completed successfully`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      await this.failJob(job.id, errorMessage);
    }
  }

  /**
   * Generate lesson content from a legal source
   */
  private async generateLessonContent(job: any): Promise<void> {
    const source = await this.prisma.legalSourceDocument.findUnique({
      where: { id: job.sourceDocumentId },
    });

    if (!source) {
      throw new Error("Source document not found");
    }

    // Call AI to generate lesson content
    const content = await this.generateContentWithAi({
      type: "lesson",
      sourceText: source.normalizedText || source.rawText,
      sourceTitle: source.title,
    });

    await this.prisma.aiGenerationJob.update({
      where: { id: job.id },
      data: {
        output: {
          content,
          generatedAt: new Date().toISOString(),
        },
      },
    });
  }

  /**
   * Generate quiz questions from content
   */
  private async generateQuizQuestions(job: any): Promise<void> {
    const source = await this.prisma.legalSourceDocument.findUnique({
      where: { id: job.sourceDocumentId },
    });

    if (!source) {
      throw new Error("Source document not found");
    }

    const questionCount =
      job.inputSnapshot?.questionCount || DEFAULT_LESSON_QUESTION_COUNT;

    // Call AI to generate questions
    const questions = await this.generateQuestionsWithAi({
      sourceText: source.normalizedText || source.rawText,
      sourceTitle: source.title,
      questionCount,
    });

    await this.prisma.aiGenerationJob.update({
      where: { id: job.id },
      data: {
        output: {
          questions,
          generatedAt: new Date().toISOString(),
        },
      },
    });
  }

  /**
   * Generate video script from lesson content
   */
  private async generateVideoScript(job: any): Promise<void> {
    const draft = await this.prisma.lessonDraft.findFirst({
      where: { generationJobId: job.id },
    });

    if (!draft) {
      throw new Error("Lesson draft not found for job");
    }

    // Call AI to generate video script
    const script = await this.generateScriptWithAi({
      lessonTitle: draft.title,
      lessonContent: draft.content,
    });

    // Update the draft with the generated script
    await this.prisma.lessonDraft.update({
      where: { id: draft.id },
      data: {
        videoScript: script,
      },
    });

    await this.prisma.aiGenerationJob.update({
      where: { id: job.id },
      data: {
        output: {
          videoScript: script,
          generatedAt: new Date().toISOString(),
        },
      },
    });
  }

  /**
   * Generate complete lesson package (content + quiz + video script)
   */
  private async generateFullLessonPackage(job: any): Promise<void> {
    const source = await this.prisma.legalSourceDocument.findUnique({
      where: { id: job.sourceDocumentId },
    });

    if (!source) {
      throw new Error("Source document not found");
    }

    const questionCount =
      job.inputSnapshot?.questionCount || DEFAULT_LESSON_QUESTION_COUNT;

    // Call AI to generate complete package
    const output = await this.generateFullPackageWithAi({
      sourceText: source.normalizedText || source.rawText,
      sourceTitle: source.title,
      questionCount,
    });

    await this.prisma.aiGenerationJob.update({
      where: { id: job.id },
      data: {
        output,
      },
    });
  }

  /**
   * Batch process multiple legal sources into lesson drafts
   */
  async batchGenerateLessonDrafts(
    sourceIds: string[],
    moduleId?: string,
    questionCount: number = DEFAULT_LESSON_QUESTION_COUNT
  ): Promise<string[]> {
    const jobIds: string[] = [];

    for (const sourceId of sourceIds) {
      const source = await this.prisma.legalSourceDocument.findUnique({
        where: { id: sourceId },
      });

      if (!source) {
        this.logger.warn(`Source document ${sourceId} not found`);
        continue;
      }

      const job = await this.prisma.aiGenerationJob.create({
        data: {
          sourceDocumentId: sourceId,
          targetModuleId: moduleId,
          type: AiGenerationType.FULL_LESSON_PACKAGE,
          status: AiGenerationStatus.PENDING,
          promptVersion: "legal-draft-v1",
          model: "auto-select",
          inputSnapshot: {
            sourceDocumentId: sourceId,
            legalDocumentNo: source.legalDocumentNo,
            questionCount,
          },
        },
      });

      jobIds.push(job.id);
    }

    return jobIds;
  }

  /**
   * Get job processing status
   */
  async getJobStatus(jobId: string): Promise<{
    status: AiGenerationStatus;
    progress: number;
    estimatedTimeRemaining: number;
  }> {
    const job = await this.prisma.aiGenerationJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new Error("Job not found");
    }

    return {
      status: job.status,
      progress:
        job.status === AiGenerationStatus.SUCCEEDED
          ? 100
          : job.status === AiGenerationStatus.RUNNING
            ? 50
            : 0,
      estimatedTimeRemaining:
        job.status === AiGenerationStatus.PENDING ? 300 : 60, // seconds
    };
  }

  /**
   * Cancel a pending job
   */
  async cancelJob(jobId: string): Promise<void> {
    const job = await this.prisma.aiGenerationJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new Error("Job not found");
    }

    if (job.status !== AiGenerationStatus.PENDING) {
      throw new Error("Can only cancel pending jobs");
    }

    await this.prisma.aiGenerationJob.update({
      where: { id: jobId },
      data: {
        status: AiGenerationStatus.CANCELLED,
      },
    });
  }

  // Private helper methods

  private async getPendingJobs(limit: number) {
    return this.prisma.aiGenerationJob.findMany({
      where: {
        status: AiGenerationStatus.PENDING,
      },
      include: {
        sourceDocument: true,
      },
      orderBy: { createdAt: "asc" },
      take: limit,
    });
  }

  private async updateJobStatus(
    jobId: string,
    status: AiGenerationStatus
  ): Promise<void> {
    await this.prisma.aiGenerationJob.update({
      where: { id: jobId },
      data: { status },
    });
  }

  private async failJob(jobId: string, errorMessage: string): Promise<void> {
    this.logger.error(`AI job ${jobId} failed: ${errorMessage}`);
    await this.prisma.aiGenerationJob.update({
      where: { id: jobId },
      data: {
        status: AiGenerationStatus.FAILED,
        errorMessage,
      },
    });
  }

  private async generateContentWithAi(input: {
    type: string;
    sourceText: string;
    sourceTitle: string;
  }): Promise<string> {
    // Simulate AI generation - in production, call actual AI API
    return `
      Nội dung bài học về: ${input.sourceTitle}
      
      Giới thiệu:
      Bài học này cung cấp một cái nhìn toàn diện về ${input.sourceTitle}. 
      Bạn sẽ tìm hiểu về các khía cạnh quan trọng và ứng dụng thực tế.
      
      Nội dung chính:
      1. Định nghĩa và khái niệm cơ bản
      2. Nguyên tắc pháp luật áp dụng
      3. Quyền và nghĩa vụ liên quan
      4. Trường hợp thực tế và ví dụ
      5. Những điều cần ghi nhớ
      
      Trích dẫn từ nguồn:
      "${input.sourceText.substring(0, 500)}..."
    `;
  }

  private async generateQuestionsWithAi(input: {
    sourceText: string;
    sourceTitle: string;
    questionCount: number;
  }): Promise<any[]> {
    const questions = [];

    for (let i = 0; i < input.questionCount; i++) {
      questions.push({
        questionText: `Theo ${input.sourceTitle}, câu hỏi ${i + 1} là gì?`,
        explanation: `Đây là giải thích chi tiết cho câu hỏi ${i + 1} dựa trên nội dung pháp luật`,
        sortOrder: i + 1,
        options: [
          {
            optionText: "Đáp án A - Phù hợp với pháp luật",
            isCorrect: true,
            sortOrder: 1,
          },
          {
            optionText: "Đáp án B - Không phù hợp",
            isCorrect: false,
            sortOrder: 2,
          },
          {
            optionText: "Đáp án C - Không chính xác",
            isCorrect: false,
            sortOrder: 3,
          },
        ],
      });
    }

    return questions;
  }

  private async generateScriptWithAi(input: {
    lessonTitle: string;
    lessonContent: string;
  }): Promise<string> {
    return `
      [Cảnh 1: Giới thiệu] 
      Xin chào! Hôm nay chúng ta sẽ học về "${input.lessonTitle}".
      Đây là một chủ đề quan trọng trong pháp luật Việt Nam.
      
      [Cảnh 2: Giải thích nội dung]
      ${input.lessonContent.substring(0, 200)}...
      
      [Cảnh 3: Ví dụ thực tế]
      Hãy xem xét một tình huống thực tế...
      
      [Cảnh 4: Kết luận]
      Những điều cần nhớ:
      - Điểm 1 quan trọng
      - Điểm 2 quan trọng
      
      Cảm ơn bạn đã theo dõi. Hãy làm bài quiz để kiểm tra kiến thức!
    `;
  }

  private async generateFullPackageWithAi(input: {
    sourceText: string;
    sourceTitle: string;
    questionCount: number;
  }): Promise<any> {
    return {
      lesson: await this.generateContentWithAi({
        type: "lesson",
        sourceText: input.sourceText,
        sourceTitle: input.sourceTitle,
      }),
      videoScript: await this.generateScriptWithAi({
        lessonTitle: input.sourceTitle,
        lessonContent: input.sourceText,
      }),
      questions: await this.generateQuestionsWithAi(input),
      generatedAt: new Date().toISOString(),
    };
  }
}
