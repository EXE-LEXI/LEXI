const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(
  /\/$/,
  ""
);

if (import.meta.env.PROD && !configuredApiBaseUrl) {
  throw new Error("VITE_API_BASE_URL is required for production builds");
}

export const API_BASE_URL = configuredApiBaseUrl ?? "http://localhost:3000";
