"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicProfileError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <main className="mx-auto max-w-2xl px-8 py-16 sm:px-12 lg:px-16">
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <AlertCircle className="size-16 text-destructive" />
          <h2 className="font-heading text-xl font-semibold">
            Something went wrong
          </h2>
          <p className="text-muted-foreground">
            We couldn&apos;t load this profile. Please try again.
          </p>
          <Button variant="outline" onClick={reset}>
            Try Again
          </Button>
        </div>
      </main>
    </div>
  );
}
