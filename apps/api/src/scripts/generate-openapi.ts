import { app } from "../app";

const spec = app.getOpenAPI31Document({
  openapi: "3.1.0",
  info: {
    title: "SiAkad API",
    version: "1.0.0",
  },
});

console.log(JSON.stringify(spec, null, 2));
