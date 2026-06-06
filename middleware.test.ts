import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";

function createRequest(pathname: string, hasRefreshToken: boolean): NextRequest {
  const url = new URL(pathname, "http://localhost:3000");
  const req = new NextRequest(url);
  if (hasRefreshToken) {
    req.cookies.set("refresh_token", "some-value");
  }
  return req;
}

describe("middleware", () => {
  it("redirects to / when logged-in user visits /login", () => {
    const req = createRequest("/login", true);
    const res = middleware(req);

    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/");
  });

  it("redirects to / when logged-in user visits /register", () => {
    const req = createRequest("/register", true);
    const res = middleware(req);

    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/");
  });

  it("redirects to /login when unauthenticated user visits protected route", () => {
    const req = createRequest("/dashboard", false);
    const res = middleware(req);

    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/login");
  });

  it("allows unauthenticated user to access /login", () => {
    const req = createRequest("/login", false);
    const res = middleware(req);

    // NextResponse.next() doesn't set redirect
    expect(res.headers.get("location")).toBeNull();
  });

  it("allows unauthenticated user to access /register", () => {
    const req = createRequest("/register", false);
    const res = middleware(req);

    expect(res.headers.get("location")).toBeNull();
  });

  it("allows authenticated user to access protected routes", () => {
    const req = createRequest("/dashboard", true);
    const res = middleware(req);

    expect(res.headers.get("location")).toBeNull();
  });
});
