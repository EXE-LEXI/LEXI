import { Injectable } from "@nestjs/common";
import { LessonReviewStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../../../core/prisma.service";

@Injectable()
export class AdminContentRepository {
  constructor(private readonly prisma: PrismaService) {}

  findLessons(params: {
    where: Prisma.LessonWhereInput;
    page: number;
    limit: number;
  }) {
    return this.prisma.$transaction([
      this.prisma.lesson.count({ where: params.where }),
      this.prisma.lesson.findMany({
        where: params.where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        include: this.lessonSummaryInclude(),
        orderBy: [{ updatedAt: "desc" }, { sortOrder: "asc" }],
      }),
    ]);
  }

  findLessonById(lessonId: string) {
    return this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: this.lessonDetailInclude(),
    });
  }

  updateLesson(lessonId: string, data: Prisma.LessonUpdateInput) {
    return this.prisma.lesson.update({
      where: { id: lessonId },
      data,
      include: this.lessonDetailInclude(),
    });
  }

  findQuestionsByLessonId(lessonId: string) {
    return this.prisma.quizQuestion.findMany({
      where: { lessonId },
      include: { options: { orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    });
  }

  findQuestionById(questionId: string) {
    return this.prisma.quizQuestion.findUnique({
      where: { id: questionId },
      include: {
        lesson: {
          include: this.lessonDetailInclude(),
        },
        options: { orderBy: { sortOrder: "asc" } },
      },
    });
  }

  createQuestion(params: {
    lessonId: string;
    data: Prisma.QuizQuestionCreateWithoutLessonInput;
  }) {
    return this.prisma.quizQuestion.create({
      data: {
        ...params.data,
        lesson: {
          connect: { id: params.lessonId },
        },
      },
      include: { options: { orderBy: { sortOrder: "asc" } } },
    });
  }

  async updateQuestion(params: {
    questionId: string;
    data: Prisma.QuizQuestionUpdateInput;
    options?: {
      id?: string;
      optionText?: string;
      isCorrect?: boolean;
      sortOrder?: number;
    }[];
  }) {
    return this.prisma.$transaction(async (tx) => {
      await tx.quizQuestion.update({
        where: { id: params.questionId },
        data: params.data,
      });

      for (const option of params.options ?? []) {
        if (option.id) {
          await tx.quizOption.update({
            where: { id: option.id },
            data: {
              optionText: option.optionText,
              isCorrect: option.isCorrect,
              sortOrder: option.sortOrder,
            },
          });
        } else {
          await tx.quizOption.create({
            data: {
              questionId: params.questionId,
              optionText: option.optionText ?? "",
              isCorrect: option.isCorrect ?? false,
              sortOrder: option.sortOrder ?? 0,
            },
          });
        }
      }

      return tx.quizQuestion.findUniqueOrThrow({
        where: { id: params.questionId },
        include: {
          lesson: {
            include: this.lessonDetailInclude(),
          },
          options: { orderBy: { sortOrder: "asc" } },
        },
      });
    });
  }

  deleteQuestion(questionId: string) {
    return this.prisma.quizQuestion.delete({
      where: { id: questionId },
    });
  }

  findLegalSources(params: {
    where: Prisma.LegalSourceDocumentWhereInput;
    page: number;
    limit: number;
  }) {
    return this.prisma.$transaction([
      this.prisma.legalSourceDocument.count({ where: params.where }),
      this.prisma.legalSourceDocument.findMany({
        where: params.where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
      }),
    ]);
  }

  findLegalSourceById(sourceId: string) {
    return this.prisma.legalSourceDocument.findUnique({
      where: { id: sourceId },
    });
  }

  createLegalSource(data: Prisma.LegalSourceDocumentCreateInput) {
    return this.prisma.legalSourceDocument.create({ data });
  }

  updateLegalSource(
    sourceId: string,
    data: Prisma.LegalSourceDocumentUpdateInput
  ) {
    return this.prisma.legalSourceDocument.update({
      where: { id: sourceId },
      data,
    });
  }

  deleteLegalSource(sourceId: string) {
    return this.prisma.legalSourceDocument.delete({
      where: { id: sourceId },
    });
  }

  findLessonDrafts(params: {
    where: Prisma.LessonDraftWhereInput;
    page: number;
    limit: number;
  }) {
    return this.prisma.$transaction([
      this.prisma.lessonDraft.count({ where: params.where }),
      this.prisma.lessonDraft.findMany({
        where: params.where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        include: this.lessonDraftInclude(),
        orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
      }),
    ]);
  }

  findLessonDraftById(draftId: string) {
    return this.prisma.lessonDraft.findUnique({
      where: { id: draftId },
      include: this.lessonDraftInclude(),
    });
  }

  updateLessonDraft(draftId: string, data: Prisma.LessonDraftUpdateInput) {
    return this.prisma.lessonDraft.update({
      where: { id: draftId },
      data,
      include: this.lessonDraftInclude(),
    });
  }

  createGeneratedLessonDraft(params: {
    sourceDocumentId: string;
    moduleId?: string | null;
    jobData: Prisma.AiGenerationJobCreateInput;
    draftData: Omit<
      Prisma.LessonDraftCreateInput,
      "sourceDocument" | "module" | "generationJob" | "questions"
    >;
    questions: {
      questionText: string;
      explanation?: string | null;
      sortOrder: number;
      options: {
        optionText: string;
        isCorrect: boolean;
        sortOrder: number;
      }[];
    }[];
  }) {
    return this.prisma.$transaction(async (tx) => {
      const job = await tx.aiGenerationJob.create({
        data: params.jobData,
      });

      const draft = await tx.lessonDraft.create({
        data: {
          ...params.draftData,
          generationJob: { connect: { id: job.id } },
          sourceDocument: { connect: { id: params.sourceDocumentId } },
          ...(params.moduleId
            ? { module: { connect: { id: params.moduleId } } }
            : {}),
          questions: {
            create: params.questions.map((question) => ({
              questionText: question.questionText,
              explanation: question.explanation,
              sortOrder: question.sortOrder,
              options: {
                create: question.options.map((option) => ({
                  optionText: option.optionText,
                  isCorrect: option.isCorrect,
                  sortOrder: option.sortOrder,
                })),
              },
            })),
          },
        },
        include: this.lessonDraftInclude(),
      });

      await tx.aiGenerationJob.update({
        where: { id: job.id },
        data: {
          status: "SUCCEEDED",
          output: {
            draftId: draft.id,
            questionCount: params.questions.length,
          },
        },
      });

      return tx.lessonDraft.findUniqueOrThrow({
        where: { id: draft.id },
        include: this.lessonDraftInclude(),
      });
    });
  }

  createLessonFromDraft(params: {
    draft: any;
    moduleId: string;
    slug: string;
    videoUrl?: string | null;
    sortOrder: number;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const lesson = await tx.lesson.create({
        data: {
          module: { connect: { id: params.moduleId } },
          slug: params.slug,
          title: params.draft.title,
          content: params.draft.content,
          videoUrl: params.videoUrl ?? null,
          sourceTitle: params.draft.sourceDocument.title,
          sourceUrl: params.draft.sourceDocument.sourceUrl,
          legalDocumentNo: params.draft.sourceDocument.legalDocumentNo,
          effectiveDate: params.draft.sourceDocument.effectiveDate,
          reviewerNote: params.draft.reviewerNote,
          sortOrder: params.sortOrder,
          isActive: false,
          reviewStatus: LessonReviewStatus.IN_REVIEW,
          questions: {
            create: params.draft.questions.map((question) => ({
              questionText: question.questionText,
              explanation: question.explanation,
              sortOrder: question.sortOrder,
              options: {
                create: question.options.map((option) => ({
                  optionText: option.optionText,
                  isCorrect: option.isCorrect,
                  sortOrder: option.sortOrder,
                })),
              },
            })),
          },
        },
        include: this.lessonDetailInclude(),
      });

      await tx.lessonDraft.update({
        where: { id: params.draft.id },
        data: {
          createdLesson: {
            connect: { id: lesson.id },
          },
        },
      });

      return lesson;
    });
  }

  findMediaAssets(params: {
    where: Prisma.MediaAssetWhereInput;
    page: number;
    limit: number;
  }) {
    return this.prisma.$transaction([
      this.prisma.mediaAsset.count({ where: params.where }),
      this.prisma.mediaAsset.findMany({
        where: params.where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        include: this.mediaAssetInclude(),
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      }),
    ]);
  }

  findMediaAssetById(assetId: string) {
    return this.prisma.mediaAsset.findUnique({
      where: { id: assetId },
      include: this.mediaAssetInclude(),
    });
  }

  createMediaAsset(data: Prisma.MediaAssetCreateInput) {
    return this.prisma.mediaAsset.create({
      data,
      include: this.mediaAssetInclude(),
    });
  }

  updateMediaAsset(assetId: string, data: Prisma.MediaAssetUpdateInput) {
    return this.prisma.mediaAsset.update({
      where: { id: assetId },
      data,
      include: this.mediaAssetInclude(),
    });
  }

  attachMediaAssetToLesson(params: {
    assetId: string;
    lessonId: string;
    videoUrl: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      await tx.mediaAsset.update({
        where: { id: params.assetId },
        data: {
          lesson: {
            connect: { id: params.lessonId },
          },
        },
      });

      return tx.lesson.update({
        where: { id: params.lessonId },
        data: {
          videoUrl: params.videoUrl,
        },
        include: this.lessonDetailInclude(),
      });
    });
  }

  findNotificationDeliveryLogs(params: {
    where: Prisma.NotificationDeliveryLogWhereInput;
    page: number;
    limit: number;
  }) {
    return this.prisma.$transaction([
      this.prisma.notificationDeliveryLog.count({ where: params.where }),
      this.prisma.notificationDeliveryLog.findMany({
        where: params.where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  fullName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      }),
    ]);
  }

  private lessonSummaryInclude() {
    return {
      module: {
        select: {
          id: true,
          title: true,
          category: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    } satisfies Prisma.LessonInclude;
  }

  private lessonDetailInclude() {
    return {
      ...this.lessonSummaryInclude(),
      questions: {
        include: {
          options: {
            orderBy: { sortOrder: "asc" as const },
          },
        },
        orderBy: { sortOrder: "asc" as const },
      },
    } satisfies Prisma.LessonInclude;
  }

  private lessonDraftInclude() {
    return {
      generationJob: {
        select: {
          id: true,
          type: true,
          status: true,
          promptVersion: true,
          model: true,
        },
      },
      sourceDocument: {
        select: {
          id: true,
          title: true,
          legalDocumentNo: true,
          sourceUrl: true,
          effectiveDate: true,
        },
      },
      module: {
        select: {
          id: true,
          title: true,
        },
      },
      createdLesson: {
        select: {
          id: true,
          slug: true,
          title: true,
          reviewStatus: true,
          isActive: true,
        },
      },
      questions: {
        include: {
          options: {
            orderBy: { sortOrder: "asc" as const },
          },
        },
        orderBy: { sortOrder: "asc" as const },
      },
    } satisfies Prisma.LessonDraftInclude;
  }

  private mediaAssetInclude() {
    return {
      lesson: {
        select: {
          id: true,
          slug: true,
          title: true,
        },
      },
      draft: {
        select: {
          id: true,
          title: true,
        },
      },
    } satisfies Prisma.MediaAssetInclude;
  }
}
