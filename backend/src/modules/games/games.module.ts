import { Module } from '@nestjs/common';
import { GamesController } from './controllers/games.controller';
import { GamesService } from './services/games.service';
import { GamesRepository } from './repositories/games.repository';

@Module({
  controllers: [GamesController],
  providers: [GamesService, GamesRepository],
  exports: [GamesService],
})
export class GamesModule {}
