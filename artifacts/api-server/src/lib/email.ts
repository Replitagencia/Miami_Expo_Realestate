import nodemailer from "nodemailer";
import type { Lead } from "@workspace/db";
import { db, siteSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

const FALLBACK_NOTIFY_TO = [
  "contacto@expomiamirealestate.com",
  "avelino@agencialabs.cl",
  "miriamdtoprealtor@gmail.com",
];
const ADMIN_URL = "https://www.expomiamirealestate.com/admin/leads";

async function getNotifyRecipients(): Promise<string[]> {
  try {
    const [row] = await db
      .select()
      .from(siteSettingsTable)
      .where(eq(siteSettingsTable.key, "notification_emails"));
    if (row?.value) {
      const parsed = row.value
        .split(",")
        .map((e) => e.trim())
        .filter((e) => e.length > 0);
      if (parsed.length > 0) return parsed;
    }
  } catch (err) {
    logger.warn({ err }, "Failed to read notification_emails from DB, using fallback recipients");
  }
  return FALLBACK_NOTIFY_TO;
}

export function isEmailConfigured(): boolean {
  return Boolean(GMAIL_USER && GMAIL_APP_PASSWORD);
}

function createTransport() {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    return null;
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });
}

const capitalLabels: Record<string, string> = {
  "50k-100k": "€50K – €100K",
  "100k-250k": "€100K – €250K",
  "250k-500k": "€250K – €500K",
  "500k-1m": "€500K – €1M",
  "1m+": "Más de €1M",
};

const stageLabels: Record<string, string> = {
  "researching": "Investigando opciones",
  "ready-6m": "Listo en 6 meses",
  "ready-now": "Listo para invertir ahora",
};

function formatDate(d: Date) {
  return d.toLocaleString("es-ES", {
    timeZone: "America/New_York",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }) + " (ET)";
}

export async function sendLeadNotification(lead: Lead): Promise<void> {
  const transport = createTransport();
  if (!transport) return;
  const NOTIFY_TO = await getNotifyRecipients();

  const name = escHtml(lead.name);
  const email = escHtml(lead.email);
  const phone = lead.phone ? escHtml(lead.phone) : null;
  const capital = lead.capitalRange ? (capitalLabels[lead.capitalRange] ?? escHtml(lead.capitalRange)) : "—";
  const stage = lead.investmentStage ? (stageLabels[lead.investmentStage] ?? escHtml(lead.investmentStage)) : "—";
  const date = formatDate(lead.createdAt);

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:4px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#0D0D0D;padding:24px 32px;border-bottom:3px solid #C9A84C;">
            <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#C9A84C;font-family:monospace;">Expo Miami Real Estate</p>
            <h1 style="margin:8px 0 0;font-size:20px;color:#ffffff;font-weight:600;">Nuevo lead recibido</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
                  <span style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;display:block;margin-bottom:4px;">Nombre</span>
                  <strong style="font-size:16px;color:#1a1a1a;">${name}</strong>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
                  <span style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;display:block;margin-bottom:4px;">Email</span>
                  <a href="mailto:${email}" style="font-size:15px;color:#C9A84C;text-decoration:none;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
                  <span style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;display:block;margin-bottom:4px;">Teléfono</span>
                  <span style="font-size:15px;color:#1a1a1a;">${phone ? `<a href="tel:${phone}" style="color:#C9A84C;text-decoration:none;">${phone}</a>` : "—"}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
                  <span style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;display:block;margin-bottom:4px;">Capital disponible</span>
                  <span style="font-size:15px;color:#1a1a1a;">${capital}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
                  <span style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;display:block;margin-bottom:4px;">Momento de inversión</span>
                  <span style="font-size:15px;color:#1a1a1a;">${stage}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;">
                  <span style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;display:block;margin-bottom:4px;">Fecha y hora</span>
                  <span style="font-size:14px;color:#555;">${date}</span>
                </td>
              </tr>
            </table>
            <div style="margin-top:28px;text-align:center;">
              <a href="${ADMIN_URL}" style="display:inline-block;background:#C9A84C;color:#0D0D0D;text-decoration:none;padding:12px 28px;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Ver en el panel de admin</a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#f8f8f8;padding:16px 32px;border-top:1px solid #eee;text-align:center;">
            <p style="margin:0;font-size:11px;color:#aaa;letter-spacing:1px;">Expo Miami Real Estate · contacto@expomiamirealestate.com</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await transport.sendMail({
    from: `"Expo Miami Real Estate" <${GMAIL_USER}>`,
    to: NOTIFY_TO.join(", "),
    subject: `Nuevo lead: ${lead.name} — ${capital}`,
    html,
  });
}

