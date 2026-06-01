import { Router, Request, Response, NextFunction } from "express";
import { tasks } from "../data/mockData";
import { AppError } from "../middleware/errorHandler";
import { TaskStatus, UpdateTaskStatusBody } from "../types";

const router = Router();

const VALID_STATUSES: TaskStatus[] = ["todo", "in_progress", "completed"];

router.patch(
  "/:taskId/status",
  (req: Request, res: Response, next: NextFunction) => {
    const { taskId } = req.params;
    const { status } = req.body as UpdateTaskStatusBody;

    if (!status || !VALID_STATUSES.includes(status)) {
      return next(
        new AppError(
          400,
          "INVALID_STATUS",
          `Status must be one of: ${VALID_STATUSES.join(", ")}`
        )
      );
    }

    const taskIndex = tasks.findIndex((t) => t.id === taskId);

    if (taskIndex === -1) {
      return next(new AppError(404, "TASK_NOT_FOUND", `Task '${taskId}' not found`));
    }

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      status,
      updatedAt: new Date().toISOString(),
    };

    res.json(tasks[taskIndex]);
  }
);

export default router;
