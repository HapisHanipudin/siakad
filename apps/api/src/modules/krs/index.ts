import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppEnv } from "../../factory";
import { getKrsHandler, createKrsHandler, cancelKrsHandler, approveKrsHandler } from "./krs.handlers";
import { getKrsRoute, createKrsRoute, cancelKrsRoute, approveKrsRoute } from "./krs.routes";

const router = new OpenAPIHono<AppEnv>();

router.openapi(getKrsRoute, getKrsHandler);
router.openapi(createKrsRoute, createKrsHandler);
router.openapi(cancelKrsRoute, cancelKrsHandler);
router.openapi(approveKrsRoute, approveKrsHandler);

export { router as krsRoutes };
