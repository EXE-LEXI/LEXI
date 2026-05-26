import { Module } from "@nestjs/common";
import { PrismaModule } from "../../../core/prisma.module";
import { CategoriesController } from "./controllers/categories.controller";
import { CategoriesRepository } from "./repositories/categories.repository";
import { CategoriesService } from "./services/categories.service";

@Module({
  imports: [PrismaModule],
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoriesRepository],
  exports: [CategoriesService],
})
export class CategoriesModule {}
