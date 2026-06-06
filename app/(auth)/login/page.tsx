"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
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
      newErrors.email = "请输入有效的邮箱地址";
    }
    if (!password) {
      newErrors.password = "请输入密码";
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
        setServerError("网络连接失败，请检查网络后重试");
      } else if (errorCode === "server_error") {
        setServerError("服务暂时不可用，请稍后重试");
      } else if (res.status === 401) {
        setServerError("邮箱或密码错误");
      } else if (res.status === 423) {
        const details = res.error?.details;
        const lockedUntil = details?.locked_until;
        if (lockedUntil) {
          const time = new Date(lockedUntil).toLocaleTimeString();
          setServerError(`账户已锁定，请于 ${time} 后重试`);
        } else {
          setServerError("账户已锁定，请稍后重试");
        }
      } else if (res.status === 403) {
        setServerError("邮箱未验证，请先完成验证");
      } else if (res.status === 429) {
        setServerError("请求过于频繁，请稍后重试");
      } else {
        setServerError("服务暂时不可用，请稍后重试");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>登录</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            <div>
              <Input
                type="password"
                placeholder="密码"
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
            <Button type="submit" disabled={loading}>
              {loading ? "登录中..." : "登录"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            没有账号？
            <Link href="/register" className="text-primary underline underline-offset-4">
              去注册
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
