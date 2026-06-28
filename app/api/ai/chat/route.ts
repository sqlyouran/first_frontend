import { NextRequest } from "next/server";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8080";

/**
 * Thin BFF proxy for SSE streaming.
 * Next.js rewrites() buffers responses, breaking SSE —
 * this Route Handler uses Web Streams to forward tokens as they arrive.
 */
export async function POST(req: NextRequest) {
  const body = await req.text();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const cookie = req.headers.get("cookie");
  if (cookie) headers["Cookie"] = cookie;

  const upstream = await fetch(`${BACKEND}/api/ai/chat`, {
    method: "POST",
    headers,
    body,
  });

  if (!upstream.body) {
    return new Response(upstream.statusText, { status: upstream.status });
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
