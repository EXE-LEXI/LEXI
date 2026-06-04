import { buildPaginationMeta } from "../../../common/dto/pagination-meta.dto";
import {
  AdminLegalSourceListResponseDto,
  AdminLegalSourceResponseDto,
} from "../dto/response/admin-legal-source-response.dto";
import {
  AdminNotificationDeliveryLogListResponseDto,
  AdminNotificationDeliveryLogResponseDto,
} from "../dto/response/admin-notification-delivery-log-response.dto";
import {
  AdminMediaAssetListResponseDto,
  AdminMediaAssetResponseDto,
} from "../dto/response/admin-media-asset-response.dto";
import {
  AdminLessonDraftListResponseDto,
  AdminLessonDraftResponseDto,
} from "../dto/response/admin-lesson-draft-response.dto";
import {
  AdminLessonDetailResponseDto,
  AdminLessonListResponseDto,
  AdminLessonSummaryResponseDto,
  AdminQuestionResponseDto,
} from "../dto/response/admin-lesson-response.dto";
import {
  AdminCategoryResponseDto,
  AdminModuleListResponseDto,
  AdminModuleResponseDto,
} from "../dto/response/admin-module-response.dto";

export class AdminContentMapper {
  static toCategory(category: any): AdminCategoryResponseDto {
    return {
      id: category.id,
      slug: category.slug,
      title: category.title,
      description: category.description,
      iconUrl: category.iconUrl,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  static toModule(module: any): AdminModuleResponseDto {
    return {
      id: module.id,
      categoryId: module.categoryId,
      slug: module.slug,
      title: module.title,
      description: module.description,
      sortOrder: module.sortOrder,
      isActive: module.isActive,
      category: this.toCategory(module.category),
      lessonCount: module._count?.lessons ?? module.lessons?.length ?? 0,
      createdAt: module.createdAt,
      updatedAt: module.updatedAt,
    };
  }

  static toModules(modules: any[]): AdminModuleResponseDto[] {
    return modules.map((module) => this.toModule(module));
  }

  static toPaginatedModules(params: {
    modules: any[];
    total: number;
    page: number;
    limit: number;
  }): AdminModuleListResponseDto {
    return {
      items: params.modules.map((module) => this.toModule(module)),
      meta: buildPaginationMeta({
        total: params.total,
        page: params.page,
        limit: params.limit,
      }),
    };
  }

  static toLessonSummary(lesson: any): AdminLessonSummaryResponseDto {
    return {
      id: lesson.id,
      slug: lesson.slug,
      title: lesson.title,
      sourceTitle: lesson.sourceTitle,
      sourceUrl: lesson.sourceUrl,
      legalDocumentNo: lesson.legalDocumentNo,
      effectiveDate: lesson.effectiveDate,
      reviewedAt: lesson.reviewedAt,
      reviewerNote: lesson.reviewerNote,
      isActive: lesson.isActive,
      reviewStatus: lesson.reviewStatus,
      module: {
        id: lesson.module.id,
        title: lesson.module.title,
        category: {
          id: lesson.module.category.id,
          title: lesson.module.category.title,
        },
      },
      videoUrl: lesson.videoUrl,
      questionsCount: lesson._count?.questions ?? lesson.questions?.length ?? 0,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
    };
  }

  static toLessonDetail(lesson: any): AdminLessonDetailResponseDto {
    return {
      ...this.toLessonSummary(lesson),
      content: lesson.content,
      videoUrl: lesson.videoUrl,
      questions: this.toQuestions(lesson.questions),
    };
  }

  static toPaginatedLessons(params: {
    lessons: any[];
    total: number;
    page: number;
    limit: number;
  }): AdminLessonListResponseDto {
    return {
      items: params.lessons.map((lesson) => this.toLessonSummary(lesson)),
      meta: buildPaginationMeta({
        total: params.total,
        page: params.page,
        limit: params.limit,
      }),
    };
  }

  static toLegalSource(source: any): AdminLegalSourceResponseDto {
    return {
      id: source.id,
      title: source.title,
      sourceUrl: source.sourceUrl,
      legalDocumentNo: source.legalDocumentNo,
      effectiveDate: source.effectiveDate,
      rawText: source.rawText,
      normalizedText: source.normalizedText,
      contentHash: source.contentHash,
      crawlStatus: source.crawlStatus,
      crawledAt: source.crawledAt,
      createdAt: source.createdAt,
      updatedAt: source.updatedAt,
    };
  }

  static toPaginatedLegalSources(params: {
    sources: any[];
    total: number;
    page: number;
    limit: number;
  }): AdminLegalSourceListResponseDto {
    return {
      items: params.sources.map((source) => this.toLegalSource(source)),
      meta: buildPaginationMeta({
        total: params.total,
        page: params.page,
        limit: params.limit,
      }),
    };
  }

  static toLessonDraft(draft: any): AdminLessonDraftResponseDto {
    return {
      id: draft.id,
      generationJob: draft.generationJob
        ? {
            id: draft.generationJob.id,
            type: draft.generationJob.type,
            status: draft.generationJob.status,
            promptVersion: draft.generationJob.promptVersion,
            model: draft.generationJob.model,
          }
        : null,
      sourceDocument: {
        id: draft.sourceDocument.id,
        title: draft.sourceDocument.title,
        legalDocumentNo: draft.sourceDocument.legalDocumentNo,
        sourceUrl: draft.sourceDocument.sourceUrl,
      },
      module: draft.module
        ? {
            id: draft.module.id,
            title: draft.module.title,
          }
        : null,
      title: draft.title,
      content: draft.content,
      videoScript: draft.videoScript,
      videoPrompt: draft.videoPrompt,
      reviewerNote: draft.reviewerNote,
      status: draft.status,
      createdLesson: draft.createdLesson
        ? {
            id: draft.createdLesson.id,
            slug: draft.createdLesson.slug,
            title: draft.createdLesson.title,
            reviewStatus: draft.createdLesson.reviewStatus,
            isActive: draft.createdLesson.isActive,
          }
        : null,
      questions: draft.questions.map((question) => ({
        id: question.id,
        text: question.questionText,
        explanation: question.explanation,
        sortOrder: question.sortOrder,
        options: question.options.map((option) => ({
          id: option.id,
          text: option.optionText,
          isCorrect: option.isCorrect,
          sortOrder: option.sortOrder,
        })),
      })),
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
    };
  }

  static toPaginatedLessonDrafts(params: {
    drafts: any[];
    total: number;
    page: number;
    limit: number;
  }): AdminLessonDraftListResponseDto {
    return {
      items: params.drafts.map((draft) => this.toLessonDraft(draft)),
      meta: buildPaginationMeta({
        total: params.total,
        page: params.page,
        limit: params.limit,
      }),
    };
  }

  static toMediaAsset(asset: any): AdminMediaAssetResponseDto {
    return {
      id: asset.id,
      lesson: asset.lesson
        ? {
            id: asset.lesson.id,
            slug: asset.lesson.slug,
            title: asset.lesson.title,
          }
        : null,
      draft: asset.draft
        ? {
            id: asset.draft.id,
            title: asset.draft.title,
          }
        : null,
      title: asset.title,
      assetType: asset.assetType,
      sourceType: asset.sourceType,
      placement: asset.placement,
      status: asset.status,
      url: asset.url,
      mimeType: asset.mimeType,
      provider: asset.provider,
      renderPrompt: asset.renderPrompt,
      metadata: asset.metadata,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
    };
  }

  static toPaginatedMediaAssets(params: {
    assets: any[];
    total: number;
    page: number;
    limit: number;
  }): AdminMediaAssetListResponseDto {
    return {
      items: params.assets.map((asset) => this.toMediaAsset(asset)),
      meta: buildPaginationMeta({
        total: params.total,
        page: params.page,
        limit: params.limit,
      }),
    };
  }

  static toQuestion(question: any): AdminQuestionResponseDto {
    return {
      id: question.id,
      text: question.questionText,
      explanation: question.explanation,
      sortOrder: question.sortOrder,
      options: question.options.map((option) => ({
        id: option.id,
        text: option.optionText,
        isCorrect: option.isCorrect,
        sortOrder: option.sortOrder,
      })),
    };
  }

  static toQuestions(questions: any[]): AdminQuestionResponseDto[] {
    return questions.map((question) => this.toQuestion(question));
  }

  static toNotificationDeliveryLog(
    log: any
  ): AdminNotificationDeliveryLogResponseDto {
    return {
      id: log.id,
      user: {
        id: log.user.id,
        email: log.user.email,
        profile: log.user.profile
          ? {
              fullName: log.user.profile.fullName,
              avatarUrl: log.user.profile.avatarUrl,
            }
          : null,
      },
      type: log.type,
      deliveryKey: log.deliveryKey,
      status: log.status,
      title: log.title,
      body: log.body,
      data: log.data,
      successCount: log.successCount,
      failureCount: log.failureCount,
      deliveredAt: log.deliveredAt,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
    };
  }

  static toPaginatedNotificationDeliveryLogs(params: {
    logs: any[];
    total: number;
    page: number;
    limit: number;
  }): AdminNotificationDeliveryLogListResponseDto {
    return {
      items: params.logs.map((log) => this.toNotificationDeliveryLog(log)),
      meta: buildPaginationMeta({
        total: params.total,
        page: params.page,
        limit: params.limit,
      }),
    };
  }
}
