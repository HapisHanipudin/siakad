import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppEnv } from "../../factory";
import { createPembayaranHandler, getTagihanHandler } from "./pembayaran.handlers";
import { createPembayaranRoute, getTagihanRoute } from "./pembayaran.routes";

const router = new OpenAPIHono<AppEnv>();

router.openapi(getTagihanRoute, getTagihanHandler);
router.openapi(createPembayaranRoute, createPembayaranHandler);

export { router as pembayaranRoutes };
