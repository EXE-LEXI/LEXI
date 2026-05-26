export class LeaderboardWindowDto {
  startAt: Date;
  endAt: Date;
}

export class LeaderboardUserDto {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  xp: number;
  rank: number | null;
  isCurrentUser: boolean;
}

export class WeeklyLeaderboardResponseDto {
  window: LeaderboardWindowDto;
  items: LeaderboardUserDto[];
  currentUser: LeaderboardUserDto;
}
