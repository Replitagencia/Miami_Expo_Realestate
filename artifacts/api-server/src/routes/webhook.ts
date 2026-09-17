import { Router, type IRouter } from "express";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.post("/webhook/whapi", async (req, res): Promise<void> => {
  try {
    const body = req.body;

    if (!body || !body.messages) {
      res.status(200).json({ status: "ok" });
      return;
    }

    for (const message of body.messages) {
      const from = message.from || message.chat_id || "unknown";
      const text = message.text?.body || message.text || "";
      const type = message.type || "unknown";
      const timestamp = message.timestamp || Date.now();

      logger.info({
        event: "whapi_message",
        from,
        type,
        text: text.substring(0, 200),
        timestamp,
        messageId: message.id,
      }, `WhatsApp message received from ${from}`);
    }

    res.status(200).json({ status: "ok" });
  } catch (err) {
    logger.error({ err }, "Error processing WHAPI webhook");
    res.status(200).json({ status: "ok" });
  }
});

router.get("/webhook/whapi", (_req, res): void => {
  res.status(200).json({ status: "active", service: "whapi-webhook" });
});

export default router;
