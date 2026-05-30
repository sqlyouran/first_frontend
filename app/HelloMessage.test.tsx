import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HelloMessage from "./HelloMessage";

describe("HelloMessage", () => {
  it("renders hello message from backend", () => {
    render(<HelloMessage message="hello" />);

    // 断言页面上出现 "hello"
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("hello");
  });
});
