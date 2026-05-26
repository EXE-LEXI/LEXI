import { LessonDraftStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class UpdateAdminLessonDraftDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  videoScript?: string | null;

  @IsOptional()
  @IsString()
  videoPrompt?: string | null;

  @IsOptional()
  @IsString()
  reviewerNote?: string | null;

  @IsOptional()
  @IsEnum(LessonDraftStatus)
  status?: LessonDraftStatus;
}
