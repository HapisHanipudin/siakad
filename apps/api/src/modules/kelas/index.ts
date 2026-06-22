import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppEnv } from "../../factory";
import { getKelasHandler, createKelasHandler } from "./kelas.handlers";
import { getKelasRoute, createKelasRoute } from "./kelas.routes";

const router = new OpenAPIHono<AppEnv>();

router.openapi(getKelasRoute, getKelasHandler);
router.openapi(createKelasRoute, createKelasHandler);

export { router as kelasRoutes };
