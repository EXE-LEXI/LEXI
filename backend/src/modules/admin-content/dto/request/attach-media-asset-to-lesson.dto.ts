import { IsOptional, IsString } from "class-validator";

export class AttachMediaAssetToLessonDto {
  @IsOptional()
  @IsString()
  lessonId?: string;
}
