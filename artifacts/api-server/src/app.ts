import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { existsSync } from "node:fs";
import path from "node:path";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// In production, App Platform runs the API and the compiled Vite site in the
// same service. Keeping them together means browser requests to /api keep the
// same origin as the public website, with no proxy or CORS configuration.
const frontendDirectory = path.resolve(
  process.cwd(),
  "artifacts/expo-miami/dist/public",
);

if (process.env["NODE_ENV"] === "production" && existsSync(frontendDirectory)) {
  app.use(express.static(frontendDirectory));
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api/")) {
      next();
      return;
    }

    res.sendFile(path.join(frontendDirectory, "index.html"), (err) => {
      if (err) {
        next(err);
      }
    });
  });
} else if (process.env["NODE_ENV"] === "production") {
  logger.warn(
    { frontendDirectory },
    "Frontend build was not found; only API routes will be served",
  );
}

export default app;
