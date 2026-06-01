import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { UrgencyBanner } from "../components/UrgencyBanner";
import { UrgencyLevel } from "../types";

const cases: { level: UrgencyLevel; label: string }[] = [
  { level: "critical", label: "Critical" },
  { level: "high", label: "High Priority" },
  { level: "medium", label: "Needs Attention" },
  { level: "low", label: "On Track" },
];

describe("UrgencyBanner", () => {
  it.each(cases)("displays '$label' for level '$level'", ({ level, label }) => {
    render(<UrgencyBanner level={level} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("applies the critical modifier class for critical level", () => {
    const { container } = render(<UrgencyBanner level="critical" />);
    expect(container.firstChild).toHaveClass("urgency-banner--critical");
  });

  it("applies the low modifier class for low level", () => {
    const { container } = render(<UrgencyBanner level="low" />);
    expect(container.firstChild).toHaveClass("urgency-banner--low");
  });
});
