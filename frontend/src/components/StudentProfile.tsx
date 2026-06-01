import { Student, TaskSummary, UrgencyLevel } from "../types";
import { UrgencyBanner } from "./UrgencyBanner";

interface Props {
  student: Student;
  taskSummary: TaskSummary;
  unreadCount: number;
  urgencyLevel: UrgencyLevel;
}

const ENROLLMENT_LABELS: Record<string, string> = {
  active: "Active",
  at_risk: "At Risk",
  inactive: "Inactive",
};

export function StudentProfile({ student, taskSummary, unreadCount, urgencyLevel }: Props) {
  return (
    <div className="student-profile">
      <div className="student-profile__header">
        <div className="student-profile__avatar">
          {student.name.charAt(0)}
        </div>
        <div className="student-profile__info">
          <h2 className="student-profile__name">{student.name}</h2>
          <p className="student-profile__meta">
            Grade {student.grade} &bull; {student.email}
          </p>
          <div className="student-profile__tags">
            <span className={`enrollment-badge enrollment-badge--${student.enrollmentStatus}`}>
              {ENROLLMENT_LABELS[student.enrollmentStatus] ?? student.enrollmentStatus}
            </span>
            <span className="gpa-badge">GPA {student.gpa.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <UrgencyBanner level={urgencyLevel} />

      <div className="student-profile__stats">
        <div className="stat-card">
          <span className="stat-card__value">{taskSummary.pending}</span>
          <span className="stat-card__label">Pending Tasks</span>
        </div>
        <div className="stat-card stat-card--urgent">
          <span className="stat-card__value">{taskSummary.urgent}</span>
          <span className="stat-card__label">Urgent</span>
        </div>
        <div className="stat-card stat-card--overdue">
          <span className="stat-card__value">{taskSummary.overdue}</span>
          <span className="stat-card__label">Overdue</span>
        </div>
        <div className="stat-card stat-card--messages">
          <span className="stat-card__value">{unreadCount}</span>
          <span className="stat-card__label">Unread Messages</span>
        </div>
        <div className="stat-card stat-card--completed">
          <span className="stat-card__value">{taskSummary.completed}</span>
          <span className="stat-card__label">Completed</span>
        </div>
      </div>
    </div>
  );
}
