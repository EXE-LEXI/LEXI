type EnvConfig = Record<string, string | undefined>;

const DEFAULT_PORT = 3000;
const MIN_PRODUCTION_SECRET_LENGTH = 32;

export function validateEnv(config: EnvConfig) {
  const nodeEnv = config.NODE_ENV ?? "development";
  const port = Number.parseInt(config.PORT ?? `${DEFAULT_PORT}`, 10);

  const requiredKeys = ["MONGODB_URI", "JWT_SECRET", "JWT_REFRESH_SECRET"];
  const missingKeys = requiredKeys.filter((key) => !config[key]);

  if (missingKeys.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingKeys.join(", ")}`
    );
  }

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error("PORT must be a valid TCP port number");
  }

  if (nodeEnv === "production") {
    assertProductionSecret("JWT_SECRET", config.JWT_SECRET);
    assertProductionSecret("JWT_REFRESH_SECRET", config.JWT_REFRESH_SECRET);
  }

  return {
    ...config,
    NODE_ENV: nodeEnv,
    PORT: port,
    CORS_ORIGINS: config.CORS_ORIGINS ?? "",
    LEGAL_SOURCE_CRAWL_ENABLED: config.LEGAL_SOURCE_CRAWL_ENABLED ?? "false",
    LEGAL_SOURCE_CRAWL_CRON: config.LEGAL_SOURCE_CRAWL_CRON ?? "0 2 * * *",
    LEGAL_SOURCE_CRAWL_URLS: config.LEGAL_SOURCE_CRAWL_URLS ?? "",
    LEGAL_SOURCE_CRAWL_MODULE_ID: config.LEGAL_SOURCE_CRAWL_MODULE_ID ?? "",
    LEGAL_SOURCE_CRAWL_QUESTION_COUNT:
      config.LEGAL_SOURCE_CRAWL_QUESTION_COUNT ?? "3",
  };
}

function assertProductionSecret(key: string, value?: string) {
  if (!value || value.length < MIN_PRODUCTION_SECRET_LENGTH) {
    throw new Error(
      `${key} must be at least ${MIN_PRODUCTION_SECRET_LENGTH} characters in production`
    );
  }
}
