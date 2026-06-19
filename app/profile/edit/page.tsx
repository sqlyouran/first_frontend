"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  fetchMyProfile,
  updateProfile,
  fetchInterestTags,
  type ProfileData,
  type InterestTag,
} from "@/lib/api/profile";
import { useAuthStore } from "@/lib/stores/auth";
import TagSelector from "@/app/profile/_components/TagSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  ArrowLeft,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import Link from "next/link";

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;

function EditSkeleton() {
  return (
    <div data-testid="edit-profile-skeleton" className="flex flex-col gap-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-10 w-32" />
    </div>
  );
}

function EditError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <AlertCircle className="size-16 text-destructive" />
      <h2 className="font-heading text-xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground">
        We couldn&apos;t load your profile for editing.
      </p>
      <Button variant="outline" onClick={onRetry}>
        Try Again
      </Button>
    </div>
  );
}

interface FormErrors {
  username?: string;
  nickname?: string;
  bio?: string;
  interest_tags?: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  const fetchMe = useAuthStore((s) => s.fetchMe);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const [username, setUsername] = useState("");
  const [nickname, setNickname] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<InterestTag[]>([]);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [usernameLocked, setUsernameLocked] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(false);

    const [profileRes, tagsRes] = await Promise.all([
      fetchMyProfile(),
      fetchInterestTags(),
    ]);

    if (profileRes.status === 200 && profileRes.data) {
      const p = profileRes.data;
      setUsername(p.username ?? "");
      setNickname(p.nickname ?? "");
      setAvatarUrl(p.avatar_url ?? "");
      setBio(p.bio ?? "");
      setSelectedTags(p.interest_tags ?? []);
      setUsernameLocked(!!p.username);
    } else {
      setError(true);
    }

    if (tagsRes.status === 200 && tagsRes.data) {
      setAvailableTags(tagsRes.data.tags);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function validateClient(): boolean {
    const errors: FormErrors = {};

    if (!usernameLocked) {
      if (!username) {
        errors.username = "Username is required";
      } else if (!USERNAME_REGEX.test(username)) {
        errors.username =
          "Username must be 3-20 characters (lowercase letters, numbers, underscores)";
      }
    }

    if (!nickname || nickname.trim().length < 2) {
      errors.nickname = "Nickname must be at least 2 characters";
    } else if (nickname.length > 30) {
      errors.nickname = "Nickname must be at most 30 characters";
    }

    if (bio && bio.length > 500) {
      errors.bio = "Bio must be at most 500 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    setFormErrors({});

    if (!validateClient()) return;

    setSubmitting(true);

    const payload: Record<string, unknown> = {
      nickname: nickname.trim(),
      avatar_url: avatarUrl.trim() || null,
      bio: bio.trim() || null,
      interest_tags: selectedTags.length > 0 ? selectedTags : null,
    };

    if (!usernameLocked && username) {
      payload.username = username;
    }

    const res = await updateProfile(payload);

    if (res.status === 200 && res.data) {
      await fetchMe();
      router.push("/profile");
      return;
    }

    if (res.status === 409) {
      setServerError("This username is already taken. Please choose another.");
    } else if (res.status === 422 && res.error?.details) {
      setFormErrors(res.error.details as FormErrors);
    } else if (res.error?.error_code === "network_error") {
      setServerError("Network error. Please check your connection.");
    } else {
      setServerError("Something went wrong. Please try again.");
    }

    setSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <main className="mx-auto max-w-2xl px-8 py-16 sm:px-12 lg:px-16">
      {loading && <EditSkeleton />}

      {!loading && error && <EditError onRetry={loadData} />}

      {!loading && !error && (
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link
              href="/profile"
              className="flex items-center gap-2 text-blue-700 transition-colors hover:text-blue-800"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              <span className="text-sm font-medium">Back</span>
            </Link>
            <h1 className="font-heading text-3xl font-bold text-slate-900 lg:text-4xl">Edit Profile</h1>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="mb-1.5 block text-sm font-medium"
              >
                Username{!usernameLocked && <span className="text-red-500">*</span>}
              </label>
              <div className="flex items-center gap-2">
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  placeholder="Choose a username"
                  readOnly={usernameLocked}
                  aria-invalid={!!formErrors.username}
                  className={usernameLocked ? "bg-muted" : ""}
                />
                {usernameLocked && (
                  <span className="shrink-0" title="Username cannot be changed">
                    🔒
                  </span>
                )}
              </div>
              {!usernameLocked && (
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <AlertTriangle className="size-3" />
                  This cannot be changed later
                </p>
              )}
              {formErrors.username && (
                <p className="mt-1 text-sm text-destructive">
                  {formErrors.username}
                </p>
              )}
            </div>

            {/* Nickname */}
            <div>
              <label
                htmlFor="nickname"
                className="mb-1.5 block text-sm font-medium"
              >
                Nickname<span className="text-red-500">*</span>
              </label>
              <Input
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Your nickname"
                aria-invalid={!!formErrors.nickname}
              />
              {formErrors.nickname && (
                <p className="mt-1 text-sm text-destructive">
                  {formErrors.nickname}
                </p>
              )}
            </div>

            {/* Avatar URL */}
            <div>
              <label
                htmlFor="avatar_url"
                className="mb-1.5 block text-sm font-medium"
              >
                Avatar URL
              </label>
              <Input
                id="avatar_url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            {/* Bio */}
            <div>
              <label
                htmlFor="bio"
                className="mb-1.5 block text-sm font-medium"
              >
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell others about yourself"
                rows={4}
                aria-invalid={!!formErrors.bio}
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20"
              />
              {formErrors.bio && (
                <p className="mt-1 text-sm text-destructive">
                  {formErrors.bio}
                </p>
              )}
            </div>

            {/* Interest Tags */}
            {availableTags.length > 0 && (
              <Card className="shadow-sm border border-slate-200">
                <CardHeader>
                  <CardTitle>Interests</CardTitle>
                </CardHeader>
                <CardContent>
                  <TagSelector
                    tags={availableTags}
                    selected={selectedTags}
                    onChange={setSelectedTags}
                  />
                  {formErrors.interest_tags && (
                    <p className="mt-2 text-sm text-destructive">
                      {formErrors.interest_tags}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Server error */}
            {serverError && (
              <p className="text-sm text-destructive" role="alert">
                {serverError}
              </p>
            )}

            {/* Submit */}
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {submitting ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </div>
      )}
      </main>
    </div>
  );
}
