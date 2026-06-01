import { NextFunction, Request, Response } from "express";

export function securityHeadersMiddleware(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Referrer-Policy", "no-referrer");
  response.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  response.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  const path = request.originalUrl ?? request.url;
  response.setHeader(
    "Cross-Origin-Resource-Policy",
    path.startsWith("/uploads/") ? "cross-origin" : "same-origin"
  );

  if (request.secure || request.headers["x-forwarded-proto"] === "https") {
    response.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }

  next();
}
