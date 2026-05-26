import { Module } from "@nestjs/common";
import { CategoriesModule } from "./categories/categories.module";
import { LessonsModule } from "./lessons/lessons.module";
import { ModulesModule } from "./modules/modules.module";
import { ProgressModule } from "./progress/progress.module";
import { ReviewModule } from "./review/review.module";

@Module({
  imports: [
    CategoriesModule,
    ModulesModule,
    LessonsModule,
    ProgressModule,
    ReviewModule,
  ],
  exports: [CategoriesModule, ModulesModule, LessonsModule, ProgressModule],
})
export class LearningModule {}
