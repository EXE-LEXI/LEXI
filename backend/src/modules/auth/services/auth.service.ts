import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { UserStatus } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { createHash, randomBytes, randomUUID } from "crypto";
import {
  AUTH_REFRESH_TOKEN_TTL_MS,
  AUTH_TOKEN_EXPIRES_IN,
  PASSWORD_SALT_ROUNDS,
  PASSWORD_RESET_TOKEN_TTL_MS,
} from "../constants/auth.constants";
import { LoginDto } from "../dto/request/login.dto";
import { RegisterDto } from "../dto/request/register.dto";
import { RequestPasswordResetDto } from "../dto/request/request-password-reset.dto";
import { ResetPasswordDto } from "../dto/request/reset-password.dto";
import { AuthResponseDto } from "../dto/response/auth-response.dto";
import { AuthUserDto } from "../dto/response/auth-user.dto";
import { LogoutResponseDto } from "../dto/response/logout-response.dto";
import {
  PasswordResetRequestResponseDto,
  PasswordResetResponseDto,
} from "../dto/response/password-reset-response.dto";
import {
  JwtPayload,
  RefreshJwtPayload,
} from "../interfaces/jwt-payload.interface";
import { AuthMapper } from "../mappers/auth.mapper";
import { AuthRepository } from "../repositories/auth.repository";

type RefreshTokenRecord = NonNullable<
  Awaited<ReturnType<AuthRepository["findRefreshTokenByJti"]>>
>;

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.authRepository.findUserIdByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException("Email already exists");
    }

    const passwordHash = await bcrypt.hash(dto.password, PASSWORD_SALT_ROUNDS);

    const user = await this.authRepository.createUser(dto, passwordHash);

    return this.buildAuthResponse(AuthMapper.toAuthUserDto(user));
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.authRepository.findUserCredentialsByEmail(
      dto.email
    );

    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException("Account is not active");
    }

    const authUser = await this.getAuthUserById(user.id);
    return this.buildAuthResponse(authUser);
  }

  async getCurrentUser(userId: string): Promise<AuthUserDto> {
    return this.getAuthUserById(userId);
  }

  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    const payload = await this.verifyRefreshTokenPayload(refreshToken);
    const tokenRecord = await this.getValidRefreshTokenRecord(
      refreshToken,
      payload
    );

    const user = await this.getAuthUserById(payload.sub);
    return this.buildAuthResponse(user, tokenRecord.id);
  }

  async logout(refreshToken: string): Promise<LogoutResponseDto> {
    let payload: RefreshJwtPayload;
    let tokenRecord: RefreshTokenRecord;

    try {
      payload = await this.verifyRefreshTokenPayload(refreshToken);
      tokenRecord = await this.getValidRefreshTokenRecord(
        refreshToken,
        payload
      );
    } catch {
      return { loggedOut: true };
    }

    const revokeResult = await this.authRepository.revokeRefreshToken(
      tokenRecord.id
    );

    if (revokeResult.count !== 1) {
      return { loggedOut: true };
    }

    return { loggedOut: true };
  }

  async requestPasswordReset(
    dto: RequestPasswordResetDto
  ): Promise<PasswordResetRequestResponseDto> {
    const user = await this.authRepository.findActiveUserIdByEmail(dto.email);

    if (!user) {
      return { accepted: true, resetToken: null };
    }

    const resetToken = randomBytes(32).toString("base64url");

    await this.authRepository.createPasswordResetToken({
      userId: user.id,
      tokenHash: this.hashToken(resetToken),
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS),
    });

    return {
      accepted: true,
      resetToken:
        this.configService.get<string>("NODE_ENV", "development") ===
        "production"
          ? null
          : resetToken,
    };
  }

  async resetPassword(
    dto: ResetPasswordDto
  ): Promise<PasswordResetResponseDto> {
    const passwordHash = await bcrypt.hash(
      dto.newPassword,
      PASSWORD_SALT_ROUNDS
    );
    const result = await this.authRepository.consumePasswordResetToken(
      this.hashToken(dto.token),
      passwordHash
    );

    if (!result) {
      throw new BadRequestException("Invalid or expired password reset token");
    }

    return { reset: true };
  }

  async validateUser(userId: string): Promise<AuthUserDto> {
    return this.getAuthUserById(userId);
  }

  private async getAuthUserById(userId: string): Promise<AuthUserDto> {
    const user = await this.authRepository.findAuthUserById(userId);

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException("User is not authorized");
    }

    return AuthMapper.toAuthUserDto(user);
  }

  private async buildAuthResponse(
    user: AuthUserDto,
    refreshTokenIdToRevoke?: string
  ): Promise<AuthResponseDto> {
    const refreshToken = await this.generateRefreshToken(user.id, user.email);

    if (refreshTokenIdToRevoke) {
      const rotatedToken = await this.authRepository.rotateRefreshToken(
        refreshTokenIdToRevoke,
        {
          userId: user.id,
          jti: refreshToken.jti,
          tokenHash: this.hashToken(refreshToken.token),
          expiresAt: refreshToken.expiresAt,
        }
      );

      if (!rotatedToken) {
        throw new UnauthorizedException("Invalid refresh token");
      }
    } else {
      await this.authRepository.createRefreshToken({
        userId: user.id,
        jti: refreshToken.jti,
        tokenHash: this.hashToken(refreshToken.token),
        expiresAt: refreshToken.expiresAt,
      });
    }

    return {
      accessToken: await this.generateAccessToken(user.id, user.email),
      refreshToken: refreshToken.token,
      user,
    };
  }

  private async generateAccessToken(
    userId: string,
    email: string
  ): Promise<string> {
    const payload: JwtPayload = { sub: userId, email };
    return this.jwtService.signAsync(payload);
  }

  private async generateRefreshToken(
    userId: string,
    email: string
  ): Promise<{
    token: string;
    jti: string;
    expiresAt: Date;
  }> {
    const jti = randomUUID();
    const payload: RefreshJwtPayload = {
      sub: userId,
      email,
      type: "refresh",
      jti,
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      expiresIn: AUTH_TOKEN_EXPIRES_IN.refresh,
    });

    return {
      token,
      jti,
      expiresAt: new Date(Date.now() + AUTH_REFRESH_TOKEN_TTL_MS),
    };
  }

  private async verifyRefreshTokenPayload(
    refreshToken: string
  ): Promise<RefreshJwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<RefreshJwtPayload>(
        refreshToken,
        {
          secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
        }
      );

      if (payload.type !== "refresh" || !payload.jti) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      return payload;
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  private async getValidRefreshTokenRecord(
    refreshToken: string,
    payload: RefreshJwtPayload
  ): Promise<RefreshTokenRecord> {
    const tokenRecord = await this.authRepository.findRefreshTokenByJti(
      payload.jti
    );

    if (
      !tokenRecord ||
      tokenRecord.userId !== payload.sub ||
      tokenRecord.revokedAt ||
      tokenRecord.expiresAt.getTime() <= Date.now() ||
      tokenRecord.tokenHash !== this.hashToken(refreshToken)
    ) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    return tokenRecord;
  }

  private hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }
}
