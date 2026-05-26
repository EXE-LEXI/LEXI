import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  DailyChallengeClaimResponseDto,
  DailyChallengesResponseDto,
} from "../dto/response/daily-challenge-response.dto";
import { DailyChallengesMapper } from "../mappers/daily-challenges.mapper";
import { DailyChallengesRepository } from "../repositories/daily-challenges.repository";

@Injectable()
export class DailyChallengesService {
  constructor(
    private readonly dailyChallengesRepository: DailyChallengesRepository
  ) {}

  async getDailyChallenges(
    userId: string,
    now = new Date()
  ): Promise<DailyChallengesResponseDto> {
    const { startOfDay, startOfNextDay, dateKey } = this.getDayWindow(now);

    const [challenges, completedLessons] = await Promise.all([
      this.dailyChallengesRepository.findActiveDailyChallenges(),
      this.dailyChallengesRepository.countDistinctCompletedLessonsForDay(
        userId,
        startOfDay,
        startOfNextDay
      ),
    ]);

    const items = await Promise.all(
      challenges.map(async (challenge) => {
        const progress =
          this.dailyChallengesRepository.calculateProgressForChallenge({
            challengeType: challenge.type,
            completedLessons,
          });
        const isCompleted = progress >= challenge.target;
        const userChallenge =
          await this.dailyChallengesRepository.upsertUserChallengeState({
            userId,
            dailyChallengeId: challenge.id,
            challengeDate: startOfDay,
            progress: Math.min(progress, challenge.target),
            isCompleted,
            now,
          });

        return DailyChallengesMapper.toItem({
          challenge,
          userChallenge,
          date: dateKey,
          progress,
        });
      })
    );

    return DailyChallengesMapper.toResponse(items);
  }

  async claimDailyChallenge(
    userId: string,
    challengeId: string,
    now = new Date()
  ): Promise<DailyChallengeClaimResponseDto> {
    const { startOfDay, startOfNextDay, dateKey } = this.getDayWindow(now);
    const challenge =
      await this.dailyChallengesRepository.findActiveDailyChallengeById(
        challengeId
      );

    if (!challenge) {
      throw new NotFoundException("Daily challenge not found");
    }

    const completedLessons =
      await this.dailyChallengesRepository.countDistinctCompletedLessonsForDay(
        userId,
        startOfDay,
        startOfNextDay
      );
    const progress =
      this.dailyChallengesRepository.calculateProgressForChallenge({
        challengeType: challenge.type,
        completedLessons,
      });
    const cappedProgress = Math.min(progress, challenge.target);

    if (cappedProgress < challenge.target) {
      throw new BadRequestException("Daily challenge is not completed");
    }

    const claimResult =
      await this.dailyChallengesRepository.claimDailyChallenge({
        userId,
        dailyChallengeId: challenge.id,
        challengeDate: startOfDay,
        progress: cappedProgress,
        now,
        rewardXp: challenge.rewardXp,
      });

    if (!claimResult.wasClaimed) {
      throw new ConflictException("Daily challenge has already been claimed");
    }

    const item = DailyChallengesMapper.toItem({
      challenge,
      userChallenge: claimResult.userChallenge,
      date: dateKey,
      progress: cappedProgress,
    });

    return DailyChallengesMapper.toClaimResponse({
      item,
      xpAwarded: challenge.rewardXp,
    });
  }

  private getDayWindow(now: Date): {
    startOfDay: Date;
    startOfNextDay: Date;
    dateKey: string;
  } {
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const startOfNextDay = new Date(startOfDay);
    startOfNextDay.setDate(startOfNextDay.getDate() + 1);

    return {
      startOfDay,
      startOfNextDay,
      dateKey: this.toDateKey(startOfDay),
    };
  }

  private toDateKey(date: Date): string {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
  }
}
