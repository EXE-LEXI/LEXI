import { PasswordChangeResponseDto } from "../dto/response/password-change-response.dto";
import { UserResponseDto } from "../dto/response/user-response.dto";
import { UserRecord } from "../repositories/users.repository";

export class UsersMapper {
  static toUserResponseDto(user: UserRecord): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: user.profile
        ? {
            id: user.profile.id,
            userId: user.profile.userId,
            fullName: user.profile.fullName,
            avatarUrl: user.profile.avatarUrl,
            xp: user.profile.xp,
            streak: user.profile.streak,
            createdAt: user.profile.createdAt,
            updatedAt: user.profile.updatedAt,
          }
        : null,
    };
  }

  static toPasswordChangeResponseDto(): PasswordChangeResponseDto {
    return { updated: true };
  }
}
