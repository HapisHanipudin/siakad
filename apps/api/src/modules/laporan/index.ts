import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppEnv } from "../../factory";
import {
  getStatusMahasiswaHandler,
  getPendapatanUktHandler,
  getKesulitanMatkulHandler,
  getPerformaBasisDataHandler,
  getBebanKerjaDosenHandler,
} from "./laporan.handlers";
import {
  getStatusMahasiswaRoute,
  getPendapatanUktRoute,
  getKesulitanMatkulRoute,
  getPerformaBasisDataRoute,
  getBebanKerjaDosenRoute,
} from "./laporan.routes";

const router = new OpenAPIHono<AppEnv>();

router.openapi(getStatusMahasiswaRoute, getStatusMahasiswaHandler);
router.openapi(getPendapatanUktRoute, getPendapatanUktHandler);
router.openapi(getKesulitanMatkulRoute, getKesulitanMatkulHandler);
router.openapi(getPerformaBasisDataRoute, getPerformaBasisDataHandler);
router.openapi(getBebanKerjaDosenRoute, getBebanKerjaDosenHandler);

export { router as laporanRoutes };
