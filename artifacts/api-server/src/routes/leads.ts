import { Router, type IRouter } from "express";
import { db, leadsTable } from "@workspace/db";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import {
  CreateLeadBody,
  GetAdminLeadsQueryParams,
  GetAdminLeadsResponse,
  ExportLeadsCsvQueryParams,
} from "@workspace/api-zod";
import { authMiddleware } from "../middlewares/auth";
import { sendLeadNotification, sendLeadConfirmation } from "../lib/email";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.post("/leads", async (req, res): Promise<void> => {
  const parsed = CreateLeadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [lead] = await db.insert(leadsTable).values({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    capitalRange: parsed.data.capitalRange || null,
    investmentStage: parsed.data.investmentStage || null,
    source: "website-contact-form",
  }).returning();

  res.status(201).json(lead);

  Promise.all([
    sendLeadNotification(lead),
    sendLeadConfirmation(lead),
  ]).catch((err) => {
    logger.error({ err }, "Error sending lead emails");
  });
});

router.get("/admin/leads", authMiddleware, async (req, res): Promise<void> => {
  const params = GetAdminLeadsQueryParams.safeParse(req.query);
  const filters = params.success ? params.data : {};

  const conditions = [];
  if (filters.capitalRange) {
    conditions.push(eq(leadsTable.capitalRange, filters.capitalRange));
  }
  if (filters.dateFrom) {
    conditions.push(gte(leadsTable.createdAt, new Date(filters.dateFrom)));
  }
  if (filters.dateTo) {
    conditions.push(lte(leadsTable.createdAt, new Date(filters.dateTo)));
  }

  const leads = await db
    .select()
    .from(leadsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(leadsTable.createdAt));

  res.json(GetAdminLeadsResponse.parse(leads));
});

router.get("/admin/leads/export", authMiddleware, async (req, res): Promise<void> => {
  const params = ExportLeadsCsvQueryParams.safeParse(req.query);
  const filters = params.success ? params.data : {};

  const conditions = [];
  if (filters.capitalRange) {
    conditions.push(eq(leadsTable.capitalRange, filters.capitalRange));
  }
  if (filters.dateFrom) {
    conditions.push(gte(leadsTable.createdAt, new Date(filters.dateFrom)));
  }
  if (filters.dateTo) {
    conditions.push(lte(leadsTable.createdAt, new Date(filters.dateTo)));
  }

  const leads = await db
    .select()
    .from(leadsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(leadsTable.createdAt));

  const header = "Nombre,Email,Telefono,Capital,Momento,Fuente,Fecha\n";
  const rows = leads.map(l =>
    [l.name, l.email, l.phone || "", l.capitalRange || "", l.investmentStage || "", l.source, l.createdAt.toISOString()]
      .map(v => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  ).join("\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=leads.csv");
  res.send(header + rows);
});

export default router;
