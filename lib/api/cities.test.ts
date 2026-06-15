import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchCities } from "./cities";

const originalFetch = globalThis.fetch;

describe("fetchCities", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("returns 200 with cities", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [{ id: "c1", name: "Beijing", name_zh: "北京", slug: "beijing" }],
          total: 1,
          page: 1,
          size: 100,
          request_id: "r1",
        }),
        { status: 200 }
      )
    );

    const result = await fetchCities();
    expect(result.status).toBe(200);
    expect(result.data!.items).toHaveLength(1);
    expect(result.data!.items[0].name).toBe("Beijing");
  });

  it("calls /api/cities with size=100", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(
        JSON.stringify({ items: [], total: 0, page: 1, size: 100, request_id: "r1" }),
        { status: 200 }
      )
    );

    await fetchCities();

    const url = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(url).toBe("/api/cities?size=100");
  });

  it("returns server error on 500", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response("err", { status: 500 })
    );

    const result = await fetchCities();
    expect(result.status).toBe(500);
    expect(result.error?.error_code).toBe("server_error");
  });
});
