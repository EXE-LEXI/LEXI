import { Module } from "@nestjs/common";
import { BadgesController } from "./controllers/badges.controller";
import { DailyChallengesController } from "./controllers/daily-challenges.controller";
import { BadgesRepository } from "./repositories/badges.repository";
import { DailyChallengesRepository } from "./repositories/daily-challenges.repository";
import { BadgesService } from "./services/badges.service";
import { DailyChallengesService } from "./services/daily-challenges.service";

@Module({
  controllers: [DailyChallengesController, BadgesController],
  providers: [
    DailyChallengesRepository,
    DailyChallengesService,
    BadgesRepository,
    BadgesService,
  ],
  exports: [DailyChallengesService, BadgesService],
})
export class GamificationModule {}
