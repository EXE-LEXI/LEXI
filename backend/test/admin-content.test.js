const assert = require("node:assert/strict");
const test = require("node:test");
const { BadRequestException } = require("@nestjs/common");
const {
  LegalSourceCrawlStatus,
  LessonDraftStatus,
  LessonReviewStatus,
  MediaAssetSourceType,
  MediaAssetStatus,
  MediaAssetType,
  NotificationDeliveryStatus,
  NotificationDeliveryType,
} = require("@prisma/client");
const {
  AdminContentService,
} = require("../dist/src/modules/admin-content/services/admin-content.service");

test("admin lesson list supports status/category/module/search filters", async () => {
  let findLessonsArgs;
  const service = new AdminContentService({
    findLessons: async (args) => {
      findLessonsArgs = args;
      return [0, []];
    },
  });

  await service.getLessons({
    status: LessonReviewStatus.IN_REVIEW,
    categoryId: "cat-1",
    moduleId: "module-1",
    search: "helmet",
    page: 2,
    limit: 10,
  });

  assert.equal(findLessonsArgs.page, 2);
  assert.equal(findLessonsArgs.limit, 10);
  assert.equal(
    findLessonsArgs.where.reviewStatus,
    LessonReviewStatus.IN_REVIEW
  );
  assert.equal(findLessonsArgs.where.moduleId, "module-1");
  assert.equal(findLessonsArgs.where.module.categoryId, "cat-1");
  assert.equal(findLessonsArgs.where.OR.length, 4);
});

test("admin notification delivery logs support filters and pagination", async () => {
  let findLogsArgs;
  const service = new AdminContentService({
    findNotificationDeliveryLogs: async (args) => {
      findLogsArgs = args;
      return [
        1,
        [
          {
            id: "log-1",
            user: {
              id: "user-1",
              email: "learner@lexi.vn",
              profile: { fullName: "Learner One", avatarUrl: null },
            },
            type: NotificationDeliveryType.REVIEW_REMINDER,
            deliveryKey: "2026-05-19",
            status: NotificationDeliveryStatus.SENT,
            title: "Review",
            body: "Body",
            data: { type: "REVIEW_REMINDER" },
            successCount: 1,
            failureCount: 0,
            deliveredAt: new Date("2026-05-19T13:00:00.000Z"),
            createdAt: new Date("2026-05-19T13:00:00.000Z"),
            updatedAt: new Date("2026-05-19T13:00:00.000Z"),
          },
        ],
      ];
    },
  });

  const response = await service.getNotificationDeliveryLogs({
    type: NotificationDeliveryType.REVIEW_REMINDER,
    status: NotificationDeliveryStatus.SENT,
    userId: "user-1",
    deliveryKey: "2026-05-19",
    search: "learner",
    page: 2,
    limit: 10,
  });

  assert.equal(findLogsArgs.page, 2);
  assert.equal(findLogsArgs.limit, 10);
  assert.equal(
    findLogsArgs.where.type,
    NotificationDeliveryType.REVIEW_REMINDER
  );
  assert.equal(findLogsArgs.where.status, NotificationDeliveryStatus.SENT);
  assert.equal(findLogsArgs.where.userId, "user-1");
  assert.equal(findLogsArgs.where.deliveryKey, "2026-05-19");
  assert.equal(findLogsArgs.where.user.OR.length, 2);
  assert.equal(response.items[0].user.email, "learner@lexi.vn");
  assert.equal(response.items[0].successCount, 1);
});

test("admin legal sources support filters and pagination", async () => {
  let findSourcesArgs;
  const service = new AdminContentService({
    findLegalSources: async (args) => {
      findSourcesArgs = args;
      return [
        1,
        [
          legalSourceFixture({
            title: "Road Traffic Law",
            legalDocumentNo: "23/2008/QH12",
          }),
        ],
      ];
    },
  });

  const response = await service.getLegalSources({
    status: LegalSourceCrawlStatus.CRAWLED,
    legalDocumentNo: "23/2008",
    search: "traffic",
    page: 2,
    limit: 10,
  });

  assert.equal(findSourcesArgs.page, 2);
  assert.equal(findSourcesArgs.limit, 10);
  assert.equal(
    findSourcesArgs.where.crawlStatus,
    LegalSourceCrawlStatus.CRAWLED
  );
  assert.equal(findSourcesArgs.where.legalDocumentNo.contains, "23/2008");
  assert.equal(findSourcesArgs.where.OR.length, 5);
  assert.equal(response.items[0].title, "Road Traffic Law");
});

