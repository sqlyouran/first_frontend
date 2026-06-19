import "server-only";
import { cookies } from "next/headers";
import { fetchFromBackend } from "@/lib/backend";

/**
 * Exchange the refresh_token cookie for an access_token via the backend.
 * Returns null if no cookie exists or the refresh fails.
 */
export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;
  if (!refreshToken) return null;

  const res = await fetchFromBackend("/api/auth/refresh", {
    method: "POST",
    headers: { Cookie: `refresh_token=${refreshToken}` },
  });

  if (!res.ok) return null;

  const data = await res.json();
  return data.access_token ?? null;
}
