import { AuthPayload } from "../middlewares/auth";

declare module "express" {
  interface Request {
    user?: AuthPayload;
  }
}