test("admin can create and update legal source documents", async () => {
  let createData;
  let updateData;
  const service = new AdminContentService({
    createLegalSource: async (data) => {
      createData = data;
      return legalSourceFixture(data);
    },
    findLegalSourceById: async () => legalSourceFixture(),
    updateLegalSource: async (_sourceId, data) => {
      updateData = data;
      return legalSourceFixture({
        ...data,
        rawText: data.rawText ?? "Original legal text",
      });
    },
  });

  const created = await service.createLegalSource({
    title: "Traffic rule",
    sourceUrl: "https://lexi.vn/legal/traffic",
    legalDocumentNo: "23/2008/QH12",
    rawText: "  Legal\n\ntext  ",
  });

  assert.equal(created.sourceUrl, "https://lexi.vn/legal/traffic");
  assert.equal(createData.normalizedText, "Legal text");
  assert.equal(createData.contentHash.length, 64);
  assert.ok(createData.crawledAt instanceof Date);

  const updated = await service.updateLegalSource("source-1", {
    rawText: "Updated legal text",
    crawlStatus: LegalSourceCrawlStatus.CRAWLED,
  });

  assert.equal(updated.rawText, "Updated legal text");
  assert.equal(updateData.normalizedText, "Updated legal text");
  assert.equal(updateData.contentHash.length, 64);
});

test("admin can crawl legal source URLs and generate AI drafts", async () => {
  const originalFetch = global.fetch;
  let upsertArgs;
  let generatedArgs;

  global.fetch = async () => ({
    ok: true,
    headers: {
      get: () => "text/html; charset=utf-8",
    },
    text: async () => `
      <html>
        <head><title>Traffic Safety Law</title></head>
        <body>
          <h1>Traffic Safety Law</h1>
          <p>Document 23/2008/QH12. Road users must obey traffic signals and road signs.</p>
          <p>The document takes effect on 01/07/2009 and applies to all drivers on public roads.</p>
          <p>This body is intentionally long enough to pass the crawler threshold and verify the full crawl pipeline.</p>
        </body>
      </html>
    `,
  });

  try {
    const service = new AdminContentService({
      findLegalSourceByUrl: async () => null,
      upsertLegalSourceByUrl: async (args) => {
        upsertArgs = args;
        return legalSourceFixture({
          id: "source-crawled-1",
          title: args.create.title,
          sourceUrl: args.sourceUrl,
          legalDocumentNo: args.create.legalDocumentNo,
          effectiveDate: args.create.effectiveDate,
          rawText: args.create.rawText,
          normalizedText: args.create.normalizedText,
        });
      },
      findLegalSourceById: async () =>
        legalSourceFixture({
          id: "source-crawled-1",
          title: "Traffic Safety Law",
          normalizedText: "Road users must obey traffic signals.",
        }),
      createGeneratedLessonDraft: async (args) => {
        generatedArgs = args;
        return lessonDraftFixture({
          title: args.draftData.title,
          questions: args.questions.map((question) =>
            draftQuestionFixture({
              questionText: question.questionText,
              explanation: question.explanation,
              sortOrder: question.sortOrder,
              options: question.options.map((option) =>
                draftOptionFixture(option)
              ),
            })
          ),
        });
      },
    });

    const response = await service.crawlLegalSources({
      urls: ["https://example.vn/van-ban/traffic"],
      moduleId: "module-1",
      questionCount: 2,
    });

    assert.equal(response.errors.length, 0);
    assert.equal(response.sources.length, 1);
    assert.equal(response.drafts.length, 1);
    assert.equal(upsertArgs.sourceUrl, "https://example.vn/van-ban/traffic");
    assert.equal(upsertArgs.create.legalDocumentNo, "23/2008/QH12");
    assert.ok(upsertArgs.create.effectiveDate instanceof Date);
    assert.equal(generatedArgs.sourceDocumentId, "source-crawled-1");
    assert.equal(generatedArgs.moduleId, "module-1");
  } finally {
    global.fetch = originalFetch;
  }
});

