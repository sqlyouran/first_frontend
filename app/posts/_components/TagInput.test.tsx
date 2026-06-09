import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TagInput } from "./TagInput";

describe("TagInput", () => {
  it("adds tag on Enter", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagInput value={[]} onChange={onChange} />);

    const input = screen.getByPlaceholderText(/输入标签/);
    await user.type(input, "travel{enter}");

    expect(onChange).toHaveBeenCalledWith(["travel"]);
  });

  it("removes tag when X is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagInput value={["travel", "food"]} onChange={onChange} />);

    const removeButtons = screen.getAllByRole("button");
    await user.click(removeButtons[0]);

    expect(onChange).toHaveBeenCalledWith(["food"]);
  });

  it("does not add duplicate tags", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagInput value={["travel"]} onChange={onChange} />);

    const input = screen.getByPlaceholderText(/输入标签/);
    await user.type(input, "travel{enter}");

    // onChange should not be called with duplicate
    expect(onChange).not.toHaveBeenCalled();
  });

  it("disables input at max tags", () => {
    const tags = Array.from({ length: 10 }, (_, i) => `tag${i}`);
    render(<TagInput value={tags} onChange={vi.fn()} />);

    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
  });

  it("shows tag count", () => {
    render(<TagInput value={["a", "b"]} onChange={vi.fn()} />);

    expect(screen.getByText("2 / 10 个标签，每个最多 30 字符")).toBeInTheDocument();
  });
});
