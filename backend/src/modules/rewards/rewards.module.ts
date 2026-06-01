import { Module } from "@nestjs/common";
import { AdminRewardsController } from "./controllers/admin-rewards.controller";
import { RewardsController } from "./controllers/rewards.controller";
import { RewardsRepository } from "./repositories/rewards.repository";
import { RewardsService } from "./services/rewards.service";

@Module({
  controllers: [RewardsController, AdminRewardsController],
  providers: [RewardsRepository, RewardsService],
  exports: [RewardsService],
})
export class RewardsModule {}
