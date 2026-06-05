import { Module } from '@nestjs/common';
import { ShortsController } from './controllers/shorts.controller';
import { ShortsService } from './services/shorts.service';
import { ShortsRepository } from './repositories/shorts.repository';

@Module({
  controllers: [ShortsController],
  providers: [ShortsService, ShortsRepository],
  exports: [ShortsService],
})
export class ShortsModule {}
