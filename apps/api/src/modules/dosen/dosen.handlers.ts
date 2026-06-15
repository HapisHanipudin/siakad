import type { RouteHandler } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { createDb, schema } from "../../db";
import { getValidatedEnv } from "../../env";
import type { AppEnv } from "../../factory";
import { getDosenRoute, createDosenRoute } from "./dosen.routes";

export const getDosenHandler: RouteHandler<
  typeof getDosenRoute,
  AppEnv
> = async (c) => {
  const env = getValidatedEnv(c.env);
  const db = createDb(env);

  const list = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.role, "dosen"));

  return c.json(
    list.map((u) => ({
      id: u.id,
      nama: u.nama,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    })),
    200,
  );
};

export const createDosenHandler: RouteHandler<
  typeof createDosenRoute,
  AppEnv
> = async (c) => {
  const env = getValidatedEnv(c.env);
  const db = createDb(env);
  const { nama, email } = c.req.valid("json");

  try {
    const id = `dsn-${crypto.randomUUID().slice(0, 8)}`;
    const [newUser] = await db
      .insert(schema.users)
      .values({
        id,
        nama,
        email,
        role: "dosen",
      })
      .returning();

    return c.json(
      {
        id: newUser.id,
        nama: newUser.nama,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt.toISOString(),
        updatedAt: newUser.updatedAt.toISOString(),
      },
      201,
    );
  } catch (error: any) {
    return c.json(
      {
        message: error.message || "Gagal membuat dosen baru",
      },
      400,
    );
  }
};