test("admin crawl skips draft generation when source already has drafts", async () => {
  const originalFetch = global.fetch;
  let generatedDraftCount = 0;

  global.fetch = async () => ({
    ok: true,
    headers: {
      get: () => "text/html; charset=utf-8",
    },
    text: async () => `
      <html>
        <head><title>Existing Draft Law</title></head>
        <body>
          <h1>Existing Draft Law</h1>
          <p>Document 99/2024/QH15. This content is long enough for the crawler threshold.</p>
          <p>The record already has a draft, so the scheduled run must not create a duplicate draft for the same source.</p>
        </body>
      </html>
    `,
  });

  try {
    const service = new AdminContentService({
      findLegalSourceByUrl: async () =>
        legalSourceFixture({
          id: "source-existing-draft",
          title: "Existing Draft Law",
          lessonDrafts: [{ id: "draft-existing" }],
        }),
      upsertLegalSourceByUrl: async (args) =>
        legalSourceFixture({
          id: "source-existing-draft",
          title: args.create.title,
          sourceUrl: args.sourceUrl,
          legalDocumentNo: args.create.legalDocumentNo,
          rawText: args.create.rawText,
          normalizedText: args.create.normalizedText,
        }),
      createGeneratedLessonDraft: async () => {
        generatedDraftCount += 1;
        return lessonDraftFixture();
      },
    });

    const response = await service.crawlLegalSources({
      urls: ["https://example.vn/van-ban/da-co-draft"],
      generateDrafts: true,
    });

    assert.equal(response.sources.length, 1);
    assert.equal(response.drafts.length, 0);
    assert.equal(generatedDraftCount, 0);
  } finally {
    global.fetch = originalFetch;
  }
});
test("admin can process crawled legal sources without drafts", async () => {
  let findArgs;
  const service = new AdminContentService({
    findCrawledLegalSourcesWithoutDrafts: async (args) => {
      findArgs = args;
      return [
        legalSourceFixture({
          id: "source-unprocessed-1",
          normalizedText: "Nguoi hoc can nam quy dinh phap luat co ban.",
        }),
      ];
    },
    findLegalSourceById: async () =>
      legalSourceFixture({
        id: "source-unprocessed-1",
        normalizedText: "Nguoi hoc can nam quy dinh phap luat co ban.",
      }),
    createGeneratedLessonDraft: async (args) =>
      lessonDraftFixture({
        title: args.draftData.title,
        questions: args.questions.map((question) =>
          draftQuestionFixture({
            questionText: question.questionText,
            explanation: question.explanation,
            sortOrder: question.sortOrder,
            options: question.options.map((option) =>
              draftOptionFixture(option)
            ),
          })
        ),
      }),
  });

  const drafts = await service.processCrawledLegalSources({
    moduleId: "module-1",
    limit: 5,
    questionCount: 1,
  });

  assert.equal(findArgs.limit, 5);
  assert.equal(drafts.length, 1);
  assert.equal(drafts[0].questions.length, 1);
});

test("admin can generate lesson draft from legal source", async () => {
  let generatedArgs;
  const service = new AdminContentService({
    findLegalSourceById: async () =>
      legalSourceFixture({
        title: "Traffic safety source",
        normalizedText: "Nguoi tham gia giao thong can tuan thu tin hieu.",
      }),
    createGeneratedLessonDraft: async (args) => {
      generatedArgs = args;
      return lessonDraftFixture({
        title: args.draftData.title,
        content: args.draftData.content,
        questions: args.questions.map((question, index) =>
          draftQuestionFixture({
            id: `draft-question-${index + 1}`,
            questionText: question.questionText,
            explanation: question.explanation,
            sortOrder: question.sortOrder,
            options: question.options.map((option, optionIndex) =>
              draftOptionFixture({
                id: `draft-option-${index + 1}-${optionIndex + 1}`,
                optionText: option.optionText,
                isCorrect: option.isCorrect,
                sortOrder: option.sortOrder,
              })
            ),
          })
        ),
      });
    },
  });

  const draft = await service.generateLessonDraft({
    sourceDocumentId: "source-1",
    moduleId: "module-1",
    titleHint: "An toan giao thong",
    questionCount: 2,
  });

  assert.equal(generatedArgs.sourceDocumentId, "source-1");
  assert.equal(generatedArgs.moduleId, "module-1");
  assert.equal(generatedArgs.questions.length, 2);
  assert.equal(generatedArgs.jobData.model, "local-structured-generator");
  assert.equal(draft.title, "An toan giao thong");
  assert.equal(draft.status, LessonDraftStatus.DRAFT);
  assert.equal(draft.questions.length, 2);
});

