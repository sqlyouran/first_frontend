"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { fetchMyProfile, type ProfileData } from "@/lib/api/profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, User as UserIcon, Mail, Calendar, AlertCircle } from "lucide-react";

function ProfileSkeleton() {
  return (
    <div data-testid="profile-skeleton" className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Skeleton className="size-20 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

function ProfileEmpty() {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <UserIcon className="size-16 text-muted-foreground" />
      <h2 className="font-heading text-xl font-semibold">Complete Your Profile</h2>
      <p className="max-w-sm text-muted-foreground">
        Set up your username, nickname, and bio to let other travelers know who you are.
      </p>
      <Link href="/profile/edit">
        <Button>Edit Profile</Button>
      </Link>
    </div>
  );
}

function ProfileError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <AlertCircle className="size-16 text-destructive" />
      <h2 className="font-heading text-xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground">
        We couldn&apos;t load your profile. Please try again.
      </p>
      <Button variant="outline" onClick={onRetry}>
        Try Again
      </Button>
    </div>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
}

function AvatarImage({ url, name }: { url: string | null; name: string }) {
  const [hasError, setHasError] = useState(false);

  if (!url || hasError) {
    return (
      <div className="flex size-20 items-center justify-center rounded-full bg-muted">
        <UserIcon className="size-10 text-muted-foreground" />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={name}
      className="size-20 rounded-full object-cover"
      onError={() => setHasError(true)}
    />
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(false);
    const res = await fetchMyProfile();
    if (res.status === 200 && res.data) {
      setProfile(res.data);
    } else {
      setError(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <main className="mx-auto max-w-2xl px-8 py-16 sm:px-12 lg:px-16">
      {loading && <ProfileSkeleton />}

      {!loading && error && <ProfileError onRetry={loadProfile} />}

      {!loading && !error && profile && !profile.username && !profile.nickname && (
        <ProfileEmpty />
      )}

      {!loading && !error && profile && (profile.username || profile.nickname) && (
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <AvatarImage
                url={profile.avatar_url}
                name={profile.nickname ?? "User"}
              />
              <div>
                <h1 className="font-heading text-3xl font-bold text-slate-900 lg:text-4xl">
                  {profile.nickname}
                </h1>
                {profile.username && (
                  <p className="text-sm text-muted-foreground">
                    @{profile.username}
                  </p>
                )}
              </div>
            </div>
            <Link href="/profile/edit">
              <Button variant="outline" size="sm">
                <Pencil className="size-3.5" aria-hidden="true" />
                Edit Profile
              </Button>
            </Link>
          </div>

          {/* Bio */}
          {profile.bio && (
            <Card className="shadow-sm border border-slate-200">
              <CardContent className="pt-4">
                <p className="text-sm leading-relaxed">{profile.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Interests */}
          {profile.interest_tags && profile.interest_tags.length > 0 && (
            <Card className="shadow-sm border border-slate-200">
              <CardHeader>
                <CardTitle>Interests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.interest_tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Account info */}
          <Card className="shadow-sm border border-slate-200">
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="size-4" />
                  {profile.email}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="size-4" />
                  Joined {formatDate(profile.created_at)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      </main>
    </div>
  );
}
