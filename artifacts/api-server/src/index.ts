import app from "./app";
import { logger } from "./lib/logger";
import { seedDatabase } from "./lib/seed";
import { schedule } from "node-cron";
import { db, leadsTable } from "@workspace/db";
import { gte, count } from "drizzle-orm";
import { sendDailyHealthCheck, isEmailConfigured } from "./lib/email";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function runDailyHealthCheck() {
  if (!isEmailConfigured()) {
    logger.info("Daily health check skipped — email credentials not configured");
    return;
  }
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [{ value }] = await db
      .select({ value: count() })
      .from(leadsTable)
      .where(gte(leadsTable.createdAt, since));
    await sendDailyHealthCheck(value);
    logger.info({ leadsLast24h: value }, "Daily health check email sent");
  } catch (err) {
    logger.error({ err }, "Error sending daily health check email");
  }
}

async function start() {
  await seedDatabase();

  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");

    schedule("0 9 * * *", runDailyHealthCheck, { timezone: "America/New_York" });
    logger.info("Daily health check scheduled at 09:00 AM ET");
  });
}

start().catch((err) => {
  logger.error({ err }, "Failed to start server");
  process.exit(1);
});
