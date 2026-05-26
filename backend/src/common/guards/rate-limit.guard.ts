import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import {
  RATE_LIMIT_KEY,
  RateLimitOptions,
} from "../decorators/rate-limit.decorator";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const CLEANUP_INTERVAL_MS = 60_000;

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly buckets = new Map<string, RateLimitBucket>();
  private lastCleanupAt = 0;

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!options) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const key = this.buildKey(context, request);
    const now = Date.now();
    this.cleanupExpiredBuckets(now);

    const bucket = this.buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      this.buckets.set(key, {
        count: 1,
        resetAt: now + options.ttlMs,
      });
      return true;
    }

    if (bucket.count >= options.limit) {
      throw new HttpException(
        "Too many requests. Please try again later.",
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    bucket.count += 1;
    return true;
  }

  private buildKey(context: ExecutionContext, request: Request): string {
    const forwardedFor = request.headers["x-forwarded-for"];
    const ip =
      request.ip ??
      request.socket.remoteAddress ??
      (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor) ??
      "unknown";

    return `${context.getClass().name}:${context.getHandler().name}:${ip}`;
  }

  private cleanupExpiredBuckets(now: number): void {
    if (now - this.lastCleanupAt < CLEANUP_INTERVAL_MS) {
      return;
    }

    this.lastCleanupAt = now;

    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) {
        this.buckets.delete(key);
      }
    }
  }
}
