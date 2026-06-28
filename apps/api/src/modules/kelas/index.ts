import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppEnv } from "../../factory";
import { 
  getKelasHandler, 
  createKelasHandler, 
  getKelasCountHandler,
  getMataKuliahOptionsHandler,
  getRuanganOptionsHandler,
  getRombelOptionsHandler 
} from "./kelas.handlers";
import { 
  getKelasRoute, 
  createKelasRoute, 
  getKelasCountRoute,
  getMataKuliahOptionsRoute,
  getRuanganOptionsRoute,
  getRombelOptionsRoute 
} from "./kelas.routes";

const router = new OpenAPIHono<AppEnv>();

router.openapi(getKelasRoute, getKelasHandler);
router.openapi(createKelasRoute, createKelasHandler);
router.openapi(getKelasCountRoute, getKelasCountHandler);
router.openapi(getMataKuliahOptionsRoute, getMataKuliahOptionsHandler);
router.openapi(getRuanganOptionsRoute, getRuanganOptionsHandler);
router.openapi(getRombelOptionsRoute, getRombelOptionsHandler);

export { router as kelasRoutes };
