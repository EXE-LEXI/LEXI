import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";

export class CreateAdminOptionDto {
  @IsString()
  text: string;

  @IsBoolean()
  isCorrect: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class CreateAdminQuestionDto {
  @IsString()
  text: string;

  @IsOptional()
  @IsString()
  explanation?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ValidateNested({ each: true })
  @Type(() => CreateAdminOptionDto)
  @ArrayMinSize(2)
  options: CreateAdminOptionDto[];
}

export class CreateAdminQuestionsBulkDto {
  @ValidateNested({ each: true })
  @Type(() => CreateAdminQuestionDto)
  @ArrayMinSize(1)
  questions: CreateAdminQuestionDto[];
}