test("admin can generate lesson draft through configured AI provider", async () => {
  const originalFetch = global.fetch;
  let providerRequest;
  let generatedArgs;
  global.fetch = async (_url, request) => {
    providerRequest = JSON.parse(request.body);
    return {
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                title: "Provider lesson",
                content: "Provider content",
                videoScript: "Provider video script",
                videoPrompt: "Provider video prompt",
                questions: [
                  {
                    questionText: "Provider question?",
                    explanation: "Provider explanation",
                    sortOrder: 1,
                    options: [
                      { optionText: "Correct", isCorrect: true, sortOrder: 1 },
                      { optionText: "Wrong", isCorrect: false, sortOrder: 2 },
                    ],
                  },
                ],
              }),
            },
          },
        ],
      }),
    };
  };

  try {
    const service = new AdminContentService(
      {
        findLegalSourceById: async () => legalSourceFixture(),
        createGeneratedLessonDraft: async (args) => {
          generatedArgs = args;
          return lessonDraftFixture({
            title: args.draftData.title,
            content: args.draftData.content,
            questions: args.questions.map((question) =>
              draftQuestionFixture({
                questionText: question.questionText,
                explanation: question.explanation,
                sortOrder: question.sortOrder,
                options: question.options.map((option) =>
                  draftOptionFixture(option)
                ),
              })
            ),
          });
        },
      },
      {
        get: (key) =>
          ({
            AI_DRAFT_PROVIDER: "openai-compatible",
            AI_DRAFT_ENDPOINT: "https://ai.example.test/v1/chat/completions",
            AI_DRAFT_API_KEY: "test-key",
            AI_DRAFT_MODEL: "test-model",
          }[key]),
      }
    );

    const draft = await service.generateLessonDraft({
      sourceDocumentId: "source-1",
      questionCount: 1,
    });

    assert.equal(providerRequest.model, "test-model");
    assert.equal(generatedArgs.jobData.model, "openai-compatible:test-model");
    assert.equal(draft.title, "Provider lesson");
    assert.equal(draft.questions[0].text, "Provider question?");
  } finally {
    global.fetch = originalFetch;
  }
});

test("admin lesson draft list supports filters and pagination", async () => {
  let findDraftsArgs;
  const service = new AdminContentService({
    findLessonDrafts: async (args) => {
      findDraftsArgs = args;
      return [1, [lessonDraftFixture()]];
    },
  });

  const response = await service.getLessonDrafts({
    status: LessonDraftStatus.DRAFT,
    sourceDocumentId: "source-1",
    moduleId: "module-1",
    search: "traffic",
    page: 2,
    limit: 10,
  });

  assert.equal(findDraftsArgs.page, 2);
  assert.equal(findDraftsArgs.limit, 10);
  assert.equal(findDraftsArgs.where.status, LessonDraftStatus.DRAFT);
  assert.equal(findDraftsArgs.where.sourceDocumentId, "source-1");
  assert.equal(findDraftsArgs.where.moduleId, "module-1");
  assert.equal(findDraftsArgs.where.OR.length, 5);
  assert.equal(response.items[0].title, "Draft lesson");
});

