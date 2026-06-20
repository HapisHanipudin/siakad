import type { RouteHandler } from "@hono/zod-openapi";
import { createDb } from "../../db";
import { getValidatedEnv } from "../../env";
import type { AppEnv } from "../../factory";
import { getMahasiswaRoute, createMahasiswaRoute } from "./mahasiswa.routes";

export const getMahasiswaHandler: RouteHandler<
  typeof getMahasiswaRoute,
  AppEnv
> = async (c) => {
  const env = getValidatedEnv(c.env);
  const client = createDb(env);

  await client.connect();
  try {
    const result = await client.query(
      "SELECT id, nama, email, role, created_at, updated_at FROM users WHERE role = $1",
      ["mahasiswa"]
    );
    const list = result.rows;

    return c.json(
      list.map((u) => ({
        id: u.id,
        nama: u.nama,
        email: u.email,
        role: u.role,
        createdAt: new Date(u.created_at).toISOString(),
        updatedAt: new Date(u.updated_at).toISOString(),
      })),
      200,
    );
  } finally {
    await client.end();
  }
};

export const createMahasiswaHandler: RouteHandler<
  typeof createMahasiswaRoute,
  AppEnv
> = async (c) => {
  const env = getValidatedEnv(c.env);
  const client = createDb(env);
  const { nama, email } = c.req.valid("json");

  await client.connect();
  try {
    const id = `mhs-${crypto.randomUUID().slice(0, 8)}`;
    const result = await client.query(
      "INSERT INTO users (id, nama, email, role) VALUES ($1, $2, $3, $4) RETURNING id, nama, email, role, created_at, updated_at",
      [id, nama, email, "mahasiswa"]
    );
    const newUser = result.rows[0];

    return c.json(
      {
        id: newUser.id,
        nama: newUser.nama,
        email: newUser.email,
        role: newUser.role,
        createdAt: new Date(newUser.created_at).toISOString(),
        updatedAt: new Date(newUser.updated_at).toISOString(),
      },
      201,
    );
  } catch (error: any) {
    return c.json(
      {
        message: error.message || "Gagal membuat mahasiswa baru",
      },
      400,
    );
  } finally {
    await client.end();
  }
};

