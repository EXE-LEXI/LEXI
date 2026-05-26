import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { BadgesResponseDto } from "../dto/response/badge-response.dto";
import { BadgesMapper } from "../mappers/badges.mapper";
import { BadgesRepository } from "../repositories/badges.repository";

@Injectable()
export class BadgesService {
  constructor(private readonly badgesRepository: BadgesRepository) {}

  async getBadges(userId: string): Promise<BadgesResponseDto> {
    const badges = await this.badgesRepository.findBadgesForUser(userId);
    return BadgesMapper.toResponse(badges);
  }

  async awardEarnedBadges(
    tx: Prisma.TransactionClient,
    userId: string,
    now = new Date()
  ): Promise<any[]> {
    return this.badgesRepository.awardEarnedBadges(tx, userId, now);
  }
}
