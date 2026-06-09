import { describe, it, expect } from "vitest";
import { parseResponse, networkError, serverError } from "@/lib/api/client";

describe("parseResponse", () => {
  it("returns 204 with no data for No Content", async () => {
    const res = new Response(null, { status: 204 });
    const result = await parseResponse(res);

    expect(result.status).toBe(204);
    expect(result.data).toBeUndefined();
    expect(result.error).toBeUndefined();
  });

  it("parses success response body", async () => {
    const body = { id: "123", title: "Test" };
    const res = new Response(JSON.stringify(body), { status: 200 });
    const result = await parseResponse(res);

    expect(result.status).toBe(200);
    expect(result.data).toEqual(body);
    expect(result.error).toBeUndefined();
  });

  it("parses error response body", async () => {
    const body = {
      request_id: "r1",
      error_code: "validation_error",
      message: "Title is required",
      details: { title: "must not be blank" },
    };
    const res = new Response(JSON.stringify(body), { status: 422 });
    const result = await parseResponse(res);

    expect(result.status).toBe(422);
    expect(result.data).toBeUndefined();
    expect(result.error).toEqual({
      request_id: "r1",
      error_code: "validation_error",
      message: "Title is required",
      details: { title: "must not be blank" },
    });
  });

  it("handles malformed JSON gracefully", async () => {
    const res = new Response("not json", { status: 200 });
    const result = await parseResponse(res);

    expect(result.status).toBe(200);
    expect(result.error?.error_code).toBe("unknown_error");
    expect(result.error?.message).toBe("Unexpected response format");
  });
});

describe("networkError", () => {
  it("returns status 0 with network_error code", () => {
    const result = networkError();

    expect(result.status).toBe(0);
    expect(result.error?.error_code).toBe("network_error");
    expect(result.error?.request_id).toBe("unknown");
  });
});

describe("serverError", () => {
  it("returns the given status with server_error code", () => {
    const result = serverError(502);

    expect(result.status).toBe(502);
    expect(result.error?.error_code).toBe("server_error");
  });
});
