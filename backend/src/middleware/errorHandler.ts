import { Request, Response, NextFunction } from "express";
import type {} from "pino-http"; // brings in http.IncomingMessage augmentation (req.log)

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
      requestId: req.requestId,
    });
    return;
  }

  // Log unexpected errors via the pino request logger if available
  if (req.log) {
    req.log.error({ err }, "Unhandled error");
  }

  res.status(500).json({
    error: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
    requestId: req.requestId,
  });
}
