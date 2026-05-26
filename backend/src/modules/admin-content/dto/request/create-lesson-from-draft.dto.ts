import { Transform } from "class-transformer";
import { IsInt, IsOptional, IsString, IsUrl, Min } from "class-validator";

export class CreateLessonFromDraftDto {
  @IsOptional()
  @IsString()
  moduleId?: string | null;

  @IsOptional()
  @IsString()
  slug?: string | null;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  videoUrl?: string | null;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === "" ? undefined : Number.parseInt(value, 10)
  )
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
