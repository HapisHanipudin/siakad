import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppEnv } from "../../factory";
import { getDosenHandler, createDosenHandler, getBimbinganHandler } from "./dosen.handlers";
import { getDosenRoute, createDosenRoute, getBimbinganRoute } from "./dosen.routes";

const router = new OpenAPIHono<AppEnv>();

router.openapi(getDosenRoute, getDosenHandler);
router.openapi(getBimbinganRoute, getBimbinganHandler);
router.openapi(createDosenRoute, createDosenHandler);

export { router as dosenRoutes };
