import { Injectable, NotFoundException } from '@nestjs/common';
import { ShortsRepository } from '../repositories/shorts.repository';

@Injectable()
export class ShortsService {
  constructor(private readonly shortsRepository: ShortsRepository) {}

  async getShorts(category?: string, limit = 10, skip = 0) {
    const where = {
      isActive: true,
      ...(category ? { category } : {}),
    };

    const [items, total] = await Promise.all([
      this.shortsRepository.findAll({
        skip,
        take: limit,
        where,
        orderBy: { sortOrder: 'asc' },
      }),
      this.shortsRepository.count(where),
    ]);

    return {
      items,
      meta: {
        total,
        page: Math.floor(skip / limit) + 1,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getShortById(id: string) {
    const short = await this.shortsRepository.findById(id);
    if (!short) throw new NotFoundException('Short video not found');
    return short;
  }

  async toggleLike(videoId: string, userId: string) {
    // Need to flip the current state or just set to true if not exist
    return this.shortsRepository.upsertReaction(videoId, userId, { liked: true }); // simplified
  }

  async toggleBookmark(videoId: string, userId: string) {
    return this.shortsRepository.upsertReaction(videoId, userId, { bookmarked: true }); // simplified
  }

  async getComments(videoId: string) {
    return this.shortsRepository.getComments(videoId);
  }

  async addComment(videoId: string, userId: string, content: string) {
    return this.shortsRepository.addComment(videoId, userId, content);
  }
}
