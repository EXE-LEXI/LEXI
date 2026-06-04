import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import {
  Profile,
  Strategy,
  VerifyCallback,
} from "passport-google-oauth20";
import { GoogleOAuthUser } from "../interfaces/google-oauth-user.interface";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(configService: ConfigService) {
    const publicApiUrl = configService
      .get<string>("PUBLIC_API_URL", "http://localhost:3000")
      .replace(/\/$/, "");

    super({
      clientID:
        configService.get<string>("GOOGLE_CLIENT_ID") ||
        "missing-google-client-id",
      clientSecret:
        configService.get<string>("GOOGLE_CLIENT_SECRET") ||
        "missing-google-client-secret",
      callbackURL:
        configService.get<string>("GOOGLE_CALLBACK_URL") ||
        `${publicApiUrl}/auth/google/callback`,
      scope: ["email", "profile"],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ) {
    const email = profile.emails?.[0]?.value;

    if (!email) {
      done(new Error("Google account does not expose an email address"));
      return;
    }

    const googleUser: GoogleOAuthUser = {
      email,
      fullName: profile.displayName || email,
      avatarUrl: profile.photos?.[0]?.value ?? null,
    };

    done(null, googleUser);
  }
}
