import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHash } from "crypto";
import {
  AiGenerationStatus,
  AiGenerationType,
  LegalSourceCrawlStatus,
  LessonDraftStatus,
  LessonReviewStatus,
  MediaAssetSourceType,
  MediaAssetStatus,
  MediaAssetType,
  Prisma,
} from "@prisma/client";
import { AttachMediaAssetToLessonDto } from "../dto/request/attach-media-asset-to-lesson.dto";
import { CreateAdminMediaAssetDto } from "../dto/request/create-admin-media-asset.dto";
import {
  DEFAULT_MODULES_LIMIT,
  DEFAULT_MODULES_PAGE,
} from "../../learning/modules/constants/modules.constants";
import { CreateLessonFromDraftDto } from "../dto/request/create-lesson-from-draft.dto";
import { CreateAdminLegalSourceDto } from "../dto/request/create-admin-legal-source.dto";
import { GenerateAdminLessonDraftDto } from "../dto/request/generate-admin-lesson-draft.dto";
import { GetAdminLegalSourcesQueryDto } from "../dto/request/get-admin-legal-sources-query.dto";
import { GetAdminLessonDraftsQueryDto } from "../dto/request/get-admin-lesson-drafts-query.dto";
import { GetAdminMediaAssetsQueryDto } from "../dto/request/get-admin-media-assets-query.dto";
import { GetAdminNotificationDeliveryLogsQueryDto } from "../dto/request/get-admin-notification-delivery-logs-query.dto";
import { CreateAdminQuestionDto } from "../dto/request/create-admin-question.dto";
import { GetAdminLessonsQueryDto } from "../dto/request/get-admin-lessons-query.dto";
import { UpdateAdminLegalSourceDto } from "../dto/request/update-admin-legal-source.dto";
import { UpdateAdminLessonDraftDto } from "../dto/request/update-admin-lesson-draft.dto";
import { UpdateAdminLessonDto } from "../dto/request/update-admin-lesson.dto";
import { UpdateAdminMediaAssetDto } from "../dto/request/update-admin-media-asset.dto";
import { UpdateAdminQuestionDto } from "../dto/request/update-admin-question.dto";
import {
  AdminLegalSourceListResponseDto,
  AdminLegalSourceResponseDto,
} from "../dto/response/admin-legal-source-response.dto";
import {
  AdminLessonDraftListResponseDto,
  AdminLessonDraftResponseDto,
} from "../dto/response/admin-lesson-draft-response.dto";
import { AdminNotificationDeliveryLogListResponseDto } from "../dto/response/admin-notification-delivery-log-response.dto";
import {
  AdminMediaAssetListResponseDto,
  AdminMediaAssetResponseDto,
} from "../dto/response/admin-media-asset-response.dto";
import {
  AdminLessonDetailResponseDto,
  AdminLessonListResponseDto,
  AdminQuestionResponseDto,
} from "../dto/response/admin-lesson-response.dto";
import { AdminContentMapper } from "../mappers/admin-content.mapper";
import { AdminContentRepository } from "../repositories/admin-content.repository";

@Injectable()
export class AdminContentService {
  constructor(
    private readonly adminContentRepository: AdminContentRepository,
    @Optional() private readonly configService?: ConfigService
  ) {}

  async getLessons(
    query: GetAdminLessonsQueryDto
  ): Promise<AdminLessonListResponseDto> {
    const page = query.page ?? DEFAULT_MODULES_PAGE;
    const limit = query.limit ?? DEFAULT_MODULES_LIMIT;
    const [total, lessons] = await this.adminContentRepository.findLessons({
      where: this.buildLessonWhere(query),
      page,
      limit,
    });

    return AdminContentMapper.toPaginatedLessons({
      lessons,
      total,
      page,
      limit,
    });
  }

  async getLegalSources(
    query: GetAdminLegalSourcesQueryDto
  ): Promise<AdminLegalSourceListResponseDto> {
    const page = query.page ?? DEFAULT_MODULES_PAGE;
    const limit = query.limit ?? DEFAULT_MODULES_LIMIT;
    const [total, sources] = await this.adminContentRepository.findLegalSources(
      {
        where: this.buildLegalSourceWhere(query),
        page,
        limit,
      }
    );

    return AdminContentMapper.toPaginatedLegalSources({
      sources,
      total,
      page,
      limit,
    });
  }

  async getLegalSource(sourceId: string): Promise<AdminLegalSourceResponseDto> {
    const source = await this.getLegalSourceOrThrow(sourceId);
    return AdminContentMapper.toLegalSource(source);
  }

