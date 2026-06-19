"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/auth";
import { User as UserIcon } from "lucide-react";

export default function UserDropdown() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [open, setOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function handleSignOut() {
    setOpen(false);
    await logout();
    router.push("/");
  }

  function handleProfile() {
    setOpen(false);
    router.push("/profile");
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Sign In
        </Link>
        <Link
          href="/register"
          className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  const avatarUrl = user?.avatar_url;
  const showAvatar = avatarUrl && !avatarError;

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label="User menu"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen(!open)}
        className="flex size-8 items-center justify-center overflow-hidden rounded-full ring-1 ring-foreground/10 transition-shadow hover:ring-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {showAvatar ? (
          <img
            src={avatarUrl}
            alt={user?.nickname ?? "User avatar"}
            className="size-full object-cover"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <div
            data-testid="default-avatar"
            className="flex size-full items-center justify-center bg-muted"
          >
            <UserIcon className="size-4 text-muted-foreground" aria-hidden="true" />
          </div>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-48 rounded-lg bg-popover p-1 shadow-lg ring-1 ring-foreground/10"
        >
          <div className="border-b border-border px-3 py-2">
            <p className="text-sm font-medium truncate">
              {user?.nickname ?? user?.email}
            </p>
            {user?.username && (
              <p className="text-xs text-muted-foreground truncate">
                @{user.username}
              </p>
            )}
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={handleProfile}
            className="flex w-full items-center rounded-md px-3 py-2 text-sm hover:bg-accent"
          >
            My Profile
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="flex w-full items-center rounded-md px-3 py-2 text-sm hover:bg-accent"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
