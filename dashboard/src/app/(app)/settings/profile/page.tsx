"use client";

import { useProfile, useLogout } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge, Skeleton } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { data: user, isLoading } = useProfile();
  const logout = useLogout();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Your account details and session.
        </p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Information from the auth service.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {isLoading || !user ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <dl className="grid grid-cols-3 gap-y-3 text-sm">
              <dt className="text-muted-foreground">Username</dt>
              <dd className="col-span-2 font-medium">{user.username}</dd>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="col-span-2 font-medium">{user.email}</dd>
              <dt className="text-muted-foreground">Role</dt>
              <dd className="col-span-2">
                <Badge variant="default">{user.role.replace("_", " ")}</Badge>
              </dd>
              <dt className="text-muted-foreground">Status</dt>
              <dd className="col-span-2">
                <Badge variant={user.isActive ? "success" : "destructive"}>
                  {user.isActive ? "active" : "inactive"}
                </Badge>
              </dd>
            </dl>
          )}
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logout.mutate()}
            >
              Log out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
