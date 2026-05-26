import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

@Injectable()
export class RewardService {
  calculateQuizXpAward(score: number, previousBestScore: number): number {
    return Math.max(score - previousBestScore, 0);
  }

  async applyXpAward(
    tx: Prisma.TransactionClient,
    userId: string,
    xpAwarded: number
  ): Promise<void> {
    if (xpAwarded <= 0) {
      return;
    }

    await tx.userProfile.updateMany({
      where: { userId },
      data: {
        xp: {
          increment: xpAwarded,
        },
      },
    });
  }
}
