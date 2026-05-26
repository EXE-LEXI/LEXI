import { LessonDraftStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "../../../../common/dto/pagination-query.dto";

export class GetAdminLessonDraftsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(LessonDraftStatus)
  status?: LessonDraftStatus;

  @IsOptional()
  @IsString()
  sourceDocumentId?: string;

  @IsOptional()
  @IsString()
  moduleId?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
