import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchFromBackend } from "@/lib/backend";
import type { PublicProfileData } from "@/lib/api/profile";
import PublicProfileView from "./_components/PublicProfileView";

interface PageProps {
  params: Promise<{ username: string }>;
}

async function fetchPublicProfile(
  username: string,
): Promise<PublicProfileData | null> {
  const res = await fetchFromBackend(`/api/users/${username}`);
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await fetchPublicProfile(username);
  if (!profile) return { title: "User Not Found" };
  return {
    title: `${profile.nickname ?? profile.username} (@${profile.username}) — Wanderchina`,
    description: profile.bio ?? `View ${profile.nickname ?? profile.username}'s profile on Wanderchina`,
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params;
  const profile = await fetchPublicProfile(username);

  if (!profile) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <main className="mx-auto max-w-2xl px-8 py-16 sm:px-12 lg:px-16">
        <PublicProfileView profile={profile} />
      </main>
    </div>
  );
}
