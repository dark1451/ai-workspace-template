import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import { describe, it, expect } from "vitest";
import { App } from "./App";

describe("App", () => {
  it("홈 페이지를 렌더링한다", () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );
    expect(screen.getByText("AI Workspace")).toBeInTheDocument();
  });
});
