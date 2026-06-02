import { Module } from "@nestjs/common";
import { ResourcesController } from "./controllers/resources.controller";
import { ResourcesRepository } from "./repositories/resources.repository";
import { ResourcesService } from "./services/resources.service";

@Module({
  controllers: [ResourcesController],
  providers: [ResourcesService, ResourcesRepository],
})
export class ResourcesModule {}
