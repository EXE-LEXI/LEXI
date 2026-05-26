export const PASSWORD_SALT_ROUNDS = 10;

export const AUTH_TOKEN_EXPIRES_IN = {
  access: "15m",
  refresh: "7d",
} as const;

export const AUTH_REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const AUTH_RATE_LIMITS = {
  register: {
    limit: 5,
    ttlMs: 60_000,
  },
  login: {
    limit: 10,
    ttlMs: 60_000,
  },
  refresh: {
    limit: 30,
    ttlMs: 60_000,
  },
  logout: {
    limit: 30,
    ttlMs: 60_000,
  },
} as const;
