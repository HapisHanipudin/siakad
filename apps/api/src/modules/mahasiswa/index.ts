import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppEnv } from "../../factory";
import { getMahasiswaHandler, createMahasiswaHandler } from "./mahasiswa.handlers";
import { getMahasiswaRoute, createMahasiswaRoute } from "./mahasiswa.routes";

const router = new OpenAPIHono<AppEnv>();

router.openapi(getMahasiswaRoute, getMahasiswaHandler);
router.openapi(createMahasiswaRoute, createMahasiswaHandler);

export { router as mahasiswaRoutes };
