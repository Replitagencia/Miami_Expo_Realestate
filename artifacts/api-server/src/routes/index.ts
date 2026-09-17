import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import settingsRouter from "./settings";
import settingsImageRouter from "./settingsImage";
import leadsRouter from "./leads";
import statsRouter from "./stats";
import storageRouter from "./storage";
import webhookRouter from "./webhook";
import ogRouter from "./og";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(settingsRouter);
router.use(settingsImageRouter);
router.use(leadsRouter);
router.use(statsRouter);
router.use(storageRouter);
router.use(webhookRouter);
router.use(ogRouter);

export default router;
