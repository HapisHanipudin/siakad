import { cors } from "hono/cors";

const defaultOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];

const normalizeOrigin = (value: string): string | null => {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
};

const parseAllowedOrigins = (rawOrigins: string | undefined): string[] => {
  if (!rawOrigins) {
    return defaultOrigins;
  }

  const patterns = rawOrigins
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return patterns.length > 0 ? patterns : defaultOrigins;
};

const isOriginAllowed = (origin: string, pattern: string): boolean => {
  if (pattern === "*") {
    return true;
  }

  if (pattern.startsWith("*.")) {
    const patternSuffix = pattern.slice(2).toLowerCase();
    const hostname = new URL(origin).hostname.toLowerCase();
    return hostname === patternSuffix || hostname.endsWith(`.${patternSuffix}`);
  }

  const normalizedPattern = normalizeOrigin(pattern);
  return normalizedPattern === origin;
};

export const corsMiddleware = cors({
  origin: (origin, c) => {
    if (!origin) {
      return "";
    }

    const normalizedRequestOrigin = normalizeOrigin(origin);
    if (!normalizedRequestOrigin) {
      return "";
    }

    const rawOrigins =
      typeof c.env.CORS_ORIGINS === "string" ? c.env.CORS_ORIGINS : undefined;

    const allowedOrigins = parseAllowedOrigins(rawOrigins);
    const isAllowed = allowedOrigins.some((allowedOrigin) =>
      isOriginAllowed(normalizedRequestOrigin, allowedOrigin),
    );

    return isAllowed ? normalizedRequestOrigin : "";
  },
  credentials: true,
  allowMethods: ["GET", "POST", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "x-trpc-source"],
});
