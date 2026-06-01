import { TaskStatus } from "../types";

const CONFIG: Record<TaskStatus, { label: string; className: string }> = {
  todo: { label: "To Do", className: "status-badge status-badge--todo" },
  in_progress: { label: "In Progress", className: "status-badge status-badge--in-progress" },
  completed: { label: "Completed", className: "status-badge status-badge--completed" },
};

interface Props {
  status: TaskStatus;
}

export function StatusBadge({ status }: Props) {
  const { label, className } = CONFIG[status];
  return <span className={className}>{label}</span>;
}
