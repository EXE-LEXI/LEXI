import { ApiProperty } from "@nestjs/swagger";

export class PaginationMetaDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  hasNextPage: boolean;

  @ApiProperty()
  hasPreviousPage: boolean;
}

export type PaginatedResponseDto<T> = {
  items: T[];
  meta: PaginationMetaDto;
};

export function buildPaginationMeta(params: {
  total: number;
  page: number;
  limit: number;
}): PaginationMetaDto {
  const totalPages =
    params.total === 0 ? 0 : Math.ceil(params.total / params.limit);

  return {
    total: params.total,
    page: params.page,
    limit: params.limit,
    totalPages,
    hasNextPage: params.page < totalPages,
    hasPreviousPage: params.page > 1 && totalPages > 0,
  };
}
