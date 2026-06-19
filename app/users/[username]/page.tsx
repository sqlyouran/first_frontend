"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { fetchPublicProfile, type PublicProfileData } from "@/lib/api/profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { User as UserIcon, Calendar, AlertCircle, SearchX } from "lucide-react";
import Link from "next/link";

function PublicProfileSkeleton() {
  return (
    <div data-testid="public-profile-skeleton" className="flex flex-col gap-6">
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

function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <SearchX className="size-16 text-muted-foreground" />
      <h2 className="font-heading text-xl font-semibold">User Not Found</h2>
      <p className="text-muted-foreground">
        The user you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <Link href="/">
        <Button variant="outline">Go Home</Button>
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
        We couldn&apos;t load this profile. Please try again.
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

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(false);
    setNotFound(false);

    const res = await fetchPublicProfile(username);

    if (res.status === 200 && res.data) {
      setProfile(res.data);
    } else if (res.status === 404) {
      setNotFound(true);
    } else {
      setError(true);
    }

    setLoading(false);
  }, [username]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <main className="mx-auto max-w-2xl px-8 py-16 sm:px-12 lg:px-16">
      {loading && <PublicProfileSkeleton />}

      {!loading && notFound && <NotFound />}

      {!loading && error && <ProfileError onRetry={loadProfile} />}

      {!loading && !notFound && !error && profile && (
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <AvatarImage
              url={profile.avatar_url}
              name={profile.nickname ?? profile.username}
            />
            <div>
              <h1 className="font-heading text-3xl font-bold text-slate-900 lg:text-4xl">
                {profile.nickname ?? profile.username}
              </h1>
              <p className="text-sm text-muted-foreground">
                @{profile.username}
              </p>
            </div>
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

          {/* Member since */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="size-4" />
            Joined {formatDate(profile.created_at)}
          </div>
        </div>
      )}
      </main>
    </div>
  );
}
