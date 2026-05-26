import {
  DailyChallengeClaimResponseDto,
  DailyChallengeItemDto,
  DailyChallengesResponseDto,
} from "../dto/response/daily-challenge-response.dto";

export class DailyChallengesMapper {
  static toResponse(
    items: DailyChallengeItemDto[]
  ): DailyChallengesResponseDto {
    return {
      items,
    };
  }

  static toClaimResponse(params: {
    item: DailyChallengeItemDto;
    xpAwarded: number;
  }): DailyChallengeClaimResponseDto {
    return {
      challenge: params.item,
      xpAwarded: params.xpAwarded,
    };
  }

  static toItem(params: {
    challenge: any;
    userChallenge: any | null;
    date: string;
    progress: number;
  }): DailyChallengeItemDto {
    const progress = Math.min(params.progress, params.challenge.target);
    const isCompleted = progress >= params.challenge.target;
    const claimedAt = params.userChallenge?.claimedAt ?? null;
    const completedAt = params.userChallenge?.completedAt ?? null;

    return {
      id: params.challenge.id,
      title: params.challenge.title,
      description: params.challenge.description,
      type: params.challenge.type,
      date: params.date,
      target: params.challenge.target,
      progress,
      progressRate: Math.min(
        Math.round((progress / params.challenge.target) * 100),
        100
      ),
      rewardXp: params.challenge.rewardXp,
      isCompleted,
      isClaimed: claimedAt !== null,
      completedAt,
      claimedAt,
    };
  }
}
