import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PostDetailPage from "./page";

// Mock fetchFromBackend
vi.mock("@/lib/backend", () => ({
  fetchFromBackend: vi.fn(),
}));

// Mock notFound
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

// Mock MarkdownRenderer
vi.mock("./_components/MarkdownRenderer", () => ({
  default: ({ content }: { content: string }) => (
    <div data-testid="md-content">{content}</div>
  ),
}));

import { fetchFromBackend } from "@/lib/backend";

const fetchMock = vi.mocked(fetchFromBackend);

describe("PostDetailPage", () => {
  const params = Promise.resolve({ id: "p1" });

  it("renders post title and markdown content", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "p1",
          title: "My Post Title",
          content: "# Hello World",
          cover_image: null,
          tags: ["travel"],
          status: "published",
          author_id: "user-123",
          created_at: "2024-06-01T12:00:00Z",
          updated_at: "2024-06-01T12:00:00Z",
          request_id: "r1",
        }),
        { status: 200 }
      )
    );

    const page = await PostDetailPage({ params });
    render(page);

    expect(screen.getByText("My Post Title")).toBeInTheDocument();
    expect(screen.getByTestId("md-content")).toHaveTextContent("# Hello World");
  });

  it("calls notFound when post not found (404)", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({ error_code: "not_found", message: "Post not found" }),
        { status: 404 }
      )
    );

    await expect(PostDetailPage({ params })).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("renders tags", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "p1",
          title: "Tagged Post",
          content: "content",
          cover_image: null,
          tags: ["food", "culture"],
          status: "published",
          author_id: "user-123",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          request_id: "r1",
        }),
        { status: 200 }
      )
    );

    const page = await PostDetailPage({ params });
    render(page);

    expect(screen.getByText("food")).toBeInTheDocument();
    expect(screen.getByText("culture")).toBeInTheDocument();
  });
});