test("admin can register and attach a ready video media asset", async () => {
  let createMediaData;
  let attachArgs;
  const service = new AdminContentService({
    createMediaAsset: async (data) => {
      createMediaData = data;
      return mediaAssetFixture({
        title: data.title,
        url: data.url,
        status: data.status,
      });
    },
    findMediaAssetById: async () => mediaAssetFixture(),
    findLessonById: async () => lessonFixture(),
    attachMediaAssetToLesson: async (args) => {
      attachArgs = args;
      return lessonFixture({
        id: args.lessonId,
        videoUrl: args.videoUrl,
      });
    },
  });

  const asset = await service.createMediaAsset({
    title: "Traffic short video",
    sourceType: MediaAssetSourceType.EXTERNAL_URL,
    url: "https://cdn.lexi.vn/videos/traffic.mp4",
  });
  const lesson = await service.attachMediaAssetToLesson("asset-1", {
    lessonId: "lesson-1",
  });

  assert.equal(createMediaData.status, MediaAssetStatus.READY);
  assert.equal(asset.url, "https://cdn.lexi.vn/videos/traffic.mp4");
  assert.equal(attachArgs.videoUrl, "https://cdn.lexi.vn/videos/traffic.mp4");
  assert.equal(lesson.videoUrl, "https://cdn.lexi.vn/videos/traffic.mp4");
});

test("admin media asset list supports filters and pagination", async () => {
  let findMediaArgs;
  const service = new AdminContentService({
    findMediaAssets: async (args) => {
      findMediaArgs = args;
      return [1, [mediaAssetFixture()]];
    },
  });

  const response = await service.getMediaAssets({
    assetType: MediaAssetType.VIDEO,
    sourceType: MediaAssetSourceType.EXTERNAL_URL,
    status: MediaAssetStatus.READY,
    lessonId: "lesson-1",
    search: "traffic",
    page: 2,
    limit: 10,
  });

  assert.equal(findMediaArgs.page, 2);
  assert.equal(findMediaArgs.limit, 10);
  assert.equal(findMediaArgs.where.assetType, MediaAssetType.VIDEO);
  assert.equal(
    findMediaArgs.where.sourceType,
    MediaAssetSourceType.EXTERNAL_URL
  );
  assert.equal(findMediaArgs.where.status, MediaAssetStatus.READY);
  assert.equal(findMediaArgs.where.lessonId, "lesson-1");
  assert.equal(findMediaArgs.where.OR.length, 4);
  assert.equal(response.items[0].title, "Traffic video");
});

test("admin can create lesson and quiz from accepted lesson draft", async () => {
  let createArgs;
  const service = new AdminContentService({
    findLessonDraftById: async () =>
      lessonDraftFixture({
        id: "draft-accepted-1",
        status: LessonDraftStatus.ACCEPTED,
      }),
    createLessonFromDraft: async (args) => {
      createArgs = args;
      return lessonFixture({
        id: "lesson-from-draft",
        slug: args.slug,
        title: args.draft.title,
        content: args.draft.content,
        videoUrl: args.videoUrl,
        sourceTitle: args.draft.sourceDocument.title,
        sourceUrl: args.draft.sourceDocument.sourceUrl,
        legalDocumentNo: args.draft.sourceDocument.legalDocumentNo,
        effectiveDate: args.draft.sourceDocument.effectiveDate,
        reviewerNote: args.draft.reviewerNote,
        isActive: false,
        reviewStatus: LessonReviewStatus.IN_REVIEW,
        questions: args.draft.questions.map((question) =>
          questionFixture({
            questionText: question.questionText,
            explanation: question.explanation,
            sortOrder: question.sortOrder,
            options: question.options,
          })
        ),
      });
    },
  });

  const lesson = await service.createLessonFromDraft("draft-accepted-1", {
    videoUrl: "https://cdn.lexi.vn/videos/traffic.mp4",
  });

  assert.equal(createArgs.moduleId, "module-1");
  assert.match(createArgs.slug, /^draft-lesson-draft-a/);
  assert.equal(createArgs.sortOrder, 0);
  assert.equal(lesson.id, "lesson-from-draft");
  assert.equal(lesson.reviewStatus, LessonReviewStatus.IN_REVIEW);
  assert.equal(lesson.isActive, false);
  assert.equal(lesson.questions.length, 1);
});

