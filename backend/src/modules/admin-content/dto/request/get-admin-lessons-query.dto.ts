import { LessonReviewStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "../../../../common/dto/pagination-query.dto";

export class GetAdminLessonsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(LessonReviewStatus)
  status?: LessonReviewStatus;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  moduleId?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
