import { Controller, Get, Post, Param, Query, Body, UseGuards, Req } from '@nestjs/common';
import { ShortsService } from '../services/shorts.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('api/shorts')
export class ShortsController {
  constructor(private readonly shortsService: ShortsService) {}

  @Get()
  async getShorts(
    @Query('category') category?: string,
    @Query('limit') limit = 10,
    @Query('skip') skip = 0,
  ) {
    return this.shortsService.getShorts(category, Number(limit), Number(skip));
  }

  @Get(':id')
  async getShort(@Param('id') id: string) {
    return this.shortsService.getShortById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  async likeVideo(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.shortsService.toggleLike(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/bookmark')
  async bookmarkVideo(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.shortsService.toggleBookmark(id, userId);
  }

  @Get(':id/comments')
  async getComments(@Param('id') id: string) {
    return this.shortsService.getComments(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  async postComment(
    @Param('id') id: string,
    @Body('content') content: string,
    @Req() req: Request,
  ) {
    const userId = (req.user as any).id;
    return this.shortsService.addComment(id, userId, content);
  }
}
