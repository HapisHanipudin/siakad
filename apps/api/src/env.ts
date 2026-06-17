import { z } from "zod";

const databaseUrlSchema = z.url({
  message: "DATABASE_URL atau NEON_DATABASE_URL harus berupa URL valid",
});

export const envSchema = z.object({
  DATABASE_URL: databaseUrlSchema.optional(),
  NEON_DATABASE_URL: databaseUrlSchema.optional(),
  HYPERDRIVE: z
    .object({
      connectionString: z
        .string()
        .min(1, "HYPERDRIVE.connectionString wajib diisi"),
    })
    .optional(),
  JWT_SECRET: z.string().min(32, "JWT_SECRET minimal 32 karakter"),
  CORS_ORIGINS: z.string().optional(),
});

export type Env = z.infer<typeof envSchema> & {
  AI: Ai;
};

let cachedEnv: Env | null = null;

export const getValidatedEnv = (bindings: unknown): Env => {
  if (cachedEnv) {
    return cachedEnv;
  }

  if (!bindings || typeof bindings !== "object") {
    throw new Error("Invalid environment bindings");
  }

  const recordBindings = bindings as Record<string, unknown>;
  const aiBinding = recordBindings.AI as Ai | undefined;
  if (!aiBinding) {
    throw new Error("AI binding is required");
  }

  const parsed = envSchema.safeParse(recordBindings);

  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(", ");

    throw new Error(`Invalid environment variables: ${detail}`);
  }

  const databaseConnectionString =
    parsed.data.HYPERDRIVE?.connectionString ??
    parsed.data.DATABASE_URL ??
    parsed.data.NEON_DATABASE_URL;

  if (!databaseConnectionString) {
    throw new Error(
      "Salah satu dari HYPERDRIVE.connectionString, DATABASE_URL, atau NEON_DATABASE_URL wajib diisi",
    );
  }

  cachedEnv = {
    ...parsed.data,
    AI: aiBinding,
  };
  return cachedEnv;
};
