"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendCode, register } from "@/lib/api/auth";
import StepIndicator from "@/app/(auth)/_components/StepIndicator";

type Step = "email" | "code";

export default function RegisterPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const validateEmail = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email]);

  function validateCode(): boolean {
    const newErrors: Record<string, string> = {};
    if (!code) {
      newErrors.code = "Please enter the verification code";
    }
    if (!password || password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");

    if (!validateEmail()) return;

    setLoading(true);
    try {
      const res = await sendCode(email);

      if (res.status === 200) {
        setStep("code");
        setCountdown(60);
      } else if (res.error?.error_code === "network_error") {
        setServerError("Network error. Please check your connection");
      } else if (res.error?.error_code === "server_error") {
        setServerError("Service temporarily unavailable. Please try again later");
      } else if (res.status === 429) {
        setServerError("Too many requests. Please try again later");
      } else {
        setServerError("Service temporarily unavailable. Please try again later");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");

    if (!validateCode()) return;

    setLoading(true);
    try {
      const res = await register(email, code, password);

      if (res.status === 201) {
        router.push("/login?registered=true");
        return;
      }

      const errorCode = res.error?.error_code;

      if (errorCode === "network_error") {
        setServerError("Network error. Please check your connection");
      } else if (errorCode === "server_error") {
        setServerError("Service temporarily unavailable. Please try again later");
      } else if (errorCode === "invalid_code") {
        setServerError("Invalid code. Please try again");
      } else if (errorCode === "expired_code") {
        setServerError("Code expired. Please resend");
      } else if (errorCode === "email_already_registered") {
        setServerError("Email already registered. Please sign in");
      } else if (res.status === 429) {
        setServerError("Too many requests. Please try again later");
      } else {
        setServerError("Service temporarily unavailable. Please try again later");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleResend() {
    setStep("email");
    setServerError("");
    setCode("");
    setPassword("");
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="mb-2 font-heading text-3xl font-bold text-slate-900">
        Start your adventure
      </h1>
      <p className="mb-6 text-muted-foreground">Create your account</p>
      <div className="mb-6">
        <StepIndicator currentStep={step === "email" ? 1 : 2} totalSteps={2} />
      </div>
      {step === "email" ? (
        <form onSubmit={handleSendCode} className="flex flex-col gap-4">
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
          {serverError && (
            <p className="text-sm text-destructive" role="alert">{serverError}</p>
          )}
          <Button type="submit" disabled={loading || countdown > 0} className="w-full">
            {loading ? "Sending..." : countdown > 0 ? `Resend (${countdown}s)` : "Send Code"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Code sent to {email}
          </p>
          <div>
            <Input
              type="text"
              placeholder="Verification code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              aria-invalid={!!errors.code}
            />
            {errors.code && (
              <p className="mt-1 text-sm text-destructive">{errors.code}</p>
            )}
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password (min. 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-destructive">{errors.password}</p>
            )}
          </div>
          {serverError && (
            <p className="text-sm text-destructive" role="alert">
              {serverError}
              {serverError.includes("expired") && (
                <button
                  type="button"
                  onClick={handleResend}
                  className="ml-2 text-primary underline underline-offset-4"
                >
                  Resend
                </button>
              )}
              {serverError.includes("already registered") && (
                <Link
                  href="/login"
                  className="ml-2 text-primary underline underline-offset-4"
                >
                  Sign in
                </Link>
              )}
            </p>
          )}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  );
}
