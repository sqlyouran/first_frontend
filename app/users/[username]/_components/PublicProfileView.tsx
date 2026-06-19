"use client";

import { useState } from "react";
import Link from "next/link";
import { type PublicProfileData } from "@/lib/api/profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User as UserIcon, Calendar, SearchX } from "lucide-react";
import { SendMessageButton } from "./SendMessageButton";

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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
}

export function PublicProfileNotFound() {
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

export default function PublicProfileView({
  profile,
}: {
  profile: PublicProfileData;
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <AvatarImage
          url={profile.avatar_url}
          name={profile.nickname ?? profile.username}
        />
        <div className="flex-1">
          <h1 className="font-heading text-3xl font-bold text-slate-900 lg:text-4xl">
            {profile.nickname ?? profile.username}
          </h1>
          <p className="text-sm text-muted-foreground">
            @{profile.username}
          </p>
        </div>
        <SendMessageButton recipientUsername={profile.username} />
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
  );
}