test("admin cannot create a duplicate lesson from the same accepted draft", async () => {
  const service = new AdminContentService({
    findLessonDraftById: async () =>
      lessonDraftFixture({
        status: LessonDraftStatus.ACCEPTED,
        createdLesson: {
          id: "lesson-existing",
          slug: "existing",
          title: "Existing lesson",
          reviewStatus: LessonReviewStatus.IN_REVIEW,
          isActive: false,
        },
      }),
  });

  await assert.rejects(
    () => service.createLessonFromDraft("draft-1", {}),
    BadRequestException
  );
});

test("admin cannot create lesson from draft before it is accepted", async () => {
  const service = new AdminContentService({
    findLessonDraftById: async () =>
      lessonDraftFixture({
        status: LessonDraftStatus.IN_REVIEW,
      }),
  });

  await assert.rejects(
    () => service.createLessonFromDraft("draft-1", {}),
    BadRequestException
  );
});

test("admin can update lesson legal metadata before publishing", async () => {
  let updateData;
  const service = new AdminContentService({
    findLessonById: async () =>
      lessonFixture({
        reviewStatus: LessonReviewStatus.IN_REVIEW,
      }),
    updateLesson: async (_lessonId, data) => {
      updateData = data;
      return lessonFixture({
        ...data,
        reviewStatus: data.reviewStatus ?? LessonReviewStatus.IN_REVIEW,
      });
    },
  });

  const response = await service.updateLesson("lesson-1", {
    videoUrl: "https://cdn.lexi.vn/videos/traffic-basics.mp4",
    sourceTitle: "Road Traffic Law",
    sourceUrl: "https://lexi.vn/source",
    legalDocumentNo: "23/2008/QH12",
    reviewedAt: "2026-05-18T00:00:00.000Z",
    reviewerNote: "Verified with official source",
  });

  assert.equal(response.sourceTitle, "Road Traffic Law");
  assert.equal(
    response.videoUrl,
    "https://cdn.lexi.vn/videos/traffic-basics.mp4"
  );
  assert.equal(updateData.sourceUrl, "https://lexi.vn/source");
  assert.equal(
    updateData.videoUrl,
    "https://cdn.lexi.vn/videos/traffic-basics.mp4"
  );
  assert.ok(updateData.reviewedAt instanceof Date);
});

test("admin publish rejects lessons missing legal source metadata", async () => {
  let updateCalled = false;
  const service = new AdminContentService({
    findLessonById: async () =>
      lessonFixture({
        sourceTitle: null,
        sourceUrl: null,
        legalDocumentNo: null,
        reviewedAt: null,
        reviewStatus: LessonReviewStatus.IN_REVIEW,
      }),
    updateLesson: async () => {
      updateCalled = true;
    },
  });

  await assert.rejects(
    () =>
      service.updateLesson("lesson-1", {
        reviewStatus: LessonReviewStatus.PUBLISHED,
      }),
    BadRequestException
  );
  assert.equal(updateCalled, false);
});

test("admin quiz create rejects question without exactly one correct option", async () => {
  const service = new AdminContentService({
    findLessonById: async () => lessonFixture(),
    createQuestion: async () => {
      throw new Error("should not create invalid question");
    },
  });

  await assert.rejects(
    () =>
      service.createQuestion("lesson-1", {
        text: "Which option is correct?",
        options: [
          { text: "A", isCorrect: false },
          { text: "B", isCorrect: false },
        ],
      }),
    BadRequestException
  );
});

test("admin cannot delete the last question from a published lesson", async () => {
  let deleteCalled = false;
  const question = questionFixture();
  const service = new AdminContentService({
    findQuestionById: async () => ({
      ...question,
      lesson: lessonFixture({
        reviewStatus: LessonReviewStatus.PUBLISHED,
        questions: [question],
      }),
    }),
    deleteQuestion: async () => {
      deleteCalled = true;
    },
  });

  await assert.rejects(
    () => service.deleteQuestion("question-1"),
    BadRequestException
  );
  assert.equal(deleteCalled, false);
});

