import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppEnv } from "../../factory";
import { updateGradeHandler } from "./nilai.handlers";
import { updateGradeRoute } from "./nilai.routes";

const router = new OpenAPIHono<AppEnv>();

router.openapi(updateGradeRoute, updateGradeHandler);

export { router as nilaiRoutes };
