import { Injectable } from '@nestjs/common';
import { GamesRepository } from '../repositories/games.repository';
import { GameContentType } from '@prisma/client';

@Injectable()
export class GamesService {
  constructor(private readonly gamesRepository: GamesRepository) {}

  async getContent(type?: GameContentType, limit = 10) {
    if (!type) {
      // Just fetch DUEL_QUESTION if no type is provided for backward compatibility
      return this.gamesRepository.findContentByType('DUEL_QUESTION', limit);
    }
    return this.gamesRepository.findContentByType(type, limit);
  }

  async submitAttempt(userId: string, mode: string, score: number, details?: any) {
    // Add logic to calculate XP/Coins based on score
    const xpAwarded = score > 50 ? 10 : 0;
    const coinsAwarded = score > 80 ? 5 : 0;
    
    return this.gamesRepository.saveAttempt({
      user: { connect: { id: userId } },
      mode,
      score,
      xpAwarded,
      coinsAwarded,
      details: details || {},
    });
  }
}
