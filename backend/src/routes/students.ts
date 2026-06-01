import { Router, Request, Response, NextFunction } from "express";
import { students, tasks, messages } from "../data/mockData";
import { AppError } from "../middleware/errorHandler";
import { ActionCenterResponse, UrgencyLevel, TaskPriority } from "../types";

const router = Router();

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

function computeUrgencyLevel(studentId: string): UrgencyLevel {
  const today = new Date();
  const activeTasks = tasks.filter(
    (t) => t.studentId === studentId && t.status !== "completed"
  );

  const hasOverdueUrgent = activeTasks.some(
    (t) => t.priority === "urgent" && new Date(t.dueDate) < today
  );
  if (hasOverdueUrgent) return "critical";

  const hasUrgent = activeTasks.some((t) => t.priority === "urgent");
  if (hasUrgent) return "high";

  const hasHighPriority = activeTasks.some((t) => t.priority === "high");
  if (hasHighPriority) return "medium";

  return "low";
}

router.get(
  "/:id/action-center",
  (req: Request, res: Response, next: NextFunction) => {
    const student = students.find((s) => s.id === req.params.id);

    if (!student) {
      return next(new AppError(404, "STUDENT_NOT_FOUND", `Student '${req.params.id}' not found`));
    }

    const studentTasks = tasks
      .filter((t) => t.studentId === student.id)
      .sort((a, b) => PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]);

    const studentMessages = messages.filter((m) => m.studentId === student.id);
    const unreadCount = studentMessages.filter((m) => !m.read).length;

    const today = new Date();
    const activeTasks = studentTasks.filter((t) => t.status !== "completed");

    const taskSummary = {
      total: studentTasks.length,
      pending: activeTasks.length,
      completed: studentTasks.filter((t) => t.status === "completed").length,
      urgent: activeTasks.filter((t) => t.priority === "urgent").length,
      overdue: activeTasks.filter((t) => new Date(t.dueDate) < today).length,
    };

    const response: ActionCenterResponse = {
      student,
      tasks: studentTasks,
      messages: {
        items: studentMessages.sort(
          (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
        ),
        unreadCount,
      },
      urgencyLevel: computeUrgencyLevel(student.id),
      taskSummary,
    };

    res.json(response);
  }
);

export default router;
