import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import HomePage from "@/app/page";

describe("HomePage", () => {
  it("홈 페이지를 렌더링한다", () => {
    render(<HomePage />);
    expect(screen.getByText("AI Workspace")).toBeInTheDocument();
  });
});
