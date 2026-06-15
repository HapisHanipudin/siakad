import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppEnv } from "../../factory";
import { getKrsHandler, createKrsHandler } from "./krs.handlers";
import { getKrsRoute, createKrsRoute } from "./krs.routes";

const router = new OpenAPIHono<AppEnv>();

router.openapi(getKrsRoute, getKrsHandler);
router.openapi(createKrsRoute, createKrsHandler);

export { router as krsRoutes };
