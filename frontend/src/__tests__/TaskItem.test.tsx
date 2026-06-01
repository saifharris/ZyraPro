import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { TaskItem } from "../components/TaskItem";
import { Task, TaskStatus } from "../types";

type StatusChangeFn = (taskId: string, status: TaskStatus) => Promise<void>;

const baseTask: Task = {
  id: "tsk_001",
  studentId: "stu_001",
  title: "Submit FAFSA application",
  description: "Deadline is approaching. Student has not started the form.",
  status: "todo",
  priority: "urgent",
  dueDate: "2099-12-31",
  createdAt: "2026-05-13T14:00:00Z",
  updatedAt: "2026-05-13T14:00:00Z",
};

const overdueTask: Task = {
  ...baseTask,
  id: "tsk_overdue",
  dueDate: "2020-01-01",
};

describe("TaskItem", () => {
  let onStatusChange: Mock<StatusChangeFn>;

  beforeEach(() => {
    onStatusChange = vi.fn<StatusChangeFn>().mockResolvedValue(undefined);
  });

  it("renders the task title and description", () => {
    render(<TaskItem task={baseTask} onStatusChange={onStatusChange} />);

    expect(screen.getByText("Submit FAFSA application")).toBeInTheDocument();
    expect(screen.getByText(/Deadline is approaching/)).toBeInTheDocument();
  });

  it("renders the priority and status badges", () => {
    render(<TaskItem task={baseTask} onStatusChange={onStatusChange} />);

    expect(screen.getByText("Urgent")).toBeInTheDocument();
    // "To Do" also appears as an <option> inside the select, so narrow to the badge span
    expect(screen.getByText("To Do", { selector: "span" })).toHaveClass("status-badge--todo");
  });

  it("does not show the Overdue badge for a future due date", () => {
    render(<TaskItem task={baseTask} onStatusChange={onStatusChange} />);

    expect(screen.queryByText("Overdue")).not.toBeInTheDocument();
  });

  it("shows the Overdue badge when the due date is in the past", () => {
    render(<TaskItem task={overdueTask} onStatusChange={onStatusChange} />);

    expect(screen.getByText("Overdue")).toBeInTheDocument();
  });

  it("calls onStatusChange with the task id and new status on select change", async () => {
    render(<TaskItem task={baseTask} onStatusChange={onStatusChange} />);

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "in_progress" } });

    await waitFor(() => expect(onStatusChange).toHaveBeenCalledWith("tsk_001", "in_progress"));
  });

  it("does not call onStatusChange when the same status is selected", () => {
    render(<TaskItem task={baseTask} onStatusChange={onStatusChange} />);

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "todo" } });

    expect(onStatusChange).not.toHaveBeenCalled();
  });

  it("shows saving indicator while the update is in flight", async () => {
    let resolve!: () => void;
    onStatusChange.mockImplementation(() => new Promise<void>((r) => { resolve = r; }));

    render(<TaskItem task={baseTask} onStatusChange={onStatusChange} />);

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "completed" } });

    expect(screen.getByText("Saving...")).toBeInTheDocument();
    expect(select).toBeDisabled();

    resolve();
    await waitFor(() => expect(screen.queryByText("Saving...")).not.toBeInTheDocument());
  });

  it("shows an error message when onStatusChange rejects", async () => {
    onStatusChange.mockRejectedValue(new Error("network error"));

    render(<TaskItem task={baseTask} onStatusChange={onStatusChange} />);

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "completed" } });

    await waitFor(() =>
      expect(screen.getByText("Failed to update status")).toBeInTheDocument()
    );
  });
});
