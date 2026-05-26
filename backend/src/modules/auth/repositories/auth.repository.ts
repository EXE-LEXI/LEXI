import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../../core/prisma.service";
import { RegisterDto } from "../dto/request/register.dto";

export const authUserSelect = {
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

export type AuthUserRecord = Prisma.UserGetPayload<{
  select: typeof authUserSelect;
}>;

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUserIdByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
  }

  findUserCredentialsByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        status: true,
      },
    });
  }

  createUser(dto: RegisterDto, passwordHash: string) {
    return this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        profile: {
          create: {
            fullName: dto.fullName,
          },
        },
      },
      select: authUserSelect,
    });
  }

  findAuthUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: authUserSelect,
    });
  }

  createRefreshToken(data: {
    userId: string;
    jti: string;
    tokenHash: string;
    expiresAt: Date;
  }) {
    return this.prisma.refreshToken.create({
      data,
      select: {
        id: true,
        userId: true,
        jti: true,
        tokenHash: true,
        expiresAt: true,
        revokedAt: true,
      },
    });
  }

  findRefreshTokenByJti(jti: string) {
    return this.prisma.refreshToken.findUnique({
      where: { jti },
      select: {
        id: true,
        userId: true,
        jti: true,
        tokenHash: true,
        expiresAt: true,
        revokedAt: true,
      },
    });
  }

  rotateRefreshToken(
    tokenId: string,
    data: {
      userId: string;
      jti: string;
      tokenHash: string;
      expiresAt: Date;
    }
  ) {
    return this.prisma.$transaction(async (tx) => {
      const updateResult = await tx.refreshToken.updateMany({
        where: {
          id: tokenId,
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });

      if (updateResult.count !== 1) {
        return null;
      }

      return tx.refreshToken.create({
        data,
        select: { id: true },
      });
    });
  }

  revokeRefreshToken(tokenId: string) {
    return this.prisma.refreshToken.updateMany({
      where: {
        id: tokenId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }
}
