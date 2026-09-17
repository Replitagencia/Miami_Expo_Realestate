import { Router, type IRouter } from "express";
import multer from "multer";
import sharp from "sharp";
import { db, siteSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UploadSettingImageResponse } from "@workspace/api-zod";
import { authMiddleware } from "../middlewares/auth";
import { ObjectStorageService } from "../lib/objectStorage";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const router: IRouter = Router();

const sizeMap: Record<string, { width: number; height: number }> = {
  hero_image: { width: 1920, height: 1080 },
  hero_image_mobile: { width: 828, height: 1400 },
  hero_image_2: { width: 1920, height: 1080 },
  hero_image_2_mobile: { width: 828, height: 1400 },
  hero_image_3: { width: 1920, height: 1080 },
  hero_image_3_mobile: { width: 828, height: 1400 },
  scene_1_image: { width: 800, height: 500 },
  scene_2_image: { width: 800, height: 500 },
  scene_3_image: { width: 800, height: 500 },
  scene_4_image: { width: 800, height: 500 },
  about_image: { width: 800, height: 1000 },
  agency_image: { width: 1600, height: 700 },
  logo: { width: 400, height: 120 },
  team_1_image: { width: 600, height: 800 },
  team_2_image: { width: 600, height: 800 },
  team_3_image: { width: 600, height: 800 },
  banner_strip_image: { width: 1920, height: 600 },
  banner_strip_image_mobile: { width: 828, height: 400 },
  sima_bg_image: { width: 1920, height: 700 },
  sima_bg_image_mobile: { width: 828, height: 500 },
  og_image: { width: 1200, height: 630 },
};

router.post("/admin/settings/image", authMiddleware, upload.single("image"), async (req, res): Promise<void> => {
  const key = req.body?.key;
  if (!key || !req.file) {
    res.status(400).json({ error: "Missing key or image file" });
    return;
  }

  const [existing] = await db
    .select()
    .from(siteSettingsTable)
    .where(eq(siteSettingsTable.key, key));

  if (!existing || existing.type !== "image") {
    res.status(404).json({ error: "Image setting not found" });
    return;
  }

  const dims = sizeMap[key] || { width: 800, height: 600 };
  const isLogo = key === "logo";

  let processedBuffer: Buffer;
  if (isLogo) {
    processedBuffer = await sharp(req.file.buffer)
      .resize(dims.width, dims.height, { fit: "inside", withoutEnlargement: true })
      .png({ quality: 90 })
      .toBuffer();
  } else {
    processedBuffer = await sharp(req.file.buffer)
      .resize(dims.width, dims.height, { fit: "cover" })
      .jpeg({ quality: 85 })
      .toBuffer();
  }

  const storage = new ObjectStorageService();
  const uploadUrl = await storage.getObjectEntityUploadURL();

  const contentType = isLogo ? "image/png" : "image/jpeg";
  await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: processedBuffer,
  });

  const objectPath = storage.normalizeObjectEntityPath(uploadUrl);

  const [updated] = await db
    .update(siteSettingsTable)
    .set({ value: objectPath })
    .where(eq(siteSettingsTable.key, key))
    .returning();

  res.json(UploadSettingImageResponse.parse(updated));
});

export default router;
