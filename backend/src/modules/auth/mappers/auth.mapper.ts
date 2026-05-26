import { AuthUserDto } from "../dto/response/auth-user.dto";
import { AuthUserRecord } from "../repositories/auth.repository";

export class AuthMapper {
  static toAuthUserDto(user: AuthUserRecord): AuthUserDto {
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
}
