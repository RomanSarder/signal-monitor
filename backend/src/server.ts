import Fastify from "fastify";
import { config } from "dotenv";

config();

const app = Fastify({ logger: true });

app.get("/health", async () => ({ status: "ok" }));

app.listen(
  { port: Number(process.env.PORT) || 3000, host: "0.0.0.0" },
  (err) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
  },
);
