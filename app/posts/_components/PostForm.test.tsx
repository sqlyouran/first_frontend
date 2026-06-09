import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PostForm } from "./PostForm";

// Mock dynamic import for MDEditor
vi.mock("next/dynamic", () => ({
  default: () => {
    return function MockMDEditor({ value, onChange }: { value: string; onChange: (v: string | undefined) => void }) {
      return (
        <textarea
          data-testid="md-editor"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    };
  },
}));

describe("PostForm", () => {
  it("renders all form fields", () => {
    render(<PostForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/标题/)).toBeInTheDocument();
    expect(screen.getByText(/正文/)).toBeInTheDocument();
    expect(screen.getByLabelText(/封面图/)).toBeInTheDocument();
    expect(screen.getAllByText(/标签/).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/状态/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /发布/ })).toBeInTheDocument();
  });

  it("shows validation error when title is empty", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<PostForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: /发布/ }));

    expect(screen.getByText("标题不能为空")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows validation error when content is empty", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<PostForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/标题/), "My Title");
    await user.click(screen.getByRole("button", { name: /发布/ }));

    expect(screen.getByText("正文不能为空")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("calls onSubmit with form data when valid", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<PostForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/标题/), "My Post");

    const editor = screen.getByTestId("md-editor");
    await user.type(editor, "# Hello World");

    await user.click(screen.getByRole("button", { name: /发布帖子/ }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "My Post",
        content: "# Hello World",
        status: "published",
      })
    );
  });

  it("shows submitting state", () => {
    render(<PostForm onSubmit={vi.fn()} isSubmitting />);

    const button = screen.getByRole("button", { name: /发布中/ });
    expect(button).toBeDisabled();
  });
});
