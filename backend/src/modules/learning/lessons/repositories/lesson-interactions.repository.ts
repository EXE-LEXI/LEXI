import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../core/prisma.service";

@Injectable()
export class LessonInteractionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  countActiveLesson(lessonId: string) {
    return this.prisma.lesson.count({
      where: { id: lessonId, isActive: true, reviewStatus: "PUBLISHED" },
    });
  }

  findNotes(params: {
    userId: string;
    lessonId: string;
    page: number;
    limit: number;
  }) {
    const where = {
      userId: params.userId,
      lessonId: params.lessonId,
    };
    return this.prisma.$transaction([
      this.prisma.lessonNote.count({ where }),
      this.prisma.lessonNote.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: [{ createdAt: "desc" }],
      }),
    ]);
  }

  createNote(params: {
    userId: string;
    lessonId: string;
    text: string;
    videoTimeSeconds?: number;
  }) {
    return this.prisma.lessonNote.create({
      data: {
        userId: params.userId,
        lessonId: params.lessonId,
        text: params.text,
        videoTimeSeconds: params.videoTimeSeconds,
      },
    });
  }

  deleteNote(params: { userId: string; noteId: string }) {
    return this.prisma.lessonNote.deleteMany({
      where: {
        id: params.noteId,
        userId: params.userId,
      },
    });
  }

  findDiscussions(params: { lessonId: string; page: number; limit: number }) {
    const where = { lessonId: params.lessonId };
    return this.prisma.$transaction([
      this.prisma.lessonDiscussion.count({ where }),
      this.prisma.lessonDiscussion.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        include: this.discussionInclude(),
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      }),
    ]);
  }

  createDiscussion(params: {
    userId: string;
    lessonId: string;
    question: string;
  }) {
    return this.prisma.lessonDiscussion.create({
      data: {
        userId: params.userId,
        lessonId: params.lessonId,
        question: params.question,
      },
      include: this.discussionInclude(),
    });
  }

  async createReply(params: {
    userId: string;
    discussionId: string;
    body: string;
  }) {
    const reply = await this.prisma.lessonDiscussionReply.create({
      data: {
        userId: params.userId,
        discussionId: params.discussionId,
        body: params.body,
      },
    });

    await this.prisma.lessonDiscussion.update({
      where: { id: params.discussionId },
      data: { updatedAt: new Date() },
    });

    return this.prisma.lessonDiscussion.findUnique({
      where: { id: reply.discussionId },
      include: this.discussionInclude(),
    });
  }

  findDiscussionById(discussionId: string) {
    return this.prisma.lessonDiscussion.findUnique({
      where: { id: discussionId },
      include: this.discussionInclude(),
    });
  }

  private discussionInclude() {
    return {
      user: {
        select: {
          id: true,
          email: true,
          profile: {
            select: { fullName: true, avatarUrl: true },
          },
        },
      },
      replies: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile: {
                select: { fullName: true, avatarUrl: true },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" as const },
      },
    };
  }
}
