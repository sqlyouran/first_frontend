"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth";

export default function LoginPage() {
  const router = useRouter();
  const setToken = useAuthStore((s) => s.setToken);
  const fetchMe = useAuthStore((s) => s.fetchMe);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState("");

  function validate(): boolean {
    const newErrors: { email?: string; password?: string } = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!password) {
      newErrors.password = "Please enter your password";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await login(email, password);

      if (res.status === 200 && res.data?.access_token) {
        setToken(res.data.access_token);
        await fetchMe();
        router.push("/");
        return;
      }

      const errorCode = res.error?.error_code;

      if (errorCode === "network_error") {
        setServerError("Network error. Please check your connection");
      } else if (errorCode === "server_error") {
        setServerError("Service temporarily unavailable. Please try again later");
      } else if (res.status === 401) {
        setServerError("Invalid email or password");
      } else if (res.status === 423) {
        const details = res.error?.details;
        const lockedUntil = details?.locked_until;
        if (lockedUntil) {
          const time = new Date(lockedUntil).toLocaleTimeString();
          setServerError(`Account locked. Please try again after ${time}`);
        } else {
          setServerError("Account locked. Please try again later");
        }
      } else if (res.status === 403) {
        setServerError("Email not verified. Please verify your email first");
      } else if (res.status === 429) {
        setServerError("Too many requests. Please try again later");
      } else {
        setServerError("Service temporarily unavailable. Please try again later");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="mb-2 font-heading text-3xl font-bold text-slate-900">
        Your journey begins here
      </h1>
      <p className="mb-8 text-muted-foreground">Sign in to your account</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Input
            type="text"
            inputMode="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-destructive">{errors.email}</p>
          )}
        </div>
        <div>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-destructive">{errors.password}</p>
          )}
        </div>
        {serverError && (
          <p className="text-sm text-destructive" role="alert">{serverError}</p>
        )}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-primary underline underline-offset-4">
          Sign up
        </Link>
      </p>
    </div>
  );
}
