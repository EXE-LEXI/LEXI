import { buildPaginationMeta } from "../../../common/dto/pagination-meta.dto";
import {
  AdminUserListResponseDto,
  AdminUserResponseDto,
  AdminUserSummaryResponseDto,
} from "../dto/response/admin-user-response.dto";

export class AdminUsersMapper {
  static toUser(user: any): AdminUserResponseDto {
    const xp = user.profile?.xp ?? 0;
    const profileUpdatedAt = user.profile?.updatedAt ?? user.updatedAt;
    const lastActiveAt =
      profileUpdatedAt > user.updatedAt ? profileUpdatedAt : user.updatedAt;

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      profile: user.profile
        ? {
            fullName: user.profile.fullName,
            avatarUrl: user.profile.avatarUrl,
            xp: user.profile.xp,
            streak: user.profile.streak,
          }
        : null,
      level: Math.floor(xp / 1000) + 1,
      legalCoins: user.rewardAccount?.balance ?? 0,
      lastActiveAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static toPaginatedUsers(params: {
    users: any[];
    total: number;
    page: number;
    limit: number;
  }): AdminUserListResponseDto {
    return {
      items: params.users.map((user) => this.toUser(user)),
      meta: buildPaginationMeta({
        total: params.total,
        page: params.page,
        limit: params.limit,
      }),
    };
  }

  static toSummary(params: {
    totalUsers: number;
    activeThisWeek: number;
    totalXp: number;
    totalLegalCoins?: number;
  }): AdminUserSummaryResponseDto {
    return {
      totalUsers: params.totalUsers,
      activeThisWeek: params.activeThisWeek,
      totalXp: params.totalXp,
      totalLegalCoins: params.totalLegalCoins ?? 0,
    };
  }
}
