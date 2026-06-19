import { notFound } from "next/navigation";
import { getAccessToken } from "@/lib/api/server-auth";
import { fetchFromBackend } from "@/lib/backend";
import type { ProfileData } from "@/lib/api/profile";
import ProfileView from "./_components/ProfileView";

export default async function ProfilePage() {
  const accessToken = await getAccessToken();
  if (!accessToken) notFound();

  const res = await fetchFromBackend("/api/users/me/profile", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 404) notFound();
  if (!res.ok) {
    throw new Error(`Failed to load profile (${res.status})`);
  }

  const profile: ProfileData = await res.json();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <main className="mx-auto max-w-2xl px-8 py-16 sm:px-12 lg:px-16">
        <ProfileView profile={profile} />
      </main>
    </div>
  );
}
