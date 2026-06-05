import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ShortsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ShortVideoWhereInput;
    orderBy?: Prisma.ShortVideoOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return this.prisma.shortVideo.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        quiz: true,
      },
    });
  }

  async count(where?: Prisma.ShortVideoWhereInput) {
    return this.prisma.shortVideo.count({ where });
  }

  async findById(id: string) {
    return this.prisma.shortVideo.findUnique({
      where: { id },
      include: {
        quiz: true,
      },
    });
  }

  async upsertReaction(videoId: string, userId: string, data: { liked?: boolean; bookmarked?: boolean }) {
    const existing = await this.prisma.shortVideoReaction.findUnique({
      where: {
        videoId_userId: {
          videoId,
          userId,
        },
      },
    });

    if (existing) {
      return this.prisma.shortVideoReaction.update({
        where: { id: existing.id },
        data,
      });
    }

    return this.prisma.shortVideoReaction.create({
      data: {
        videoId,
        userId,
        liked: data.liked ?? false,
        bookmarked: data.bookmarked ?? false,
      },
    });
  }

  async addComment(videoId: string, userId: string, content: string) {
    return this.prisma.shortVideoComment.create({
      data: {
        videoId,
        userId,
        content,
      },
      include: {
        user: {
          include: {
            profile: true,
          }
        }
      }
    });
  }

  async getComments(videoId: string) {
    return this.prisma.shortVideoComment.findMany({
      where: { videoId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          include: { profile: true }
        }
      }
    });
  }
}
