import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SendMessageButton } from "@/app/users/[username]/_components/SendMessageButton";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock("@/lib/api/messages", () => ({
  createConversation: vi.fn(),
}));

vi.mock("@/lib/stores/auth", () => ({
  useAuthStore: vi.fn(),
}));

import { createConversation } from "@/lib/api/messages";
import { useAuthStore } from "@/lib/stores/auth";

const createConversationMock = vi.mocked(createConversation);
const useAuthStoreMock = vi.mocked(useAuthStore);

describe("SendMessageButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when user is not authenticated", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useAuthStoreMock.mockImplementation(((selector: any) =>
      selector({ isAuthenticated: false, user: null })) as any);

    const { container } = render(<SendMessageButton recipientUsername="alice" />);
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when viewing own profile", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useAuthStoreMock.mockImplementation(((selector: any) =>
      selector({ isAuthenticated: true, user: { id: "u1", username: "alice" } })) as any);

    const { container } = render(<SendMessageButton recipientUsername="alice" />);
    expect(container.innerHTML).toBe("");
  });

  it("renders button when logged in and viewing other user's profile", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useAuthStoreMock.mockImplementation(((selector: any) =>
      selector({ isAuthenticated: true, user: { id: "u1", username: "bob" } })) as any);

    render(<SendMessageButton recipientUsername="alice" />);
    expect(screen.getByText("Send Message")).toBeInTheDocument();
  });

  it("navigates to conversation on successful create", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useAuthStoreMock.mockImplementation(((selector: any) =>
      selector({ isAuthenticated: true, user: { id: "u1", username: "bob" } })) as any);

    createConversationMock.mockResolvedValue({
      status: 201,
      data: { conversation_id: "conv1", message_id: "m1", request_id: "r1" },
    });

    render(<SendMessageButton recipientUsername="alice" />);

    fireEvent.click(screen.getByText("Send Message"));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/messages/conv1");
    });
  });

  it("shows error toast on API failure", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useAuthStoreMock.mockImplementation(((selector: any) =>
      selector({ isAuthenticated: true, user: { id: "u1", username: "bob" } })) as any);

    const { toast } = await import("sonner");
    createConversationMock.mockResolvedValue({
      status: 422,
      error: { request_id: "r1", error_code: "recipient_unavailable", message: "User deleted" },
    });

    render(<SendMessageButton recipientUsername="alice" />);

    fireEvent.click(screen.getByText("Send Message"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
