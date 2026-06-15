import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppEnv } from "../../factory";
import { getDosenHandler, createDosenHandler } from "./dosen.handlers";
import { getDosenRoute, createDosenRoute } from "./dosen.routes";

const router = new OpenAPIHono<AppEnv>();

router.openapi(getDosenRoute, getDosenHandler);
router.openapi(createDosenRoute, createDosenHandler);

export { router as dosenRoutes };
