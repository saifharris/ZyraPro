import express from "express";
import cors from "cors";
import { requestIdMiddleware } from "./middleware/requestId";
import { httpLogger } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";
import studentRoutes from "./routes/students";
import taskRoutes from "./routes/tasks";

const app = express();

// requestId must come before httpLogger so genReqId can read req.requestId
app.use(requestIdMiddleware);
app.use(httpLogger);
app.use(cors());
app.use(express.json());

app.use("/students", studentRoutes);
app.use("/tasks", taskRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(errorHandler);

export default app;
