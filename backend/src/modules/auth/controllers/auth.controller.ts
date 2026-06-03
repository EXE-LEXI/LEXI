import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { Request, Response } from "express";
import { RateLimit } from "../../../common/decorators/rate-limit.decorator";
import { RateLimitGuard } from "../../../common/guards/rate-limit.guard";
import { AUTH_RATE_LIMITS } from "../constants/auth.constants";
import { CurrentUser } from "../decorators/current-user.decorator";
import { LoginDto } from "../dto/request/login.dto";
import { RefreshTokenDto } from "../dto/request/refresh-token.dto";
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
import { GoogleAuthGuard } from "../guards/google-auth.guard";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { GoogleOAuthUser } from "../interfaces/google-oauth-user.interface";
import { AuthService } from "../services/auth.service";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @Post("register")
  @UseGuards(RateLimitGuard)
  @RateLimit(AUTH_RATE_LIMITS.register)
  @ApiOperation({ summary: "Register a new user account" })
  @ApiCreatedResponse({ type: AuthResponseDto })
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Post("login")
  @UseGuards(RateLimitGuard)
  @RateLimit(AUTH_RATE_LIMITS.login)
  @ApiOperation({ summary: "Login and get an access token" })
  @ApiOkResponse({ type: AuthResponseDto })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Get("google")
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: "Start Google OAuth login" })
  async googleLogin(): Promise<void> {
    // Passport redirects the browser to Google.
  }

  @Get("google/callback")
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: "Handle Google OAuth callback" })
  async googleCallback(
    @Req() request: Request & { user: GoogleOAuthUser },
    @Res() response: Response
  ): Promise<void> {
    const auth = await this.authService.loginWithGoogle(request.user);
    const redirectUrl = new URL(
      "/auth/callback",
      this.getFrontendUrl()
    );
    redirectUrl.hash = new URLSearchParams({
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
    }).toString();

    response.redirect(redirectUrl.toString());
  }

  @Post("refresh")
  @UseGuards(RateLimitGuard)
  @RateLimit(AUTH_RATE_LIMITS.refresh)
  @ApiOperation({ summary: "Refresh access token using refresh token" })
  @ApiOkResponse({ type: AuthResponseDto })
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post("logout")
  @UseGuards(RateLimitGuard)
  @RateLimit(AUTH_RATE_LIMITS.logout)
  @ApiOperation({ summary: "Logout and revoke a refresh token" })
  @ApiOkResponse({ type: LogoutResponseDto })
  async logout(@Body() dto: RefreshTokenDto): Promise<LogoutResponseDto> {
    return this.authService.logout(dto.refreshToken);
  }

  @Post("password-reset/request")
  @UseGuards(RateLimitGuard)
  @RateLimit(AUTH_RATE_LIMITS.requestPasswordReset)
  @ApiOperation({ summary: "Request a password reset token" })
  @ApiOkResponse({ type: PasswordResetRequestResponseDto })
  async requestPasswordReset(
    @Body() dto: RequestPasswordResetDto
  ): Promise<PasswordResetRequestResponseDto> {
    return this.authService.requestPasswordReset(dto);
  }

  @Post("password-reset/confirm")
  @UseGuards(RateLimitGuard)
  @RateLimit(AUTH_RATE_LIMITS.resetPassword)
  @ApiOperation({ summary: "Reset password using a valid reset token" })
  @ApiOkResponse({ type: PasswordResetResponseDto })
  async resetPassword(
    @Body() dto: ResetPasswordDto
  ): Promise<PasswordResetResponseDto> {
    return this.authService.resetPassword(dto);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get the current authenticated user" })
  @ApiOkResponse({ type: AuthUserDto })
  async getMe(@CurrentUser() user: AuthUserDto): Promise<AuthUserDto> {
    return this.authService.getCurrentUser(user.id);
  }

  private getFrontendUrl(): string {
    const configuredFrontendUrl = this.configService.get<string>("FRONTEND_URL");

    if (configuredFrontendUrl) {
      return configuredFrontendUrl.replace(/\/$/, "");
    }

    const corsOrigins = this.configService.get<string>("CORS_ORIGINS", "");
    const firstOrigin = corsOrigins
      .split(",")
      .map((origin) => origin.trim())
      .find(Boolean);

    return firstOrigin ?? "http://localhost:5173";
  }
}
