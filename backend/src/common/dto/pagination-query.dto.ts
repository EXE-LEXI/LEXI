import { Transform } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

export class PaginationQueryDto {
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === "" ? undefined : Number.parseInt(value, 10)
  )
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === "" ? undefined : Number.parseInt(value, 10)
  )
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
