import { Router, type IRouter } from "express";
import { db, leadsTable, siteSettingsTable } from "@workspace/db";
import { count, gte, eq, desc } from "drizzle-orm";
import { GetAdminStatsResponse } from "@workspace/api-zod";
import { authMiddleware } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/admin/stats", authMiddleware, async (_req, res): Promise<void> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalResult] = await db.select({ count: count() }).from(leadsTable);
  const [todayResult] = await db
    .select({ count: count() })
    .from(leadsTable)
    .where(gte(leadsTable.createdAt, today));

  const imageSettings = await db
    .select()
    .from(siteSettingsTable)
    .where(eq(siteSettingsTable.type, "image"));

  const imagesCount = imageSettings.filter(s => s.value && s.value.length > 0).length;

  const [lastUpdated] = await db
    .select({ updatedAt: siteSettingsTable.updatedAt })
    .from(siteSettingsTable)
    .orderBy(desc(siteSettingsTable.updatedAt))
    .limit(1);

  res.json(GetAdminStatsResponse.parse({
    leadsToday: todayResult.count,
    leadsTotal: totalResult.count,
    imagesCount,
    lastUpdate: lastUpdated?.updatedAt?.toISOString() || null,
  }));
});

export default router;
