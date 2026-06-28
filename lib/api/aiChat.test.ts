import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createConversation, streamChat } from "./aiChat";

const BACKEND = "http://localhost:8080";
const originalFetch = globalThis.fetch;

describe("createConversation", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("sends POST to backend /api/ai/conversations and returns id", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(
        JSON.stringify({ request_id: "r1", id: "conv-123", created_at: "2026-01-01T00:00:00Z" }),
        { status: 201 },
      ),
    );

    const result = await createConversation();

    expect(result.id).toBe("conv-123");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${BACKEND}/api/ai/conversations`,
      expect.objectContaining({ method: "POST" }),
    );
  });
});

describe("streamChat", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("sends POST to backend /api/ai/chat with conversation_id and message", async () => {
    const sseBody = "event:token\ndata:hello\n\nevent:done\ndata:\n\n";
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(sseBody));
        controller.close();
      },
    });

    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(stream, { status: 200 }),
    );

    const onToken = vi.fn();
    const onDone = vi.fn();
    const onError = vi.fn();

    await streamChat("conv-123", "hi there", onToken, onDone, onError);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${BACKEND}/api/ai/chat`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ conversation_id: "conv-123", message: "hi there" }),
      }),
    );
  });

  it("calls onToken for each SSE token event", async () => {
    const sseBody = "event:token\ndata:你\n\nevent:token\ndata:好\n\nevent:done\ndata:\n\n";
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(sseBody));
        controller.close();
      },
    });

    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(stream, { status: 200 }),
    );

    const onToken = vi.fn();
    const onDone = vi.fn();
    const onError = vi.fn();

    await streamChat("conv-1", "hello", onToken, onDone, onError);

    expect(onToken).toHaveBeenCalledTimes(2);
    expect(onToken).toHaveBeenNthCalledWith(1, "你");
    expect(onToken).toHaveBeenNthCalledWith(2, "好");
  });

  it("calls onDone when stream ends with done event", async () => {
    const sseBody = "event:token\ndata:ok\n\nevent:done\ndata:\n\n";
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(sseBody));
        controller.close();
      },
    });

    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(stream, { status: 200 }),
    );

    const onDone = vi.fn();
    await streamChat("conv-1", "hello", vi.fn(), onDone, vi.fn());

    expect(onDone).toHaveBeenCalled();
  });

  it("calls onError when fetch throws", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Network down"),
    );

    const onError = vi.fn();
    const onDone = vi.fn();
    const onToken = vi.fn();

    await streamChat("conv-1", "hello", onToken, onDone, onError);

    expect(onError).toHaveBeenCalledWith(expect.any(String));
    expect(onDone).not.toHaveBeenCalled();
    expect(onToken).not.toHaveBeenCalled();
  });
});