  async createLegalSource(
    createDto: CreateAdminLegalSourceDto
  ): Promise<AdminLegalSourceResponseDto> {
    const data = this.buildLegalSourceCreateData(createDto);
    const source = await this.adminContentRepository.createLegalSource(data);
    return AdminContentMapper.toLegalSource(source);
  }

  async updateLegalSource(
    sourceId: string,
    updateDto: UpdateAdminLegalSourceDto
  ): Promise<AdminLegalSourceResponseDto> {
    const source = await this.getLegalSourceOrThrow(sourceId);
    const data = this.buildLegalSourceUpdateData(source, updateDto);
    const updatedSource = await this.adminContentRepository.updateLegalSource(
      sourceId,
      data
    );
    return AdminContentMapper.toLegalSource(updatedSource);
  }

  async deleteLegalSource(sourceId: string): Promise<void> {
    await this.getLegalSourceOrThrow(sourceId);
    await this.adminContentRepository.deleteLegalSource(sourceId);
  }

  async generateLessonDraft(
    dto: GenerateAdminLessonDraftDto
  ): Promise<AdminLessonDraftResponseDto> {
    const source = await this.getLegalSourceOrThrow(dto.sourceDocumentId);
    const generation = await this.generateStructuredLessonDraft(source, dto);
    const payload = generation.payload;
    const draft = await this.adminContentRepository.createGeneratedLessonDraft({
      sourceDocumentId: source.id,
      moduleId: dto.moduleId,
      jobData: {
        sourceDocument: { connect: { id: source.id } },
        ...(dto.moduleId
          ? { targetModule: { connect: { id: dto.moduleId } } }
          : {}),
        type: AiGenerationType.FULL_LESSON_PACKAGE,
        status: AiGenerationStatus.RUNNING,
        promptVersion: generation.promptVersion,
        model: generation.model,
        inputSnapshot: {
          sourceDocumentId: source.id,
          legalDocumentNo: source.legalDocumentNo,
          titleHint: dto.titleHint ?? null,
          questionCount: dto.questionCount ?? 3,
        },
      },
      draftData: {
        title: payload.title,
        content: payload.content,
        videoScript: payload.videoScript,
        videoPrompt: payload.videoPrompt,
        reviewerNote:
          "AI draft placeholder. Reviewer must verify legal accuracy before publishing.",
        status: LessonDraftStatus.DRAFT,
      },
      questions: payload.questions,
    });

    return AdminContentMapper.toLessonDraft(draft);
  }

  async getLessonDrafts(
    query: GetAdminLessonDraftsQueryDto
  ): Promise<AdminLessonDraftListResponseDto> {
    const page = query.page ?? DEFAULT_MODULES_PAGE;
    const limit = query.limit ?? DEFAULT_MODULES_LIMIT;
    const [total, drafts] = await this.adminContentRepository.findLessonDrafts({
      where: this.buildLessonDraftWhere(query),
      page,
      limit,
    });

    return AdminContentMapper.toPaginatedLessonDrafts({
      drafts,
      total,
      page,
      limit,
    });
  }

  async getLessonDraft(draftId: string): Promise<AdminLessonDraftResponseDto> {
    const draft = await this.getLessonDraftOrThrow(draftId);
    return AdminContentMapper.toLessonDraft(draft);
  }

  async getMediaAssets(
    query: GetAdminMediaAssetsQueryDto
  ): Promise<AdminMediaAssetListResponseDto> {
    const page = query.page ?? DEFAULT_MODULES_PAGE;
    const limit = query.limit ?? DEFAULT_MODULES_LIMIT;
    const [total, assets] = await this.adminContentRepository.findMediaAssets({
      where: this.buildMediaAssetWhere(query),
      page,
      limit,
    });

    return AdminContentMapper.toPaginatedMediaAssets({
      assets,
      total,
      page,
      limit,
    });
  }

  async createMediaAsset(
    dto: CreateAdminMediaAssetDto
  ): Promise<AdminMediaAssetResponseDto> {
    this.assertValidMediaAssetInput(dto, true);
    const asset = await this.adminContentRepository.createMediaAsset(
      this.buildMediaAssetCreateData(dto)
    );
    return AdminContentMapper.toMediaAsset(asset);
  }

