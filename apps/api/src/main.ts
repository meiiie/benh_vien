import { buildServer } from "./server.js";

const port = Number(process.env.PORT ?? 7310);
const app = await buildServer();

try {
  await app.listen({ host: "0.0.0.0", port });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}

