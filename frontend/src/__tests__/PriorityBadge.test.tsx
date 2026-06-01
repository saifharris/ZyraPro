import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PriorityBadge } from "../components/PriorityBadge";
import { TaskPriority } from "../types";

const cases: { priority: TaskPriority; label: string }[] = [
  { priority: "urgent", label: "Urgent" },
  { priority: "high", label: "High" },
  { priority: "medium", label: "Medium" },
  { priority: "low", label: "Low" },
];

describe("PriorityBadge", () => {
  it.each(cases)("renders '$label' for priority '$priority'", ({ priority, label }) => {
    render(<PriorityBadge priority={priority} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("applies the correct CSS class for urgent priority", () => {
    render(<PriorityBadge priority="urgent" />);
    expect(screen.getByText("Urgent")).toHaveClass("badge--urgent");
  });

  it("applies the correct CSS class for low priority", () => {
    render(<PriorityBadge priority="low" />);
    expect(screen.getByText("Low")).toHaveClass("badge--low");
  });
});
