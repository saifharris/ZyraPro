import { Task, TaskStatus } from "../types";
import { TaskItem } from "./TaskItem";

interface Props {
  tasks: Task[];
  onStatusChange: (taskId: string, status: TaskStatus) => Promise<void>;
}

export function TaskList({ tasks, onStatusChange }: Props) {
  const active = tasks.filter((t) => t.status !== "completed");
  const completed = tasks.filter((t) => t.status === "completed");

  return (
    <section className="task-list">
      <h3 className="task-list__heading">
        Tasks
        <span className="task-list__count">{active.length} active</span>
      </h3>

      {active.length === 0 && completed.length === 0 && (
        <p className="task-list__empty">No tasks assigned.</p>
      )}

      <div className="task-list__items">
        {active.map((task) => (
          <TaskItem key={task.id} task={task} onStatusChange={onStatusChange} />
        ))}
      </div>

      {completed.length > 0 && (
        <details className="task-list__completed-group">
          <summary className="task-list__completed-summary">
            Completed ({completed.length})
          </summary>
          <div className="task-list__items task-list__items--completed">
            {completed.map((task) => (
              <TaskItem key={task.id} task={task} onStatusChange={onStatusChange} />
            ))}
          </div>
        </details>
      )}
    </section>
  );
}
