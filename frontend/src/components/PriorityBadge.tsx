import { TaskPriority } from "../types";

const CONFIG: Record<TaskPriority, { label: string; className: string }> = {
  urgent: { label: "Urgent", className: "badge badge--urgent" },
  high: { label: "High", className: "badge badge--high" },
  medium: { label: "Medium", className: "badge badge--medium" },
  low: { label: "Low", className: "badge badge--low" },
};

interface Props {
  priority: TaskPriority;
}

export function PriorityBadge({ priority }: Props) {
  const { label, className } = CONFIG[priority];
  return <span className={className}>{label}</span>;
}
