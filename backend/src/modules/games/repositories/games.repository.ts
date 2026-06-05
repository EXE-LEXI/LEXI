import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma.service';
import { Prisma, GameContentType } from '@prisma/client';

@Injectable()
export class GamesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findContentByType(type: GameContentType, limit: number) {
    return this.prisma.gameContent.findMany({
      where: { type, isActive: true },
      take: limit,
      orderBy: { sortOrder: 'asc' },
    });
  }

  async saveAttempt(data: Prisma.GameAttemptCreateInput) {
    return this.prisma.gameAttempt.create({ data });
  }

  async findContentById(id: string) {
    return this.prisma.gameContent.findUnique({ where: { id } });
  }
}
