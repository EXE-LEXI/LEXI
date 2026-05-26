import { Transform } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class GenerateAdminLessonDraftDto {
  @IsString()
  sourceDocumentId: string;

  @IsOptional()
  @IsString()
  moduleId?: string | null;

  @IsOptional()
  @IsString()
  titleHint?: string | null;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === "" ? undefined : Number.parseInt(value, 10)
  )
  @IsInt()
  @Min(1)
  @Max(10)
  questionCount?: number;
}
