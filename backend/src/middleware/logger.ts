import pinoHttp from "pino-http";
import { IncomingMessage } from "http";
import { Request } from "express";

export const httpLogger = pinoHttp({
  // Respect LOG_LEVEL env var — set to "silent" in tests
  level: process.env["LOG_LEVEL"] ?? "info",
  // Use the requestId already set by requestIdMiddleware
  genReqId: (req: IncomingMessage) => (req as Request).requestId,
  // Redact auth tokens from logs
  redact: ["req.headers.authorization", "req.headers.cookie"],
  customLogLevel: (_req, res) => {
    if (res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  serializers: {
    req(req) {
      return { id: req.id, method: req.method, url: req.url };
    },
  },
});
