import {
  LeaderboardUserDto,
  WeeklyLeaderboardResponseDto,
} from "../dto/response/weekly-leaderboard-response.dto";

export class LeaderboardMapper {
  static toWeeklyResponse(params: {
    startAt: Date;
    endAt: Date;
    items: LeaderboardUserDto[];
    currentUser: LeaderboardUserDto;
  }): WeeklyLeaderboardResponseDto {
    return {
      window: {
        startAt: params.startAt,
        endAt: params.endAt,
      },
      items: params.items,
      currentUser: params.currentUser,
    };
  }
}
