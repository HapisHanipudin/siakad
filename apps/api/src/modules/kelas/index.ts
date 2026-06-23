import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppEnv } from "../../factory";
import { getKelasHandler, createKelasHandler, getKelasCountHandler } from "./kelas.handlers";
import { getKelasRoute, createKelasRoute, getKelasCountRoute } from "./kelas.routes";

const router = new OpenAPIHono<AppEnv>();

router.openapi(getKelasRoute, getKelasHandler);
router.openapi(createKelasRoute, createKelasHandler);
router.openapi(getKelasCountRoute, getKelasCountHandler);

export { router as kelasRoutes };