function lessonFixture(overrides = {}) {
  const question = questionFixture();
  return {
    id: "lesson-1",
    slug: "lesson-1",
    title: "Lesson 1",
    content: "Content",
    videoUrl: null,
    sourceTitle: "Road Traffic Law",
    sourceUrl: "https://lexi.vn/source",
    legalDocumentNo: "23/2008/QH12",
    effectiveDate: null,
    reviewedAt: new Date("2026-05-18T00:00:00.000Z"),
    reviewerNote: "Reviewed",
    isActive: true,
    reviewStatus: LessonReviewStatus.PUBLISHED,
    createdAt: new Date("2026-05-18T00:00:00.000Z"),
    updatedAt: new Date("2026-05-18T00:00:00.000Z"),
    module: {
      id: "module-1",
      title: "Module 1",
      category: {
        id: "cat-1",
        title: "Category 1",
      },
    },
    questions: [question],
    ...overrides,
  };
}

function legalSourceFixture(overrides = {}) {
  return {
    id: "source-1",
    title: "Legal source",
    sourceUrl: "https://lexi.vn/legal/source",
    legalDocumentNo: "23/2008/QH12",
    effectiveDate: null,
    rawText: "Original legal text",
    normalizedText: "Original legal text",
    contentHash:
      "6a96184c6b78fba12c08043d87634cc93eb0116b6e2dc3267eaf559e8b0023f7",
    crawlStatus: LegalSourceCrawlStatus.CRAWLED,
    crawledAt: new Date("2026-05-19T00:00:00.000Z"),
    createdAt: new Date("2026-05-19T00:00:00.000Z"),
    updatedAt: new Date("2026-05-19T00:00:00.000Z"),
    ...overrides,
  };
}

function lessonDraftFixture(overrides = {}) {
  return {
    id: "draft-1",
    generationJob: {
      id: "job-1",
      type: "FULL_LESSON_PACKAGE",
      status: "SUCCEEDED",
      promptVersion: "legal-draft-v1",
      model: "local-structured-generator",
    },
    sourceDocument: {
      id: "source-1",
      title: "Legal source",
      legalDocumentNo: "23/2008/QH12",
      sourceUrl: "https://lexi.vn/legal/source",
      effectiveDate: null,
    },
    module: {
      id: "module-1",
      title: "Module 1",
    },
    title: "Draft lesson",
    content: "Draft content",
    videoScript: "Video script",
    videoPrompt: "Video prompt",
    reviewerNote: "Review before publish",
    status: LessonDraftStatus.DRAFT,
    createdLesson: null,
    questions: [draftQuestionFixture()],
    createdAt: new Date("2026-05-20T00:00:00.000Z"),
    updatedAt: new Date("2026-05-20T00:00:00.000Z"),
    ...overrides,
  };
}

function mediaAssetFixture(overrides = {}) {
  return {
    id: "asset-1",
    lesson: {
      id: "lesson-1",
      slug: "lesson-1",
      title: "Lesson 1",
    },
    draft: null,
    title: "Traffic video",
    assetType: MediaAssetType.VIDEO,
    sourceType: MediaAssetSourceType.EXTERNAL_URL,
    status: MediaAssetStatus.READY,
    url: "https://cdn.lexi.vn/videos/traffic.mp4",
    mimeType: "video/mp4",
    provider: "cdn",
    renderPrompt: null,
    metadata: null,
    createdAt: new Date("2026-05-20T00:00:00.000Z"),
    updatedAt: new Date("2026-05-20T00:00:00.000Z"),
    ...overrides,
  };
}

function draftQuestionFixture(overrides = {}) {
  return {
    id: "draft-question-1",
    questionText: "Question?",
    explanation: "Explanation",
    sortOrder: 1,
    options: [draftOptionFixture({ isCorrect: true }), draftOptionFixture()],
    ...overrides,
  };
}

function draftOptionFixture(overrides = {}) {
  return {
    id: "draft-option-1",
    optionText: "Option",
    isCorrect: false,
    sortOrder: 1,
    ...overrides,
  };
}

function questionFixture(overrides = {}) {
  return {
    id: "question-1",
    questionText: "Question?",
    explanation: "Explanation",
    sortOrder: 1,
    options: [
      {
        id: "option-1",
        optionText: "Correct",
        isCorrect: true,
        sortOrder: 1,
      },
      {
        id: "option-2",
        optionText: "Wrong",
        isCorrect: false,
        sortOrder: 2,
      },
    ],
    ...overrides,
  };
}
