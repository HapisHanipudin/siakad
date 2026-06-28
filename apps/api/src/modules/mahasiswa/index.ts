import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppEnv } from "../../factory";
import { 
  getMahasiswaHandler, 
  createMahasiswaHandler,
  getProgramStudiHandler,
  getKurikulumHandler,
  getKelompokHandler
} from "./mahasiswa.handlers";
import { 
  getMahasiswaRoute, 
  createMahasiswaRoute,
  getProgramStudiRoute,
  getKurikulumRoute,
  getKelompokRoute
} from "./mahasiswa.routes";

const router = new OpenAPIHono<AppEnv>();

router.openapi(getMahasiswaRoute, getMahasiswaHandler);
router.openapi(createMahasiswaRoute, createMahasiswaHandler);
router.openapi(getProgramStudiRoute, getProgramStudiHandler);
router.openapi(getKurikulumRoute, getKurikulumHandler);
router.openapi(getKelompokRoute, getKelompokHandler);

export { router as mahasiswaRoutes };
