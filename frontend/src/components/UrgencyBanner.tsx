import { UrgencyLevel } from "../types";

const CONFIG: Record<UrgencyLevel, { label: string; description: string; className: string }> = {
  critical: {
    label: "Critical",
    description: "Overdue urgent tasks require immediate attention",
    className: "urgency-banner urgency-banner--critical",
  },
  high: {
    label: "High Priority",
    description: "Urgent tasks are pending action",
    className: "urgency-banner urgency-banner--high",
  },
  medium: {
    label: "Needs Attention",
    description: "High priority tasks require follow-up",
    className: "urgency-banner urgency-banner--medium",
  },
  low: {
    label: "On Track",
    description: "No critical tasks pending",
    className: "urgency-banner urgency-banner--low",
  },
};

interface Props {
  level: UrgencyLevel;
}

export function UrgencyBanner({ level }: Props) {
  const { label, description, className } = CONFIG[level];
  return (
    <div className={className}>
      <span className="urgency-banner__label">{label}</span>
      <span className="urgency-banner__description">{description}</span>
    </div>
  );
}
