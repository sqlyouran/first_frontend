import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/app/(auth)/login/page";
import { useAuthStore } from "@/lib/stores/auth";

// Mock next/navigation
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

// Mock auth API
vi.mock("@/lib/api/auth", () => ({
  login: vi.fn(),
  refreshToken: vi.fn().mockResolvedValue({ status: 401 }),
  fetchMe: vi.fn().mockResolvedValue({ status: 200, data: { id: "1", email: "test@example.com", state: "active", created_at: "2024-01-01", request_id: "r1" } }),
  logout: vi.fn().mockResolvedValue({ status: 204 }),
}));

import { login } from "@/lib/api/auth";
const loginMock = vi.mocked(login);

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ accessToken: null, user: null, isAuthenticated: false, isInitialized: true });
  });

  it("shows validation errors when submitting empty form", async () => {
    render(<LoginPage />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "登录" }));

    expect(screen.getByText("请输入有效的邮箱地址")).toBeInTheDocument();
    expect(screen.getByText("请输入密码")).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("shows validation error for invalid email", async () => {
    render(<LoginPage />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText("邮箱"), "not-an-email");
    await user.type(screen.getByPlaceholderText("密码"), "password123");
    await user.click(screen.getByRole("button", { name: "登录" }));

    expect(screen.getByText("请输入有效的邮箱地址")).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("calls login API and redirects on success", async () => {
    loginMock.mockResolvedValue({ status: 200, data: { access_token: "token123", expires_in: 1800, request_id: "r1" } });
    render(<LoginPage />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText("邮箱"), "test@example.com");
    await user.type(screen.getByPlaceholderText("密码"), "password123");
    await user.click(screen.getByRole("button", { name: "登录" }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/");
    });
    expect(useAuthStore.getState().accessToken).toBe("token123");
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it("shows error for 401 (invalid credentials)", async () => {
    loginMock.mockResolvedValue({ status: 401, error: { request_id: "r1", error_code: "invalid_credentials", message: "Bad creds" } });
    render(<LoginPage />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText("邮箱"), "wrong@example.com");
    await user.type(screen.getByPlaceholderText("密码"), "wrongpass");
    await user.click(screen.getByRole("button", { name: "登录" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("邮箱或密码错误");
    });
  });

  it("shows error for 423 (account locked)", async () => {
    const futureTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    loginMock.mockResolvedValue({ status: 423, error: { request_id: "r1", error_code: "account_locked", message: "Locked", details: { locked_until: futureTime } } });
    render(<LoginPage />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText("邮箱"), "locked@example.com");
    await user.type(screen.getByPlaceholderText("密码"), "any");
    await user.click(screen.getByRole("button", { name: "登录" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("账户已锁定");
    });
  });

  it("shows error for 403 (email unverified)", async () => {
    loginMock.mockResolvedValue({ status: 403, error: { request_id: "r1", error_code: "email_unverified", message: "Unverified" } });
    render(<LoginPage />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText("邮箱"), "unverified@example.com");
    await user.type(screen.getByPlaceholderText("密码"), "any");
    await user.click(screen.getByRole("button", { name: "登录" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("邮箱未验证");
    });
  });

  it("shows error for 429 (rate limited)", async () => {
    loginMock.mockResolvedValue({ status: 429, error: { request_id: "r1", error_code: "rate_limited", message: "Too many" } });
    render(<LoginPage />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText("邮箱"), "ratelimit@example.com");
    await user.type(screen.getByPlaceholderText("密码"), "any");
    await user.click(screen.getByRole("button", { name: "登录" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("请求过于频繁");
    });
  });

  it("shows error for network failure", async () => {
    loginMock.mockResolvedValue({ status: 0, error: { request_id: "unknown", error_code: "network_error", message: "Network failed" } });
    render(<LoginPage />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText("邮箱"), "test@example.com");
    await user.type(screen.getByPlaceholderText("密码"), "password123");
    await user.click(screen.getByRole("button", { name: "登录" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("网络连接失败");
    });
  });

  it("shows loading state during submission", async () => {
    loginMock.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({ status: 200, data: { access_token: "t", expires_in: 1800, request_id: "r1" } }), 200)));
    render(<LoginPage />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText("邮箱"), "test@example.com");
    await user.type(screen.getByPlaceholderText("密码"), "password123");
    await user.click(screen.getByRole("button", { name: "登录" }));

    expect(screen.getByRole("button", { name: "登录中..." })).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "登录" })).not.toBeDisabled();
    });
  });

  it("has a link to register page", () => {
    render(<LoginPage />);
    const link = screen.getByRole("link", { name: "去注册" });
    expect(link).toHaveAttribute("href", "/register");
  });
});
