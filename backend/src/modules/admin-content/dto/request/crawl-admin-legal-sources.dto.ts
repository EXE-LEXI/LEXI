import { Transform } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from "class-validator";

export class CrawlAdminLegalSourcesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @IsUrl({ require_protocol: true }, { each: true })
  urls: string[];

  @IsOptional()
  @IsString()
  moduleId?: string | null;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === ""
      ? true
      : value === true || value === "true"
  )
  @IsBoolean()
  generateDrafts?: boolean;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === "" ? undefined : Number.parseInt(value, 10)
  )
  @IsInt()
  @Min(1)
  @Max(10)
  questionCount?: number;
}
