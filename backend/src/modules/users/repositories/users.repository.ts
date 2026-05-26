import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../../core/prisma.service";
import { USER_DEFAULT_PROFILE_NAME } from "../constants/users.constants";
import { UpdateUserProfileData } from "../interfaces/update-user-profile-data.interface";

export const userSelect = {
  id: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  profile: {
    select: {
      id: true,
      userId: true,
      fullName: true,
      avatarUrl: true,
      xp: true,
      streak: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} satisfies Prisma.UserSelect;

export type UserRecord = Prisma.UserGetPayload<{
  select: typeof userSelect;
}>;

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: userSelect,
    });
  }

  findCredentialsById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        passwordHash: true,
        status: true,
      },
    });
  }

  async updateProfile(
    userId: string,
    data: UpdateUserProfileData
  ): Promise<UserRecord | null> {
    await this.prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        fullName: data.fullName ?? USER_DEFAULT_PROFILE_NAME,
        avatarUrl: data.avatarUrl,
      },
      update: this.removeUndefinedValues({
        fullName: data.fullName,
        avatarUrl: data.avatarUrl,
      }),
    });

    return this.findById(userId);
  }

  updatePassword(userId: string, passwordHash: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
      select: { id: true },
    });
  }

  private removeUndefinedValues<T extends Record<string, unknown>>(data: T) {
    return Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined)
    ) as Partial<T>;
  }
}
