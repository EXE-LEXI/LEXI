import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../../../core/prisma.service";

@Injectable()
export class LessonProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async markLessonStarted(userId: string, lessonId: string): Promise<void> {
    const existingProgress = await this.prisma.userProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });

    if (existingProgress?.status === "COMPLETED") {
      return;
    }

    await this.prisma.userProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: {
        userId,
        lessonId,
        status: "IN_PROGRESS",
      },
      update: {
        status: "IN_PROGRESS",
      },
    });
  }

  async upsertLessonCompletion(
    tx: Prisma.TransactionClient,
    userId: string,
    lessonId: string,
    score: number,
    completedAt: Date
  ): Promise<Date> {
    const existingProgress = await tx.userProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });

    const effectiveCompletedAt = existingProgress?.completedAt ?? completedAt;

    await tx.userProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: {
        userId,
        lessonId,
        status: "COMPLETED",
        lastScore: score,
        completedAt,
      },
      update: {
        status: "COMPLETED",
        lastScore: score,
        completedAt: effectiveCompletedAt,
      },
    });

    return effectiveCompletedAt;
  }
}
