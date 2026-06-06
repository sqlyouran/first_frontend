"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { sendCode, register } from "@/lib/api/auth";

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
      newErrors.email = "请输入有效的邮箱地址";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email]);

  function validateCode(): boolean {
    const newErrors: Record<string, string> = {};
    if (!code) {
      newErrors.code = "请输入验证码";
    }
    if (!password || password.length < 8) {
      newErrors.password = "密码长度不能少于 8 位";
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
        setServerError("网络连接失败，请检查网络后重试");
      } else if (res.error?.error_code === "server_error") {
        setServerError("服务暂时不可用，请稍后重试");
      } else if (res.status === 429) {
        setServerError("请求过于频繁，请稍后重试");
      } else {
        setServerError("服务暂时不可用，请稍后重试");
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
        setServerError("网络连接失败，请检查网络后重试");
      } else if (errorCode === "server_error") {
        setServerError("服务暂时不可用，请稍后重试");
      } else if (errorCode === "invalid_code") {
        setServerError("验证码错误，请重新输入");
      } else if (errorCode === "expired_code") {
        setServerError("验证码已过期，请重新发送");
      } else if (errorCode === "email_already_registered") {
        setServerError("该邮箱已注册，请直接登录");
      } else if (res.status === 429) {
        setServerError("请求过于频繁，请稍后重试");
      } else {
        setServerError("服务暂时不可用，请稍后重试");
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
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>注册</CardTitle>
        </CardHeader>
        <CardContent>
          {step === "email" ? (
            <form onSubmit={handleSendCode} className="flex flex-col gap-4">
              <div>
                <Input
                  type="text"
                  inputMode="email"
                  placeholder="邮箱"
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
              <Button type="submit" disabled={loading || countdown > 0}>
                {loading ? "发送中..." : countdown > 0 ? `重新发送 (${countdown}s)` : "发送验证码"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                验证码已发送至 {email}
              </p>
              <div>
                <Input
                  type="text"
                  placeholder="验证码"
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
                  placeholder="密码（至少 8 位）"
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
                  {serverError.includes("过期") && (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="ml-2 text-primary underline underline-offset-4"
                    >
                      重新发送
                    </button>
                  )}
                  {serverError.includes("已注册") && (
                    <Link
                      href="/login"
                      className="ml-2 text-primary underline underline-offset-4"
                    >
                      去登录
                    </Link>
                  )}
                </p>
              )}
              <Button type="submit" disabled={loading}>
                {loading ? "注册中..." : "注册"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            已有账号？
            <Link href="/login" className="text-primary underline underline-offset-4">
              去登录
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
