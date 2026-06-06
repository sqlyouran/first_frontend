import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterPage from "@/app/(auth)/register/page";

// Mock next/navigation
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

// Mock auth API
vi.mock("@/lib/api/auth", () => ({
  sendCode: vi.fn(),
  register: vi.fn(),
}));

import { sendCode, register } from "@/lib/api/auth";
const sendCodeMock = vi.mocked(sendCode);
const registerMock = vi.mocked(register);

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Step 1: Send Code", () => {
    it("shows validation error for invalid email", async () => {
      render(<RegisterPage />);
      const user = userEvent.setup();

      await user.click(screen.getByRole("button", { name: "发送验证码" }));

      expect(screen.getByText("请输入有效的邮箱地址")).toBeInTheDocument();
      expect(sendCodeMock).not.toHaveBeenCalled();
    });

    it("calls sendCode and switches to step 2 on success", async () => {
      sendCodeMock.mockResolvedValue({ status: 200 });
      render(<RegisterPage />);
      const user = userEvent.setup();

      await user.type(screen.getByPlaceholderText("邮箱"), "new@example.com");
      await user.click(screen.getByRole("button", { name: "发送验证码" }));

      await waitFor(() => {
        expect(screen.getByPlaceholderText("验证码")).toBeInTheDocument();
      });
      expect(screen.getByText("验证码已发送至 new@example.com")).toBeInTheDocument();
    });

    it("shows error for 429 (rate limited)", async () => {
      sendCodeMock.mockResolvedValue({ status: 429, error: { request_id: "r1", error_code: "rate_limited", message: "Too many" } });
      render(<RegisterPage />);
      const user = userEvent.setup();

      await user.type(screen.getByPlaceholderText("邮箱"), "test@example.com");
      await user.click(screen.getByRole("button", { name: "发送验证码" }));

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent("请求过于频繁");
      });
    });

    it("shows network error on send", async () => {
      sendCodeMock.mockResolvedValue({ status: 0, error: { request_id: "unknown", error_code: "network_error", message: "Network failed" } });
      render(<RegisterPage />);
      const user = userEvent.setup();

      await user.type(screen.getByPlaceholderText("邮箱"), "test@example.com");
      await user.click(screen.getByRole("button", { name: "发送验证码" }));

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent("网络连接失败");
      });
    });

    it("shows server error on send", async () => {
      sendCodeMock.mockResolvedValue({ status: 500, error: { request_id: "unknown", error_code: "server_error", message: "Unavailable" } });
      render(<RegisterPage />);
      const user = userEvent.setup();

      await user.type(screen.getByPlaceholderText("邮箱"), "test@example.com");
      await user.click(screen.getByRole("button", { name: "发送验证码" }));

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent("服务暂时不可用");
      });
    });

    it("shows loading state during send", async () => {
      sendCodeMock.mockImplementation(() => new Promise((r) => setTimeout(() => r({ status: 200 }), 200)));
      render(<RegisterPage />);
      const user = userEvent.setup();

      await user.type(screen.getByPlaceholderText("邮箱"), "test@example.com");
      await user.click(screen.getByRole("button", { name: "发送验证码" }));

      expect(screen.getByRole("button", { name: "发送中..." })).toBeDisabled();

      await waitFor(() => {
        expect(screen.getByPlaceholderText("验证码")).toBeInTheDocument();
      });
    });
  });

  describe("Step 2: Register", () => {
    async function goToStep2() {
      sendCodeMock.mockResolvedValue({ status: 200 });
      render(<RegisterPage />);
      const user = userEvent.setup();
      await user.type(screen.getByPlaceholderText("邮箱"), "new@example.com");
      await user.click(screen.getByRole("button", { name: "发送验证码" }));
      await waitFor(() => {
        expect(screen.getByPlaceholderText("验证码")).toBeInTheDocument();
      });
      return user;
    }

    it("shows validation errors for empty fields", async () => {
      const user = await goToStep2();

      await user.click(screen.getByRole("button", { name: "注册" }));

      expect(screen.getByText("请输入验证码")).toBeInTheDocument();
      expect(screen.getByText("密码长度不能少于 8 位")).toBeInTheDocument();
      expect(registerMock).not.toHaveBeenCalled();
    });

    it("shows validation error for short password", async () => {
      const user = await goToStep2();

      await user.type(screen.getByPlaceholderText("验证码"), "123456");
      await user.type(screen.getByPlaceholderText("密码（至少 8 位）"), "short");
      await user.click(screen.getByRole("button", { name: "注册" }));

      expect(screen.getByText("密码长度不能少于 8 位")).toBeInTheDocument();
      expect(registerMock).not.toHaveBeenCalled();
    });

    it("registers and redirects to login on success", async () => {
      registerMock.mockResolvedValue({ status: 201 });
      const user = await goToStep2();

      await user.type(screen.getByPlaceholderText("验证码"), "123456");
      await user.type(screen.getByPlaceholderText("密码（至少 8 位）"), "password123");
      await user.click(screen.getByRole("button", { name: "注册" }));

      await waitFor(() => {
        expect(pushMock).toHaveBeenCalledWith("/login?registered=true");
      });
    });

    it("shows error for invalid code", async () => {
      registerMock.mockResolvedValue({ status: 400, error: { request_id: "r1", error_code: "invalid_code", message: "Invalid code" } });
      const user = await goToStep2();

      await user.type(screen.getByPlaceholderText("验证码"), "999999");
      await user.type(screen.getByPlaceholderText("密码（至少 8 位）"), "password123");
      await user.click(screen.getByRole("button", { name: "注册" }));

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent("验证码错误");
      });
    });

    it("shows error for expired code with resend button", async () => {
      registerMock.mockResolvedValue({ status: 400, error: { request_id: "r1", error_code: "expired_code", message: "Expired" } });
      const user = await goToStep2();

      await user.type(screen.getByPlaceholderText("验证码"), "000000");
      await user.type(screen.getByPlaceholderText("密码（至少 8 位）"), "password123");
      await user.click(screen.getByRole("button", { name: "注册" }));

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent("验证码已过期");
      });
      expect(screen.getByRole("button", { name: "重新发送" })).toBeInTheDocument();
    });

    it("shows error for email already registered (409)", async () => {
      registerMock.mockResolvedValue({ status: 409, error: { request_id: "r1", error_code: "email_already_registered", message: "Already registered" } });
      const user = await goToStep2();

      await user.type(screen.getByPlaceholderText("验证码"), "123456");
      await user.type(screen.getByPlaceholderText("密码（至少 8 位）"), "password123");
      await user.click(screen.getByRole("button", { name: "注册" }));

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent("该邮箱已注册");
      });
      // Multiple "去登录" links exist (footer + error), check the one inside alert
      const alert = screen.getByRole("alert");
      const link = alert.querySelector("a[href='/login']");
      expect(link).not.toBeNull();
      expect(link).toHaveTextContent("去登录");
    });

    it("shows error for 429 (rate limited)", async () => {
      registerMock.mockResolvedValue({ status: 429, error: { request_id: "r1", error_code: "rate_limited", message: "Too many" } });
      const user = await goToStep2();

      await user.type(screen.getByPlaceholderText("验证码"), "123456");
      await user.type(screen.getByPlaceholderText("密码（至少 8 位）"), "password123");
      await user.click(screen.getByRole("button", { name: "注册" }));

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent("请求过于频繁");
      });
    });

    it("shows network error during register", async () => {
      registerMock.mockResolvedValue({ status: 0, error: { request_id: "unknown", error_code: "network_error", message: "Network failed" } });
      const user = await goToStep2();

      await user.type(screen.getByPlaceholderText("验证码"), "123456");
      await user.type(screen.getByPlaceholderText("密码（至少 8 位）"), "password123");
      await user.click(screen.getByRole("button", { name: "注册" }));

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent("网络连接失败");
      });
    });

    it("shows loading state during register", async () => {
      registerMock.mockImplementation(() => new Promise((r) => setTimeout(() => r({ status: 201 }), 200)));
      const user = await goToStep2();

      await user.type(screen.getByPlaceholderText("验证码"), "123456");
      await user.type(screen.getByPlaceholderText("密码（至少 8 位）"), "password123");
      await user.click(screen.getByRole("button", { name: "注册" }));

      expect(screen.getByRole("button", { name: "注册中..." })).toBeDisabled();

      await waitFor(() => {
        expect(pushMock).toHaveBeenCalled();
      });
    });
  });

  it("has a link to login page", () => {
    render(<RegisterPage />);
    const link = screen.getByRole("link", { name: "去登录" });
    expect(link).toHaveAttribute("href", "/login");
  });
});
