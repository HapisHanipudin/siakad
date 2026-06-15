import { OpenAPIHono } from "@hono/zod-openapi";
import type { Context } from "hono";
import type { Env } from "./env";

export type AppEnv = {
  Bindings: Env;
};

export type AppContext = Context<AppEnv>;

export const createRouter = () => new OpenAPIHono<AppEnv>();
