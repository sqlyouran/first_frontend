import { describe, it, expect } from "vitest";
import { mockLogin, mockSendCode, mockRegister } from "@/lib/mock/auth";

describe("mockLogin", () => {
  it("returns 200 with access_token for valid credentials", async () => {
    const res = await mockLogin({ email: "test@example.com", password: "password123" });
    expect(res.status).toBe(200);
    expect(res.data?.access_token).toBeDefined();
  });

  it("returns 401 for invalid credentials", async () => {
    const res = await mockLogin({ email: "wrong@example.com", password: "wrong" });
    expect(res.status).toBe(401);
    expect(res.data?.error).toBe("invalid_credentials");
  });

  it("returns 423 with locked_until for locked user", async () => {
    const res = await mockLogin({ email: "locked@example.com", password: "any" });
    expect(res.status).toBe(423);
    expect(res.data?.locked_until).toBeDefined();
  });

  it("returns 403 with error_code for unverified user", async () => {
    const res = await mockLogin({ email: "unverified@example.com", password: "any" });
    expect(res.status).toBe(403);
    expect(res.data?.error_code).toBe("email_unverified");
  });

  it("returns 429 with Retry-After for rate-limited user", async () => {
    const res = await mockLogin({ email: "ratelimit@example.com", password: "any" });
    expect(res.status).toBe(429);
    expect(res.headers?.["Retry-After"]).toBe("900");
  });
});

describe("mockSendCode", () => {
  it("returns 200 for any email (anti-enumeration)", async () => {
    const res = await mockSendCode({ email: "anyone@example.com" });
    expect(res.status).toBe(200);
  });

  it("returns 429 for rate-limited email", async () => {
    const res = await mockSendCode({ email: "ratelimit@example.com" });
    expect(res.status).toBe(429);
    expect(res.headers?.["Retry-After"]).toBeDefined();
  });
});

describe("mockRegister", () => {
  it("returns 201 for valid code", async () => {
    const res = await mockRegister({ email: "new@example.com", code: "123456", password: "pass1234" });
    expect(res.status).toBe(201);
  });

  it("returns 400 with invalid_code for wrong code", async () => {
    const res = await mockRegister({ email: "new@example.com", code: "999999", password: "pass1234" });
    expect(res.status).toBe(400);
    expect(res.data?.error_code).toBe("invalid_code");
  });

  it("returns 400 with expired_code for expired code", async () => {
    const res = await mockRegister({ email: "new@example.com", code: "000000", password: "pass1234" });
    expect(res.status).toBe(400);
    expect(res.data?.error_code).toBe("expired_code");
  });

  it("returns 429 for rate-limited email", async () => {
    const res = await mockRegister({ email: "ratelimit@example.com", code: "123456", password: "pass1234" });
    expect(res.status).toBe(429);
    expect(res.headers?.["Retry-After"]).toBeDefined();
  });
});