  async updateMediaAsset(
    assetId: string,
    dto: UpdateAdminMediaAssetDto
  ): Promise<AdminMediaAssetResponseDto> {
    await this.getMediaAssetOrThrow(assetId);
    this.assertValidMediaAssetInput(dto, false);
    const asset = await this.adminContentRepository.updateMediaAsset(
      assetId,
      this.buildMediaAssetUpdateData(dto)
    );
    return AdminContentMapper.toMediaAsset(asset);
  }

  async attachMediaAssetToLesson(
    assetId: string,
    dto: AttachMediaAssetToLessonDto
  ): Promise<AdminLessonDetailResponseDto> {
    const asset = await this.getMediaAssetOrThrow(assetId);
    if (asset.assetType !== MediaAssetType.VIDEO) {
      throw new BadRequestException("Only video media assets can be attached");
    }
    if (asset.status !== MediaAssetStatus.READY || !asset.url) {
      throw new BadRequestException(
        "Only READY media assets with a URL can be attached"
      );
    }

    const lessonId = dto.lessonId ?? asset.lesson?.id;
    if (!lessonId) {
      throw new BadRequestException("lessonId is required to attach media");
    }
    await this.getLessonOrThrow(lessonId);

    const lesson = await this.adminContentRepository.attachMediaAssetToLesson({
      assetId,
      lessonId,
      videoUrl: asset.url,
    });
    return AdminContentMapper.toLessonDetail(lesson);
  }

  async updateLessonDraft(
    draftId: string,
    dto: UpdateAdminLessonDraftDto
  ): Promise<AdminLessonDraftResponseDto> {
    await this.getLessonDraftOrThrow(draftId);
    const draft = await this.adminContentRepository.updateLessonDraft(draftId, {
      title: dto.title,
      content: dto.content,
      videoScript: dto.videoScript,
      videoPrompt: dto.videoPrompt,
      reviewerNote: dto.reviewerNote,
      status: dto.status,
    });
    return AdminContentMapper.toLessonDraft(draft);
  }

  async createLessonFromDraft(
    draftId: string,
    dto: CreateLessonFromDraftDto
  ): Promise<AdminLessonDetailResponseDto> {
    const draft = await this.getLessonDraftOrThrow(draftId);
    if (draft.status !== LessonDraftStatus.ACCEPTED) {
      throw new BadRequestException(
        "Only ACCEPTED lesson drafts can be converted to lessons"
      );
    }
    if (draft.createdLesson) {
      throw new BadRequestException(
        "This lesson draft has already been converted to a lesson"
      );
    }

    const moduleId = dto.moduleId ?? draft.module?.id;
    if (!moduleId) {
      throw new BadRequestException(
        "A moduleId is required when the draft has no target module"
      );
    }

    this.assertDraftQuestionsPublishable(draft.questions);

    const lesson = await this.adminContentRepository.createLessonFromDraft({
      draft,
      moduleId,
      slug: dto.slug?.trim() || this.buildDraftLessonSlug(draft),
      videoUrl: dto.videoUrl,
      sortOrder: dto.sortOrder ?? 0,
    });

    return AdminContentMapper.toLessonDetail(lesson);
  }

  async getLesson(lessonId: string): Promise<AdminLessonDetailResponseDto> {
    const lesson = await this.getLessonOrThrow(lessonId);
    return AdminContentMapper.toLessonDetail(lesson);
  }

  async updateLesson(
    lessonId: string,
    updateDto: UpdateAdminLessonDto
  ): Promise<AdminLessonDetailResponseDto> {
    const lesson = await this.getLessonOrThrow(lessonId);
    const data = this.buildLessonUpdateData(updateDto);
    const candidate = {
      ...lesson,
      ...data,
    };

    if (candidate.reviewStatus === LessonReviewStatus.PUBLISHED) {
      this.assertPublishableLesson(candidate);
    }

    const updatedLesson = await this.adminContentRepository.updateLesson(
      lessonId,
      data
    );
    return AdminContentMapper.toLessonDetail(updatedLesson);
  }

  async getQuestions(lessonId: string): Promise<AdminQuestionResponseDto[]> {
    await this.getLessonOrThrow(lessonId);
    const questions = await this.adminContentRepository.findQuestionsByLessonId(
      lessonId
    );
    return AdminContentMapper.toQuestions(questions);
  }

