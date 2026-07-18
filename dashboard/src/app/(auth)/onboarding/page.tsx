"use client";

import { useState } from "react";
import Link from "next/link";
import { useOnboardSuperAdmin } from "@/hooks/useAuth";
import { onboardSchema, type OnboardInput } from "@/lib/api/dto";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function OnboardingPage() {
  const onboard = useOnboardSuperAdmin();
  const [form, setForm] = useState<OnboardInput>({
    username: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = onboardSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    const { username, email, password } = parsed.data;
    try {
      await onboard.mutateAsync({ username, email, password });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        return;
      }
      setError("Unable to create super admin. Please try again.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Onboard super admin</CardTitle>
          <CardDescription>
            Create the first account. This can only be done once.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={form.username}
                onChange={(e) =>
                  setForm((f) => ({ ...f, username: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm"
                type="password"
                value={form.confirm}
                onChange={(e) =>
                  setForm((f) => ({ ...f, confirm: e.target.value }))
                }
              />
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" disabled={onboard.isPending}>
              {onboard.isPending ? "Creating…" : "Create super admin"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already set up?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
