import { Module } from "@nestjs/common";
import { PrismaModule } from "../../../core/prisma.module";
import { ProgressController } from "./controllers/progress.controller";
import { ProgressRepository } from "./repositories/progress.repository";
import { ProgressService } from "./services/progress.service";

@Module({
  imports: [PrismaModule],
  controllers: [ProgressController],
  providers: [ProgressService, ProgressRepository],
  exports: [ProgressService],
})
export class ProgressModule {}
