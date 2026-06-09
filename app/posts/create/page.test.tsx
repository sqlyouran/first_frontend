import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreatePostPage from "./page";

// Mock next/navigation
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

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

// Mock createPost
vi.mock("@/lib/api/posts", () => ({
  createPost: vi.fn(),
}));

import { createPost } from "@/lib/api/posts";
const createPostMock = vi.mocked(createPost);

describe("CreatePostPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page title and form", () => {
    render(<CreatePostPage />);

    expect(screen.getByRole("heading", { name: "发布帖子" })).toBeInTheDocument();
    expect(screen.getByLabelText(/标题/)).toBeInTheDocument();
  });

  it("has back link to posts list", () => {
    render(<CreatePostPage />);

    const backLink = screen.getByRole("link", { name: /返回/ });
    expect(backLink).toHaveAttribute("href", "/posts");
  });

  it("navigates to post detail on successful submit", async () => {
    const user = userEvent.setup();
    createPostMock.mockResolvedValue({
      status: 201,
      data: {
        id: "new-post-id",
        title: "New Post",
        content: "# Hello",
        cover_image: null,
        tags: [],
        status: "published",
        author_id: "u1",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        request_id: "r1",
      },
    });

    render(<CreatePostPage />);

    await user.type(screen.getByLabelText(/标题/), "New Post");
    const editor = screen.getByTestId("md-editor");
    await user.type(editor, "# Hello");

    await user.click(screen.getByRole("button", { name: /发布帖子/ }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/posts/new-post-id");
    });
  });

  it("shows error message on API failure", async () => {
    const user = userEvent.setup();
    createPostMock.mockResolvedValue({
      status: 422,
      error: {
        request_id: "r1",
        error_code: "validation_error",
        message: "Title already exists",
      },
    });

    render(<CreatePostPage />);

    await user.type(screen.getByLabelText(/标题/), "Duplicate Post");
    const editor = screen.getByTestId("md-editor");
    await user.type(editor, "Some content");

    await user.click(screen.getByRole("button", { name: /发布帖子/ }));

    await waitFor(() => {
      expect(screen.getByText("Title already exists")).toBeInTheDocument();
    });
  });
});
