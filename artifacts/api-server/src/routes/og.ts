import { Router, type IRouter, type Request, type Response } from "express";
import { db, siteSettingsTable } from "@workspace/db";

const router: IRouter = Router();

function escapeHtml(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function resolveAbsoluteImageUrl(value: string | null, origin: string): string | null {
  if (!value) return null;
  if (value.startsWith("/objects/")) return `${origin}/api/storage${value}`;
  if (value.startsWith("/api/storage")) return `${origin}${value}`;
  if (value.startsWith("http")) return value;
  return `${origin}${value}`;
}

/**
 * GET /og
 *
 * Returns a pre-rendered HTML page with Open Graph meta tags fetched from the DB.
 * For human visitors: includes a JS + meta-refresh redirect to the root SPA.
 * For crawler bots: they read the OG tags and stop (they ignore the redirect).
 *
 * Share /api/og instead of / when posting the site link on social platforms
 * to guarantee og:image and other tags are visible to crawlers.
 */
router.get("/og", async (req: Request, res: Response): Promise<void> => {
  try {
    const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol || "https";
    const host = (req.headers["x-forwarded-host"] as string) || req.get("host") || "";
    const origin = `${proto}://${host}`;
    const siteUrl = origin;

    const settings = await db.select().from(siteSettingsTable);
    const map: Record<string, string | null> = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }

    const title = map["og_title"] || map["site_name"] || "Expo Miami Real Estate";
    const description =
      map["og_description"] ||
      map["tagline"] ||
      "Agencia licenciada en Florida especializada en inversores de alto patrimonio.";
    const rawImage = map["og_image"];
    const absoluteImage = resolveAbsoluteImageUrl(rawImage, origin);
    const cardType = absoluteImage ? "summary_large_image" : "summary";

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.send(`<!DOCTYPE html>
<html lang="es" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${escapeHtml(siteUrl)}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  ${absoluteImage ? `<meta property="og:image" content="${escapeHtml(absoluteImage)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />` : ""}

  <!-- Twitter / X Card -->
  <meta name="twitter:card" content="${cardType}" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  ${absoluteImage ? `<meta name="twitter:image" content="${escapeHtml(absoluteImage)}" />` : ""}

  <!-- Redirect humans to the real SPA immediately -->
  <meta http-equiv="refresh" content="0; url=/" />
  <script>window.location.replace("/")</script>
</head>
<body>
  <p><a href="/">${escapeHtml(title)}</a></p>
</body>
</html>`);
  } catch (err) {
    req.log.error({ err }, "Error serving OG preview");
    res.status(500).json({ error: "Failed to generate OG preview" });
  }
});

export default router;