  async createQuestion(
    lessonId: string,
    createDto: CreateAdminQuestionDto
  ): Promise<AdminQuestionResponseDto> {
    await this.getLessonOrThrow(lessonId);
    this.assertValidOptions(createDto.options);

    const question = await this.adminContentRepository.createQuestion({
      lessonId,
      data: {
        questionText: createDto.text,
        explanation: createDto.explanation,
        sortOrder: createDto.sortOrder ?? 0,
        options: {
          create: createDto.options.map((option) => ({
            optionText: option.text,
            isCorrect: option.isCorrect,
            sortOrder: option.sortOrder ?? 0,
          })),
        },
      },
    });

    return AdminContentMapper.toQuestion(question);
  }

  async updateQuestion(
    questionId: string,
    updateDto: UpdateAdminQuestionDto
  ): Promise<AdminQuestionResponseDto> {
    const question = await this.getQuestionOrThrow(questionId);
    const mergedOptions = this.mergeOptions(
      question.options,
      updateDto.options
    );
    this.assertValidOptions(mergedOptions);

    const updatedQuestion = await this.adminContentRepository.updateQuestion({
      questionId,
      data: {
        questionText: updateDto.text,
        explanation: updateDto.explanation,
        sortOrder: updateDto.sortOrder,
      },
      options: updateDto.options?.map((option) => ({
        id: option.id,
        optionText: option.text,
        isCorrect: option.isCorrect,
        sortOrder: option.sortOrder,
      })),
    });

    if (updatedQuestion.lesson.reviewStatus === LessonReviewStatus.PUBLISHED) {
      this.assertPublishableLesson(updatedQuestion.lesson);
    }

    return AdminContentMapper.toQuestion(updatedQuestion);
  }

  async deleteQuestion(questionId: string): Promise<void> {
    const question = await this.getQuestionOrThrow(questionId);
    if (
      question.lesson.reviewStatus === LessonReviewStatus.PUBLISHED &&
      question.lesson.questions.length <= 1
    ) {
      throw new BadRequestException(
        "Published lessons require at least one quiz question"
      );
    }

    await this.adminContentRepository.deleteQuestion(questionId);
  }

  async getNotificationDeliveryLogs(
    query: GetAdminNotificationDeliveryLogsQueryDto
  ): Promise<AdminNotificationDeliveryLogListResponseDto> {
    const page = query.page ?? DEFAULT_MODULES_PAGE;
    const limit = query.limit ?? DEFAULT_MODULES_LIMIT;
    const [total, logs] =
      await this.adminContentRepository.findNotificationDeliveryLogs({
        where: this.buildNotificationDeliveryLogWhere(query),
        page,
        limit,
      });

    return AdminContentMapper.toPaginatedNotificationDeliveryLogs({
      logs,
      total,
      page,
      limit,
    });
  }

  private buildNotificationDeliveryLogWhere(
    query: GetAdminNotificationDeliveryLogsQueryDto
  ): Prisma.NotificationDeliveryLogWhereInput {
    const where: Prisma.NotificationDeliveryLogWhereInput = {};
    if (query.type) {
      where.type = query.type;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.userId) {
      where.userId = query.userId;
    }
    if (query.deliveryKey) {
      where.deliveryKey = query.deliveryKey;
    }
    if (query.search) {
      where.user = {
        OR: [
          { email: { contains: query.search, mode: "insensitive" } },
          {
            profile: {
              fullName: { contains: query.search, mode: "insensitive" },
            },
          },
        ],
      };
    }
    return where;
  }

