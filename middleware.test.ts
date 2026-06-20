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

  it("redirects to /login when unauthenticated user visits /posts/create", () => {
    const req = createRequest("/posts/create", false);
    const res = middleware(req);

    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/login");
  });

  it("redirects to /login when unauthenticated user visits /profile", () => {
    const req = createRequest("/profile", false);
    const res = middleware(req);

    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/login");
  });

  it("redirects to /login when unauthenticated user visits /profile/edit", () => {
    const req = createRequest("/profile/edit", false);
    const res = middleware(req);

    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/login");
  });

  it("allows authenticated user to access /posts/create", () => {
    const req = createRequest("/posts/create", true);
    const res = middleware(req);

    expect(res.headers.get("location")).toBeNull();
  });

  it("allows authenticated user to access /profile", () => {
    const req = createRequest("/profile", true);
    const res = middleware(req);

    expect(res.headers.get("location")).toBeNull();
  });

  it("allows authenticated user to access /profile/edit", () => {
    const req = createRequest("/profile/edit", true);
    const res = middleware(req);

    expect(res.headers.get("location")).toBeNull();
  });

  it("allows unauthenticated user to access /posts (list)", () => {
    const req = createRequest("/posts", false);
    const res = middleware(req);

    expect(res.headers.get("location")).toBeNull();
  });

  it("allows unauthenticated user to access /posts/{id} (detail)", () => {
    const req = createRequest("/posts/some-uuid", false);
    const res = middleware(req);

    expect(res.headers.get("location")).toBeNull();
  });

  it("allows unauthenticated user to access /users/{username} (public profile)", () => {
    const req = createRequest("/users/traveler01", false);
    const res = middleware(req);

    expect(res.headers.get("location")).toBeNull();
  });

  it("allows unauthenticated user to access /login", () => {
    const req = createRequest("/login", false);
    const res = middleware(req);

    expect(res.headers.get("location")).toBeNull();
  });

  it("allows unauthenticated user to access /register", () => {
    const req = createRequest("/register", false);
    const res = middleware(req);

    expect(res.headers.get("location")).toBeNull();
  });

  // Notifications route guard
  it("redirects to /login when unauthenticated user visits /notifications", () => {
    const req = createRequest("/notifications", false);
    const res = middleware(req);

    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/login");
  });

  it("allows authenticated user to access /notifications", () => {
    const req = createRequest("/notifications", true);
    const res = middleware(req);

    expect(res.headers.get("location")).toBeNull();
  });

  // === Messages route guard ===

  it("redirects to /login when unauthenticated user visits /messages", () => {
    const req = createRequest("/messages", false);
    const res = middleware(req);

    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/login");
  });

  it("allows authenticated user to access /messages/{id}", () => {
    const req = createRequest("/messages/some-conv-id", true);
    const res = middleware(req);

    expect(res.headers.get("location")).toBeNull();
  });
});
