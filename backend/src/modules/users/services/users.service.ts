import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { UserStatus } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { PASSWORD_SALT_ROUNDS } from "../../auth/constants/auth.constants";
import { ChangePasswordDto } from "../dto/request/change-password.dto";
import { UpdateProfileDto } from "../dto/request/update-profile.dto";
import { PasswordChangeResponseDto } from "../dto/response/password-change-response.dto";
import { UserResponseDto } from "../dto/response/user-response.dto";
import { UsersMapper } from "../mappers/users.mapper";
import { UsersRepository } from "../repositories/users.repository";

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getMe(userId: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(userId);

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new NotFoundException("User not found");
    }

    return UsersMapper.toUserResponseDto(user);
  }

  async updateMe(
    userId: string,
    dto: UpdateProfileDto
  ): Promise<UserResponseDto> {
    const user = await this.usersRepository.updateProfile(userId, dto);

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new NotFoundException("User not found");
    }

    return UsersMapper.toUserResponseDto(user);
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto
  ): Promise<PasswordChangeResponseDto> {
    const user = await this.usersRepository.findCredentialsById(userId);

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new NotFoundException("User not found");
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException("Current password is invalid");
    }

    const isSamePassword = await bcrypt.compare(
      dto.newPassword,
      user.passwordHash
    );

    if (isSamePassword) {
      throw new BadRequestException(
        "New password must be different from current password"
      );
    }

    const passwordHash = await bcrypt.hash(
      dto.newPassword,
      PASSWORD_SALT_ROUNDS
    );
    await this.usersRepository.updatePassword(userId, passwordHash);

    return UsersMapper.toPasswordChangeResponseDto();
  }
}
