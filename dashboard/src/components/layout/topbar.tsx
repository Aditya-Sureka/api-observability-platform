"use client";

import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon } from "lucide-react";
import { useProfile, useLogout } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/input";

export function Topbar() {
  const { data: user } = useProfile();
  const logout = useLogout();
  const router = useRouter();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div className="text-sm text-muted-foreground">
        Monitoring Console
      </div>
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <div className="flex items-center gap-2 text-sm">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{user.username}</span>
              <Badge variant="default">{user.role.replace("_", " ")}</Badge>
            </div>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Log out"
              onClick={() => logout.mutate()}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={() => router.replace("/login")}>
            Sign in
          </Button>
        )}
      </div>
    </header>
  );
}
