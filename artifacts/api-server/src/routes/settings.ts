import { Router, type IRouter } from "express";
import { db, siteSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  GetAdminSettingsResponse,
  UpdateSettingBody,
  UpdateSettingResponse,
} from "@workspace/api-zod";
import { authMiddleware } from "../middlewares/auth";

const router: IRouter = Router();

function resolveImageValue(value: string | null, type: string): string | null {
  if (!value || type !== "image") return value;
  if (value.startsWith("/objects/")) {
    return `/api/storage${value}`;
  }
  return value;
}

router.get("/settings", async (_req, res): Promise<void> => {
  const settings = await db.select().from(siteSettingsTable);

  const grouped: Record<string, Record<string, string | null>> = {};
  for (const s of settings) {
    if (!grouped[s.section]) grouped[s.section] = {};
    grouped[s.section][s.key] = resolveImageValue(s.value, s.type);
  }

  res.json(grouped);
});

router.get("/admin/settings", authMiddleware, async (_req, res): Promise<void> => {
  const settings = await db.select().from(siteSettingsTable);
  res.json(GetAdminSettingsResponse.parse(settings));
});

router.put("/admin/settings", authMiddleware, async (req, res): Promise<void> => {
  const parsed = UpdateSettingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { key, value } = parsed.data;

  const [existing] = await db
    .select()
    .from(siteSettingsTable)
    .where(eq(siteSettingsTable.key, key));

  if (!existing) {
    res.status(404).json({ error: "Setting not found" });
    return;
  }

  const [updated] = await db
    .update(siteSettingsTable)
    .set({ value })
    .where(eq(siteSettingsTable.key, key))
    .returning();

  res.json(UpdateSettingResponse.parse(updated));
});

export default router;
