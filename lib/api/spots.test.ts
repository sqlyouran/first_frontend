import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchSpots, fetchSpotPosts } from "./spots";

const originalFetch = globalThis.fetch;

describe("fetchSpots", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  function mockFetchOk(body: Record<string, unknown>, status = 200) {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify(body), { status })
    );
  }

  it("returns 200 with correct structure", async () => {
    mockFetchOk({
      items: [],
      total: 0,
      page: 1,
      size: 12,
      request_id: "r1",
    });

    const result = await fetchSpots();
    expect(result.status).toBe(200);
    expect(result.data).toBeDefined();
    expect(result.data!.items).toBeInstanceOf(Array);
    expect(result.data!.request_id).toBe("r1");
  });

  it("computes has_more from total/page/size", async () => {
    mockFetchOk({
      items: [{ id: "s1", name: "X" }],
      total: 20,
      page: 1,
      size: 12,
      request_id: "r1",
    });

    const result = await fetchSpots({ page: 1, size: 12 });
    expect(result.data!.has_more).toBe(true); // 1*12 < 20
  });

  it("has_more false when last page", async () => {
    mockFetchOk({
      items: [{ id: "s1", name: "X" }],
      total: 5,
      page: 1,
      size: 12,
      request_id: "r1",
    });

    const result = await fetchSpots({ page: 1, size: 12 });
    expect(result.data!.has_more).toBe(false); // 1*12 >= 5
  });

  it("passes city slug param", async () => {
    mockFetchOk({ items: [], total: 0, page: 1, size: 12, request_id: "r1" });

    await fetchSpots({ citySlug: "beijing" });

    const url = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(url).toContain("city=beijing");
  });

  it("returns error on 500", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response("err", { status: 500 })
    );

    const result = await fetchSpots();
    expect(result.status).toBe(500);
    expect(result.error?.error_code).toBe("server_error");
  });
});

describe("fetchSpotPosts", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("returns 200 with posts", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [{ id: "p1", title: "Beijing Guide" }],
          total: 1,
          page: 1,
          size: 20,
          request_id: "r1",
        }),
        { status: 200 }
      )
    );

    const result = await fetchSpotPosts("spot-1");
    expect(result.status).toBe(200);
    expect(result.data!.items).toHaveLength(1);
  });

  it("calls correct URL", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify({ items: [], total: 0, page: 1, size: 20, request_id: "r1" }), {
        status: 200,
      })
    );

    await fetchSpotPosts("spot-abc", { page: 2, size: 5 });

    const url = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(url).toContain("/api/spots/spot-abc/posts");
    expect(url).toContain("page=2");
    expect(url).toContain("size=5");
  });
});