export async function sendDailyHealthCheck(leadsLast24h: number): Promise<void> {
  const transport = createTransport();
  if (!transport) return;
  const NOTIFY_TO = await getNotifyRecipients();

  const now = new Date().toLocaleString("es-ES", {
    timeZone: "America/New_York",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:24px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:4px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#0D0D0D;padding:20px 28px;border-bottom:3px solid #C9A84C;">
            <p style="margin:0;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#C9A84C;font-family:monospace;">Expo Miami Real Estate</p>
            <h1 style="margin:6px 0 0;font-size:17px;color:#fff;font-weight:600;">Verificación diaria del sistema</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:12px 16px;background:#f0faf4;border-left:4px solid #22c55e;border-radius:2px;margin-bottom:16px;">
                  <span style="font-size:14px;color:#166534;font-weight:600;">✓ Sistema de email operativo</span>
                </td>
              </tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
                  <span style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;display:block;margin-bottom:4px;">Leads recibidos (últimas 24h)</span>
                  <strong style="font-size:22px;color:#0D0D0D;">${leadsLast24h}</strong>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;">
                  <span style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;display:block;margin-bottom:4px;">Verificado el</span>
                  <span style="font-size:13px;color:#555;">${now} (ET)</span>
                </td>
              </tr>
            </table>
            <div style="margin-top:24px;text-align:center;">
              <a href="${ADMIN_URL}" style="display:inline-block;background:#C9A84C;color:#0D0D0D;text-decoration:none;padding:10px 24px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Ver panel de admin</a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#f8f8f8;padding:12px 28px;border-top:1px solid #eee;text-align:center;">
            <p style="margin:0;font-size:10px;color:#aaa;letter-spacing:1px;">Este aviso se envía automáticamente cada día a las 09:00 AM (hora de Miami)</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await transport.sendMail({
    from: `"Expo Miami Real Estate" <${GMAIL_USER}>`,
    to: NOTIFY_TO.join(", "),
    subject: `✓ Sistema operativo — ${leadsLast24h} lead${leadsLast24h !== 1 ? "s" : ""} en las últimas 24h`,
    html,
  });
}

export async function sendLeadConfirmation(lead: Lead): Promise<void> {
  const transport = createTransport();
  if (!transport) return;

  const name = escHtml(lead.name);

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0D0D0D;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0D0D;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0">
        <!-- Header -->
        <tr>
          <td style="padding-bottom:32px;text-align:center;border-bottom:1px solid #C9A84C;">
            <p style="margin:0 0 12px;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#C9A84C;font-family:monospace;">Expo Miami Real Estate</p>
            <div style="width:40px;height:1px;background:#C9A84C;margin:0 auto 20px;"></div>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px 0;text-align:center;">
            <h1 style="margin:0 0 16px;font-size:28px;color:#F5F0E8;font-style:italic;font-weight:300;line-height:1.3;">Gracias, ${name}</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#8A8680;line-height:1.7;font-family:Arial,sans-serif;font-weight:300;">
              Hemos recibido su consulta correctamente.<br>
              Nuestro equipo de especialistas en inversión<br>
              se pondrá en contacto con usted en breve.
            </p>
            <div style="width:60px;height:1px;background:#C9A84C;margin:28px auto;"></div>
            <p style="margin:0 0 8px;font-size:12px;color:#4A4540;letter-spacing:2px;text-transform:uppercase;font-family:monospace;">Miami · Florida · USA</p>
            <p style="margin:0;font-size:12px;color:#4A4540;letter-spacing:1px;font-family:monospace;">Agencia licenciada · Inversores de alto patrimonio</p>
          </td>
        </tr>
        <!-- CTA -->
        <tr>
          <td style="text-align:center;padding-bottom:40px;">
            <a href="https://www.expomiamirealestate.com" style="display:inline-block;border:1px solid #C9A84C;color:#C9A84C;text-decoration:none;padding:12px 32px;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;font-family:monospace;">Visitar nuestra web</a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding-top:24px;border-top:1px solid #1C1A18;text-align:center;">
            <p style="margin:0 0 4px;font-size:11px;color:#2A2825;letter-spacing:1px;font-family:monospace;">contacto@expomiamirealestate.com</p>
            <p style="margin:0;font-size:10px;color:#2A2825;font-family:Arial,sans-serif;">Este correo fue enviado porque completó un formulario en nuestra web.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await transport.sendMail({
    from: `"Expo Miami Real Estate" <${GMAIL_USER}>`,
    to: lead.email,
    subject: "Hemos recibido su consulta — Expo Miami Real Estate",
    html,
  });
}
