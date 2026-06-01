import { ApiProperty } from "@nestjs/swagger";
import { UserRole, UserStatus } from "@prisma/client";
import { PaginatedResponseDto } from "../../../../common/dto/pagination-meta.dto";

export class AdminUserProfileResponseDto {
  @ApiProperty()
  fullName: string;

  @ApiProperty({ nullable: true })
  avatarUrl: string | null;

  @ApiProperty()
  xp: number;

  @ApiProperty()
  streak: number;
}

export class AdminUserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiProperty({ type: AdminUserProfileResponseDto, nullable: true })
  profile: AdminUserProfileResponseDto | null;

  @ApiProperty()
  level: number;

  @ApiProperty()
  legalCoins: number;

  @ApiProperty()
  lastActiveAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class AdminUserListResponseDto
  implements PaginatedResponseDto<AdminUserResponseDto>
{
  @ApiProperty({ type: AdminUserResponseDto, isArray: true })
  items: AdminUserResponseDto[];

  @ApiProperty()
  meta: PaginatedResponseDto<AdminUserResponseDto>["meta"];
}

export class AdminUserSummaryResponseDto {
  @ApiProperty()
  totalUsers: number;

  @ApiProperty()
  activeThisWeek: number;

  @ApiProperty()
  totalXp: number;

  @ApiProperty()
  totalLegalCoins: number;
}
