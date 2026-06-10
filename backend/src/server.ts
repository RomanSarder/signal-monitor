import Fastify from "fastify";
import { config } from "dotenv";
import app from "./app";

config();

const server = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
      options: { colorize: true },
    },
  },
});

server.register(app);

server.listen(
  { port: Number(process.env.PORT) || 3000, host: "0.0.0.0" },
  (err) => {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }
  },
);
