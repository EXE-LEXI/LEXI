import { Controller, Get, Post, Query, Body, UseGuards, Req } from '@nestjs/common';
import { GamesService } from '../services/games.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { GameContentType } from '@prisma/client';

@Controller('api/games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get('content')
  async getContent(
    @Query('type') type?: GameContentType,
    @Query('limit') limit = 10,
  ) {
    return this.gamesService.getContent(type, Number(limit));
  }

  @UseGuards(JwtAuthGuard)
  @Post('attempts')
  async submitAttempt(
    @Req() req: Request,
    @Body('mode') mode: string,
    @Body('score') score: number,
    @Body('details') details?: any,
  ) {
    const userId = (req.user as any).id;
    return this.gamesService.submitAttempt(userId, mode, score, details);
  }
}
