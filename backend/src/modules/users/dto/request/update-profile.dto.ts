import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from "class-validator";
import {
  USER_PROFILE_AVATAR_URL_MAX_LENGTH,
  USER_PROFILE_FULL_NAME_MAX_LENGTH,
  USER_PROFILE_FULL_NAME_MIN_LENGTH,
} from "../../constants/users.constants";

export class UpdateProfileDto {
  @ApiPropertyOptional({
    minLength: USER_PROFILE_FULL_NAME_MIN_LENGTH,
    maxLength: USER_PROFILE_FULL_NAME_MAX_LENGTH,
  })
  @IsOptional()
  @IsString()
  @MinLength(USER_PROFILE_FULL_NAME_MIN_LENGTH)
  @MaxLength(USER_PROFILE_FULL_NAME_MAX_LENGTH)
  fullName?: string;

  @ApiPropertyOptional({
    nullable: true,
    maxLength: USER_PROFILE_AVATAR_URL_MAX_LENGTH,
  })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(USER_PROFILE_AVATAR_URL_MAX_LENGTH)
  avatarUrl?: string | null;
}
