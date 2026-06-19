import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchMyProfile,
  updateProfile,
  fetchPublicProfile,
  fetchInterestTags,
} from "@/lib/api/profile";

// Mock authFetch
vi.mock("@/lib/api/authFetch", () => ({
  authFetch: vi.fn(),
}));

import { authFetch } from "@/lib/api/authFetch";
const authFetchMock = vi.mocked(authFetch);

function mockResponse(status: number, body: unknown): Response {
  return {
    status,
    json: () => Promise.resolve(body),
    ok: status >= 200 && status < 300,
    headers: new Headers(),
  } as unknown as Response;
}

describe("fetchMyProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns profile data on 200", async () => {
    const profileData = {
      id: "u1",
      username: "traveler01",
      nickname: "Alice",
      avatar_url: "https://example.com/avatar.jpg",
      bio: "Love hiking",
      interest_tags: ["Hiking", "Street Food"],
      email: "alice@example.com",
      created_at: "2024-01-01T00:00:00Z",
      request_id: "r1",
    };
    authFetchMock.mockResolvedValue(mockResponse(200, profileData));

    const res = await fetchMyProfile();

    expect(res.status).toBe(200);
    expect(res.data).toEqual(profileData);
    expect(authFetchMock).toHaveBeenCalledWith("/api/users/me/profile");
  });

  it("returns 401 error when not authenticated", async () => {
    authFetchMock.mockResolvedValue(
      mockResponse(401, { request_id: "r1", error_code: "unauthorized", message: "Not authenticated" })
    );

    const res = await fetchMyProfile();

    expect(res.status).toBe(401);
    expect(res.error?.error_code).toBe("unauthorized");
  });

  it("returns server error on 500", async () => {
    authFetchMock.mockResolvedValue(mockResponse(500, {}));

    const res = await fetchMyProfile();

    expect(res.status).toBe(500);
    expect(res.error?.error_code).toBe("server_error");
  });

  it("returns network error on fetch failure", async () => {
    authFetchMock.mockRejectedValue(new Error("Network failed"));

    const res = await fetchMyProfile();

    expect(res.status).toBe(0);
    expect(res.error?.error_code).toBe("network_error");
  });
});

describe("updateProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns updated profile on 200", async () => {
    const updatedData = {
      id: "u1",
      username: "traveler01",
      nickname: "Alice Updated",
      avatar_url: null,
      bio: "Updated bio",
      interest_tags: ["Hiking"],
      email: "alice@example.com",
      created_at: "2024-01-01T00:00:00Z",
      request_id: "r2",
    };
    authFetchMock.mockResolvedValue(mockResponse(200, updatedData));

    const res = await updateProfile({
      username: "traveler01",
      nickname: "Alice Updated",
      bio: "Updated bio",
      interest_tags: ["Hiking"],
    });

    expect(res.status).toBe(200);
    expect(res.data).toEqual(updatedData);
    expect(authFetchMock).toHaveBeenCalledWith("/api/users/me/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: expect.any(String),
    });
  });

  it("returns 409 when username is taken", async () => {
    authFetchMock.mockResolvedValue(
      mockResponse(409, { request_id: "r2", error_code: "username_taken", message: "Username already taken" })
    );

    const res = await updateProfile({ username: "taken_name" });

    expect(res.status).toBe(409);
    expect(res.error?.error_code).toBe("username_taken");
  });

  it("returns 422 for validation errors", async () => {
    authFetchMock.mockResolvedValue(
      mockResponse(422, {
        request_id: "r3",
        error_code: "validation_error",
        message: "Validation failed",
        details: { nickname: "Too short" },
      })
    );

    const res = await updateProfile({ nickname: "A" });

    expect(res.status).toBe(422);
    expect(res.error?.error_code).toBe("validation_error");
    expect(res.error?.details?.nickname).toBe("Too short");
  });
});

describe("fetchPublicProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns public profile on 200", async () => {
    const publicData = {
      id: "u2",
      username: "explorer",
      nickname: "Bob",
      avatar_url: "https://example.com/bob.jpg",
      bio: "Explorer",
      interest_tags: ["Photography"],
      created_at: "2024-02-01T00:00:00Z",
      request_id: "r4",
    };
    global.fetch = vi.fn().mockResolvedValue(mockResponse(200, publicData));

    const res = await fetchPublicProfile("explorer");

    expect(res.status).toBe(200);
    expect(res.data).toEqual(publicData);
    expect(global.fetch).toHaveBeenCalledWith("/api/users/explorer");
  });

  it("returns 404 when user not found", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      mockResponse(404, { request_id: "r5", error_code: "not_found", message: "User not found" })
    );

    const res = await fetchPublicProfile("nonexistent");

    expect(res.status).toBe(404);
    expect(res.error?.error_code).toBe("not_found");
  });
});

describe("fetchInterestTags", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns tags list on 200", async () => {
    const tagsData = {
      tags: [
        { value: "hiking", label: "Hiking", category: "outdoors" },
        { value: "street_food", label: "Street Food", category: "food" },
      ],
      request_id: "r6",
    };
    global.fetch = vi.fn().mockResolvedValue(mockResponse(200, tagsData));

    const res = await fetchInterestTags();

    expect(res.status).toBe(200);
    expect(res.data?.tags).toHaveLength(2);
    expect(global.fetch).toHaveBeenCalledWith("/api/users/interest-tags");
  });
});
