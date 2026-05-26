export class DailyChallengeItemDto {
  id: string;
  title: string;
  description: string;
  type: string;
  date: string;
  target: number;
  progress: number;
  progressRate: number;
  rewardXp: number;
  isCompleted: boolean;
  isClaimed: boolean;
  completedAt: Date | null;
  claimedAt: Date | null;
}

export class DailyChallengesResponseDto {
  items: DailyChallengeItemDto[];
}

export class DailyChallengeClaimResponseDto {
  challenge: DailyChallengeItemDto;
  xpAwarded: number;
}
