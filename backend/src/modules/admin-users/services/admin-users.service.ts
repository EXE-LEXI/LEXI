import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import {
  DEFAULT_MODULES_LIMIT,
  DEFAULT_MODULES_PAGE,
} from "../../learning/modules/constants/modules.constants";
import { GetAdminUsersQueryDto } from "../dto/request/get-admin-users-query.dto";
import {
  AdminUserListResponseDto,
  AdminUserSummaryResponseDto,
} from "../dto/response/admin-user-response.dto";
import { AdminUsersMapper } from "../mappers/admin-users.mapper";
import { AdminUsersRepository } from "../repositories/admin-users.repository";

@Injectable()
export class AdminUsersService {
  constructor(private readonly adminUsersRepository: AdminUsersRepository) {}

  async getUsers(
    query: GetAdminUsersQueryDto
  ): Promise<AdminUserListResponseDto> {
    const page = query.page ?? DEFAULT_MODULES_PAGE;
    const limit = query.limit ?? DEFAULT_MODULES_LIMIT;
    const [total, users] = await this.adminUsersRepository.findUsers({
      where: this.buildUsersWhere(query),
      page,
      limit,
    });

    return AdminUsersMapper.toPaginatedUsers({
      users,
      total,
      page,
      limit,
    });
  }

  async getSummary(): Promise<AdminUserSummaryResponseDto> {
    const activeSince = new Date();
    activeSince.setDate(activeSince.getDate() - 7);

    const [totalUsers, activeThisWeek, xpAggregate, rewardAggregate] =
      await this.adminUsersRepository.getSummary(activeSince);

    return AdminUsersMapper.toSummary({
      totalUsers,
      activeThisWeek,
      totalXp: xpAggregate._sum.xp ?? 0,
      totalLegalCoins: rewardAggregate._sum.balance ?? 0,
    });
  }

  private buildUsersWhere(query: GetAdminUsersQueryDto): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {};
    if (query.role) {
      where.role = query.role;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: "insensitive" } },
        {
          profile: {
            fullName: { contains: query.search, mode: "insensitive" },
          },
        },
      ];
    }
    return where;
  }
}
