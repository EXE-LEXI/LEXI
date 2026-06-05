import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../../core/prisma.service";

@Injectable()
export class AdminUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUsers(params: {
    where: Prisma.UserWhereInput;
    page: number;
    limit: number;
  }) {
    return this.prisma.$transaction([
      this.prisma.user.count({ where: params.where }),
      this.prisma.user.findMany({
        where: params.where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          profile: {
            select: {
              fullName: true,
              avatarUrl: true,
              xp: true,
              streak: true,
              updatedAt: true,
            },
          },
          rewardAccount: {
            select: {
              balance: true,
            },
          },
        },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      }),
    ]);
  }

  updateUser(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  getSummary(activeSince: Date) {
    return this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: {
          OR: [
            { updatedAt: { gte: activeSince } },
            { profile: { updatedAt: { gte: activeSince } } },
          ],
        },
      }),
      this.prisma.userProfile.aggregate({
        _sum: {
          xp: true,
        },
      }),
      this.prisma.rewardAccount.aggregate({
        _sum: {
          balance: true,
        },
      }),
    ]);
  }
}
