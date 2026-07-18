"use client";

import Link from "next/link";
import { useClients } from "@/hooks/useClients";
import { ApiError } from "@/lib/api/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge, Skeleton } from "@/components/ui/input";

export default function ClientsPage() {
  const { data, isLoading, isError, error } = useClients({ limit: 50 });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Clients</h1>
        <p className="text-sm text-muted-foreground">
          Organizations monitored by the system.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="p-8">
            {error instanceof ApiError && error.status === 403 ? (
              <p className="text-sm text-destructive">
                You do not have permission to view clients. Super admin access
                is required.
              </p>
            ) : (
              <p className="text-sm text-destructive">
                {error instanceof ApiError
                  ? error.message
                  : "Failed to load clients."}
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Clients ({data?.pagination?.total ?? 0})</CardTitle>
            <CardDescription>
              Select a client to manage users and API keys.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data && data.clients.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="py-2 pr-4 font-medium">Name</th>
                      <th className="py-2 pr-4 font-medium">Slug</th>
                      <th className="py-2 pr-4 font-medium">Email</th>
                      <th className="py-2 pr-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.clients.map((c) => (
                      <tr
                        key={c._id}
                        className="border-b border-border/60 hover:bg-muted/40"
                      >
                        <td className="py-2 pr-4">
                          <Link
                            href={`/clients/${c._id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {c.name}
                          </Link>
                        </td>
                        <td className="py-2 pr-4 text-muted-foreground">
                          {c.slug}
                        </td>
                        <td className="py-2 pr-4 text-muted-foreground">
                          {c.email}
                        </td>
                        <td className="py-2 pr-4">
                          <Badge variant={c.isActive ? "success" : "muted"}>
                            {c.isActive ? "active" : "inactive"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No clients yet. Onboard one via the API to get started.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground">
        Client creation is available via the backend API
        (<code className="rounded bg-muted px-1">POST /api/admin/clients/onboard</code>).
      </p>
    </div>
  );
}
