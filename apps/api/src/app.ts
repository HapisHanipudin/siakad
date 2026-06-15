import { createRoute, z } from "@hono/zod-openapi";
import { getValidatedEnv } from "./env";
import { createRouter } from "./factory";
import { corsMiddleware } from "./middlewares/cors";
import { mahasiswaRoutes } from "./modules/mahasiswa";
import { dosenRoutes } from "./modules/dosen";
import { krsRoutes } from "./modules/krs";

const app = createRouter();

app.use("*", corsMiddleware);

app.use("*", async (c, next) => {
  try {
    getValidatedEnv(c.env);
    await next();
  } catch {
    return c.json({ message: "Invalid environment variables" }, 500);
  }
});

app.route("/", mahasiswaRoutes);
app.route("/", dosenRoutes);
app.route("/", krsRoutes);

const docRoute = createRoute({
  method: "get",
  path: "/doc",
  tags: ["Docs"],
  responses: {
    200: {
      description: "OpenAPI JSON spec",
      content: {
        "application/json": {
          schema: z.any(),
        },
      },
    },
  },
});

const referenceRoute = createRoute({
  method: "get",
  path: "/reference",
  tags: ["Docs"],
  responses: {
    200: {
      description: "Scalar docs UI",
      content: {
        "text/html": {
          schema: z.string(),
        },
      },
    },
  },
});

app.openapi(docRoute, (c) => {
  return c.json(
    app.getOpenAPI31Document({
      openapi: "3.1.0",
      info: {
        title: "SiAkad API",
        version: "1.0.0",
      },
    }),
    200,
  );
});

app.openapi(referenceRoute, (c) => {
  const html = `<!doctype html>
<html>
  <head>
    <meta charset=\"utf-8\" />
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
    <title>SiAkad API Reference</title>
  </head>
  <body>
    <script id=\"api-reference\" data-url=\"/doc\"></script>
    <script src=\"https://cdn.jsdelivr.net/npm/@scalar/api-reference\"></script>
  </body>
</html>`;

  return c.html(html, 200);
});

export { app };
