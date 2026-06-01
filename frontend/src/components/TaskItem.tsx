import { useState } from "react";
import { Task, TaskStatus } from "../types";
import { PriorityBadge } from "./PriorityBadge";
import { StatusBadge } from "./StatusBadge";

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

interface Props {
  task: Task;
  onStatusChange: (taskId: string, status: TaskStatus) => Promise<void>;
}

export function TaskItem({ task, onStatusChange }: Props) {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOverdue =
    task.status !== "completed" && new Date(task.dueDate) < new Date();

  async function handleStatusChange(status: TaskStatus) {
    if (status === task.status) return;
    setUpdating(true);
    setError(null);
    try {
      await onStatusChange(task.id, status);
    } catch {
      setError("Failed to update status");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className={`task-item ${isOverdue ? "task-item--overdue" : ""} ${task.status === "completed" ? "task-item--completed" : ""}`}>
      <div className="task-item__top">
        <div className="task-item__badges">
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
          {isOverdue && <span className="badge badge--overdue">Overdue</span>}
        </div>
        <span className="task-item__due">
          Due {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      </div>

      <h4 className="task-item__title">{task.title}</h4>
      <p className="task-item__description">{task.description}</p>

      <div className="task-item__footer">
        <div className="task-item__status-control">
          <label className="task-item__status-label">Status:</label>
          <select
            className="task-item__select"
            value={task.status}
            disabled={updating}
            onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {updating && <span className="task-item__updating">Saving...</span>}
        </div>
        {error && <span className="task-item__error">{error}</span>}
      </div>
    </div>
  );
}
