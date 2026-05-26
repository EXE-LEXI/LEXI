import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

@Injectable()
export class LessonProgressService {
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