  private buildLegalSourceWhere(
    query: GetAdminLegalSourcesQueryDto
  ): Prisma.LegalSourceDocumentWhereInput {
    const where: Prisma.LegalSourceDocumentWhereInput = {};
    if (query.status) {
      where.crawlStatus = query.status;
    }
    if (query.legalDocumentNo) {
      where.legalDocumentNo = {
        contains: query.legalDocumentNo,
        mode: "insensitive",
      };
    }
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { sourceUrl: { contains: query.search, mode: "insensitive" } },
        { legalDocumentNo: { contains: query.search, mode: "insensitive" } },
        { rawText: { contains: query.search, mode: "insensitive" } },
        { normalizedText: { contains: query.search, mode: "insensitive" } },
      ];
    }
    return where;
  }

  private buildLessonDraftWhere(
    query: GetAdminLessonDraftsQueryDto
  ): Prisma.LessonDraftWhereInput {
    const where: Prisma.LessonDraftWhereInput = {};
    if (query.status) {
      where.status = query.status;
    }
    if (query.sourceDocumentId) {
      where.sourceDocumentId = query.sourceDocumentId;
    }
    if (query.moduleId) {
      where.moduleId = query.moduleId;
    }
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { content: { contains: query.search, mode: "insensitive" } },
        { videoScript: { contains: query.search, mode: "insensitive" } },
        {
          sourceDocument: {
            title: { contains: query.search, mode: "insensitive" },
          },
        },
        {
          sourceDocument: {
            legalDocumentNo: { contains: query.search, mode: "insensitive" },
          },
        },
      ];
    }
    return where;
  }

  private buildMediaAssetWhere(
    query: GetAdminMediaAssetsQueryDto
  ): Prisma.MediaAssetWhereInput {
    const where: Prisma.MediaAssetWhereInput = {};
    if (query.assetType) {
      where.assetType = query.assetType;
    }
    if (query.sourceType) {
      where.sourceType = query.sourceType;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.lessonId) {
      where.lessonId = query.lessonId;
    }
    if (query.draftId) {
      where.draftId = query.draftId;
    }
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { provider: { contains: query.search, mode: "insensitive" } },
        { url: { contains: query.search, mode: "insensitive" } },
        { renderPrompt: { contains: query.search, mode: "insensitive" } },
      ];
    }
    return where;
  }

  private buildLessonWhere(
    query: GetAdminLessonsQueryDto
  ): Prisma.LessonWhereInput {
    const where: Prisma.LessonWhereInput = {};
    if (query.status) {
      where.reviewStatus = query.status;
    }
    if (query.moduleId) {
      where.moduleId = query.moduleId;
    }
    if (query.categoryId) {
      where.module = {
        categoryId: query.categoryId,
      };
    }
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { content: { contains: query.search, mode: "insensitive" } },
        { sourceTitle: { contains: query.search, mode: "insensitive" } },
        { legalDocumentNo: { contains: query.search, mode: "insensitive" } },
      ];
    }
    return where;
  }

  private buildLegalSourceCreateData(
    createDto: CreateAdminLegalSourceDto
  ): Prisma.LegalSourceDocumentCreateInput {
    const normalizedText =
      createDto.normalizedText ??
      this.normalizeLegalSourceText(createDto.rawText);
    const crawlStatus = createDto.crawlStatus ?? LegalSourceCrawlStatus.CRAWLED;
    const crawledAt =
      this.toDateValue(createDto.crawledAt) ??
      (crawlStatus === LegalSourceCrawlStatus.CRAWLED ? new Date() : null);
    return {
      title: createDto.title,
      sourceUrl: createDto.sourceUrl ?? null,
      legalDocumentNo: createDto.legalDocumentNo ?? null,
      effectiveDate: this.toDateValue(createDto.effectiveDate),
      rawText: createDto.rawText,
      normalizedText,
      contentHash: this.hashContent(normalizedText),
      crawlStatus,
      crawledAt,
    };
  }

  private buildLegalSourceUpdateData(
    source: any,
    updateDto: UpdateAdminLegalSourceDto
  ): Prisma.LegalSourceDocumentUpdateInput {
    const rawText = updateDto.rawText ?? source.rawText;
    const shouldRehash =
      updateDto.rawText !== undefined || updateDto.normalizedText !== undefined;
    const nextNormalizedText =
      updateDto.normalizedText !== undefined
        ? updateDto.normalizedText ?? this.normalizeLegalSourceText(rawText)
        : updateDto.rawText !== undefined
        ? this.normalizeLegalSourceText(rawText)
        : source.normalizedText;

    return {
      title: updateDto.title,
      sourceUrl: updateDto.sourceUrl,
      legalDocumentNo: updateDto.legalDocumentNo,
      effectiveDate: this.toDateValue(updateDto.effectiveDate),
      rawText: updateDto.rawText,
      normalizedText:
        updateDto.rawText !== undefined ||
        updateDto.normalizedText !== undefined
          ? nextNormalizedText
          : undefined,
      contentHash: shouldRehash
        ? this.hashContent(
            nextNormalizedText ?? this.normalizeLegalSourceText(rawText)
          )
        : undefined,
      crawlStatus: updateDto.crawlStatus,
      crawledAt: this.toDateValue(updateDto.crawledAt),
    };
  }

  private buildLessonUpdateData(
    updateDto: UpdateAdminLessonDto
  ): Prisma.LessonUpdateInput {
    return {
      title: updateDto.title,
      content: updateDto.content,
      videoUrl: updateDto.videoUrl,
      sourceTitle: updateDto.sourceTitle,
      sourceUrl: updateDto.sourceUrl,
      legalDocumentNo: updateDto.legalDocumentNo,
      effectiveDate: this.toDateValue(updateDto.effectiveDate),
      reviewedAt: this.toDateValue(updateDto.reviewedAt),
      reviewerNote: updateDto.reviewerNote,
      reviewStatus: updateDto.reviewStatus,
      isActive: updateDto.isActive,
    };
  }

  private buildMediaAssetCreateData(
    dto: CreateAdminMediaAssetDto
  ): Prisma.MediaAssetCreateInput {
    const sourceType = dto.sourceType ?? MediaAssetSourceType.EXTERNAL_URL;
    const status =
      dto.status ??
      (sourceType === MediaAssetSourceType.EXTERNAL_URL
        ? MediaAssetStatus.READY
        : MediaAssetStatus.RENDERING);

    return {
      title: dto.title,
      assetType: dto.assetType ?? MediaAssetType.VIDEO,
      sourceType,
      status,
      url: dto.url,
      mimeType: dto.mimeType,
      provider: dto.provider,
      renderPrompt: dto.renderPrompt,
      metadata: dto.metadata as Prisma.InputJsonValue,
      ...(dto.lessonId ? { lesson: { connect: { id: dto.lessonId } } } : {}),
      ...(dto.draftId ? { draft: { connect: { id: dto.draftId } } } : {}),
    };
  }

  private buildMediaAssetUpdateData(
    dto: UpdateAdminMediaAssetDto
  ): Prisma.MediaAssetUpdateInput {
    return {
      title: dto.title,
      assetType: dto.assetType,
      sourceType: dto.sourceType,
      status: dto.status,
      url: dto.url,
      mimeType: dto.mimeType,
      provider: dto.provider,
      renderPrompt: dto.renderPrompt,
      metadata:
        dto.metadata === undefined
          ? undefined
          : (dto.metadata as Prisma.InputJsonValue),
      lesson:
        dto.lessonId === undefined
          ? undefined
          : dto.lessonId
          ? { connect: { id: dto.lessonId } }
          : { disconnect: true },
      draft:
        dto.draftId === undefined
          ? undefined
          : dto.draftId
          ? { connect: { id: dto.draftId } }
          : { disconnect: true },
    };
  }

  private toDateValue(value?: string | null): Date | null | undefined {
    if (value === undefined) {
      return undefined;
    }
    if (value === null) {
      return null;
    }
    return new Date(value);
  }

  private normalizeLegalSourceText(value: string): string {
    return value.replace(/\s+/g, " ").trim();
  }

  private hashContent(value: string): string {
    return createHash("sha256").update(value).digest("hex");
  }

  private async generateStructuredLessonDraft(
    source: any,
    dto: GenerateAdminLessonDraftDto
  ): Promise<{
    payload: {
      title: string;
      content: string;
      videoScript: string;
      videoPrompt: string;
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
    };
    model: string;
    promptVersion: string;
  }> {
    const provider = this.getConfigValue("AI_DRAFT_PROVIDER") || "local";
    if (provider !== "local") {
      return this.generateProviderLessonDraft(source, dto, provider);
    }

    return {
      payload: this.generateLocalLessonDraft(source, dto),
      model: "local-structured-generator",
      promptVersion: "legal-draft-v1",
    };
  }

  private generateLocalLessonDraft(
    source: any,
    dto: GenerateAdminLessonDraftDto
  ) {
    const sourceText = source.normalizedText || source.rawText;
    const summary = this.truncateText(sourceText, 650);
    const title =
      dto.titleHint?.trim() ||
      this.truncateText(source.title.replace(/\s+/g, " "), 90);
    const questionCount = dto.questionCount ?? 3;
    const legalRef = source.legalDocumentNo
      ? ` (${source.legalDocumentNo})`
      : "";

    return {
      title,
      content: [
        `Tinh huong: Nguoi hoc gap mot van de lien quan den ${source.title}${legalRef}.`,
        "",
        "Noi dung can nam:",
        summary,
        "",
        "Ghi chu reviewer: Day la ban nhap co cau truc duoc tao tu legal source. Can doi chieu nguon goc truoc khi publish.",
      ].join("\n"),
      videoScript: [
        "Canh 1: Mo dau bang mot tinh huong doi thuong lien quan den noi dung phap ly.",
        `Canh 2: Nhan vat gap van de va can biet quy dinh trong ${source.title}${legalRef}.`,
        "Canh 3: Giai thich ngan gon diem can nho bang ngon ngu de hieu.",
        "Canh 4: Ket thuc bang loi nhac lam quiz de kiem tra hieu bai.",
      ].join("\n"),
      videoPrompt: `Tao video ngan 45-60 giay ve tinh huong phap ly: ${title}. Phong cach hien dai, gan gui voi sinh vien Viet Nam, khong dua loi khuyen phap ly vuot qua nguon.`,
      questions: Array.from({ length: questionCount }, (_, index) =>
        this.buildGeneratedQuestion(index, source)
      ),
    };
  }

  private async generateProviderLessonDraft(
    source: any,
    dto: GenerateAdminLessonDraftDto,
    provider: string
  ) {
    const endpoint = this.getConfigValue("AI_DRAFT_ENDPOINT");
    const apiKey = this.getConfigValue("AI_DRAFT_API_KEY");
    const model = this.getConfigValue("AI_DRAFT_MODEL");
    const promptVersion =
      this.getConfigValue("AI_DRAFT_PROMPT_VERSION") || "legal-draft-v1";

    if (!endpoint || !apiKey || !model) {
      throw new BadRequestException(
        "AI provider requires AI_DRAFT_ENDPOINT, AI_DRAFT_API_KEY and AI_DRAFT_MODEL"
      );
    }

    const questionCount = dto.questionCount ?? 3;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You generate Vietnamese legal education lesson drafts. Return only valid JSON with title, content, videoScript, videoPrompt, questions. Each question must have questionText, explanation, sortOrder and options with optionText, isCorrect, sortOrder. Exactly one option per question must be correct.",
          },
          {
            role: "user",
            content: JSON.stringify({
              titleHint: dto.titleHint ?? null,
              questionCount,
              source: {
                title: source.title,
                legalDocumentNo: source.legalDocumentNo,
                effectiveDate: source.effectiveDate,
                sourceUrl: source.sourceUrl,
                text: this.truncateText(
                  source.normalizedText || source.rawText,
                  6000
                ),
              },
            }),
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new BadRequestException(
        `AI provider generation failed with status ${response.status}`
      );
    }

    const body = await response.json();
    const content = body?.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      throw new BadRequestException("AI provider returned an invalid response");
    }

    return {
      payload: this.coerceGeneratedLessonDraft(
        JSON.parse(content),
        questionCount
      ),
      model: `${provider}:${model}`,
      promptVersion,
    };
  }

  private coerceGeneratedLessonDraft(value: any, questionCount: number) {
    const questions = Array.isArray(value?.questions) ? value.questions : [];
    const coercedQuestions = questions
      .slice(0, questionCount)
      .map((question: any, questionIndex: number) => ({
        questionText: String(question?.questionText ?? question?.text ?? ""),
        explanation:
          question?.explanation === undefined
            ? null
            : String(question.explanation ?? ""),
        sortOrder: Number(question?.sortOrder ?? questionIndex + 1),
        options: (Array.isArray(question?.options) ? question.options : [])
          .slice(0, 5)
          .map((option: any, optionIndex: number) => ({
            optionText: String(option?.optionText ?? option?.text ?? ""),
            isCorrect: Boolean(option?.isCorrect),
            sortOrder: Number(option?.sortOrder ?? optionIndex + 1),
          })),
      }));

    if (!value?.title || !value?.content || coercedQuestions.length === 0) {
      throw new BadRequestException(
        "AI provider returned incomplete draft data"
      );
    }
    for (const question of coercedQuestions) {
      this.assertValidOptions(question.options);
    }

    return {
      title: String(value.title),
      content: String(value.content),
      videoScript: String(value.videoScript ?? ""),
      videoPrompt: String(value.videoPrompt ?? ""),
      questions: coercedQuestions,
    };
  }

  private getConfigValue(key: string): string | undefined {
    return this.configService?.get<string>(key) ?? process.env[key];
  }

  private buildGeneratedQuestion(index: number, source: any) {
    const questionNumber = index + 1;
    return {
      questionText: `Theo nguon "${source.title}", diem nao can duoc reviewer xac minh cho tinh huong ${questionNumber}?`,
      explanation:
        "Day la cau hoi nhap do generator tao. Reviewer can sua dap an va explanation theo dung noi dung phap ly truoc khi publish.",
      sortOrder: questionNumber,
      options: [
        {
          optionText: "Can doi chieu voi van ban goc va metadata nguon",
          isCorrect: true,
          sortOrder: 1,
        },
        {
          optionText: "Chi can dua vao tieu de bai hoc",
          isCorrect: false,
          sortOrder: 2,
        },
        {
          optionText: "Co the bo qua nguon neu cau hoi nghe hop ly",
          isCorrect: false,
          sortOrder: 3,
        },
      ],
    };
  }

  private truncateText(value: string, maxLength: number): string {
    const normalized = value.replace(/\s+/g, " ").trim();
    if (normalized.length <= maxLength) {
      return normalized;
    }
    return `${normalized.slice(0, maxLength).trim()}...`;
  }

  private buildDraftLessonSlug(draft: any): string {
    const baseSlug =
      draft.title
        ?.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 70) || "lesson";
    return `${baseSlug}-${String(draft.id).slice(0, 8)}`;
  }

  private async getLessonOrThrow(lessonId: string) {
    const lesson = await this.adminContentRepository.findLessonById(lessonId);
    if (!lesson) {
      throw new NotFoundException("Lesson not found");
    }
    return lesson;
  }

  private async getLegalSourceOrThrow(sourceId: string) {
    const source = await this.adminContentRepository.findLegalSourceById(
      sourceId
    );
    if (!source) {
      throw new NotFoundException("Legal source not found");
    }
    return source;
  }

  private async getLessonDraftOrThrow(draftId: string) {
    const draft = await this.adminContentRepository.findLessonDraftById(
      draftId
    );
    if (!draft) {
      throw new NotFoundException("Lesson draft not found");
    }
    return draft;
  }

  private async getMediaAssetOrThrow(assetId: string) {
    const asset = await this.adminContentRepository.findMediaAssetById(assetId);
    if (!asset) {
      throw new NotFoundException("Media asset not found");
    }
    return asset;
  }

  private async getQuestionOrThrow(questionId: string) {
    const question = await this.adminContentRepository.findQuestionById(
      questionId
    );
    if (!question) {
      throw new NotFoundException("Question not found");
    }
    return question;
  }

  private assertPublishableLesson(lesson: any): void {
    if (!lesson.isActive) {
      throw new BadRequestException("Published lessons must be active");
    }

    if (
      !lesson.sourceTitle ||
      !lesson.sourceUrl ||
      !lesson.legalDocumentNo ||
      !lesson.reviewedAt
    ) {
      throw new BadRequestException(
        "Published lessons require legal source metadata"
      );
    }

    if (!lesson.questions || lesson.questions.length === 0) {
      throw new BadRequestException(
        "Published lessons require at least one quiz question"
      );
    }

    for (const question of lesson.questions) {
      this.assertValidOptions(question.options);
    }
  }

  private mergeOptions(existingOptions: any[], updateOptions?: any[]) {
    if (!updateOptions) {
      return existingOptions;
    }

    const merged = existingOptions.map((existingOption) => {
      const updateOption = updateOptions.find(
        (option) => option.id === existingOption.id
      );
      return {
        ...existingOption,
        ...updateOption,
        optionText: updateOption?.text ?? existingOption.optionText,
      };
    });

    for (const updateOption of updateOptions) {
      if (!updateOption.id) {
        merged.push({
          optionText: updateOption.text ?? "",
          isCorrect: updateOption.isCorrect ?? false,
          sortOrder: updateOption.sortOrder ?? 0,
        });
      }
    }

    return merged;
  }

  private assertValidOptions(options: any[]): void {
    if (options.length < 2) {
      throw new BadRequestException(
        "A quiz question requires at least 2 options"
      );
    }

    const correctCount = options.filter((option) => option.isCorrect).length;
    if (correctCount !== 1) {
      throw new BadRequestException(
        "A quiz question requires exactly 1 correct option"
      );
    }
  }

  private assertDraftQuestionsPublishable(questions: any[]): void {
    if (!questions || questions.length === 0) {
      throw new BadRequestException(
        "Lesson drafts require at least one quiz question before conversion"
      );
    }

    for (const question of questions) {
      this.assertValidOptions(question.options);
    }
  }

  private assertValidMediaAssetInput(
    dto: CreateAdminMediaAssetDto | UpdateAdminMediaAssetDto,
    requireCompleteInput: boolean
  ): void {
    const sourceType = dto.sourceType;
    if (
      requireCompleteInput &&
      (sourceType ?? MediaAssetSourceType.EXTERNAL_URL) ===
        MediaAssetSourceType.EXTERNAL_URL &&
      !dto.url
    ) {
      throw new BadRequestException("External media assets require a URL");
    }
    if (
      requireCompleteInput &&
      sourceType === MediaAssetSourceType.RENDER_REQUEST &&
      !dto.renderPrompt
    ) {
      throw new BadRequestException(
        "Render request media assets require a renderPrompt"
      );
    }
  }
}
