import { useActionCenter } from "../hooks/useActionCenter";
import { StudentProfile } from "../components/StudentProfile";
import { TaskList } from "../components/TaskList";
import { MessageList } from "../components/MessageList";

interface Props {
  studentId: string;
}

export function ActionCenter({ studentId }: Props) {
  const { data, loading, error, updateTaskStatus, refetch } = useActionCenter(studentId);

  if (loading) {
    return (
      <div className="state-container">
        <div className="spinner" aria-label="Loading" />
        <p className="state-container__text">Loading action center...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-container state-container--error">
        <p className="state-container__text">Failed to load: {error}</p>
        <button className="btn btn--secondary" onClick={refetch}>
          Try again
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="action-center">
      <StudentProfile
        student={data.student}
        taskSummary={data.taskSummary}
        unreadCount={data.messages.unreadCount}
        urgencyLevel={data.urgencyLevel}
      />
      <div className="action-center__content">
        <TaskList tasks={data.tasks} onStatusChange={updateTaskStatus} />
        <MessageList
          messages={data.messages.items}
          unreadCount={data.messages.unreadCount}
        />
      </div>
    </div>
  );
}
