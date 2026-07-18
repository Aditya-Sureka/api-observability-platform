"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useClient,
  useClientUsers,
  useClientApiKeys,
  useCreateApiKey,
  useCreateUser,
} from "@/hooks/useClients";
import { ApiError } from "@/lib/api/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge, Input, Label, Skeleton } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRole } from "@/hooks/useRole";

export function ClientDetail({ clientId }: { clientId: string }) {
  const { data: client, isLoading, isError, error } = useClient(clientId);
  const { data: users } = useClientUsers(clientId);
  const { data: apiKeys } = useClientApiKeys(clientId);
  const { canManageUsers, canCreateApiKeys } = useRole();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="p-8">
          {error instanceof ApiError && error.status === 403 ? (
            <p className="text-sm text-destructive">
              You do not have permission to view this client.
            </p>
          ) : (
            <p className="text-sm text-destructive">
              {error instanceof ApiError ? error.message : "Client not found."}
            </p>
          )}
          <Link href="/clients" className="mt-3 inline-block text-sm text-primary hover:underline">
            ← Back to clients
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/clients" className="text-sm text-primary hover:underline">
          ← Clients
        </Link>
        <h1 className="mt-1 text-xl font-semibold">{client?.name}</h1>
        <p className="text-sm text-muted-foreground">
          {client?.slug} · {client?.email}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Users ({users?.length ?? 0})</CardTitle>
            <CardDescription>Members of this client.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <UsersTable users={users ?? []} />
            {canManageUsers && <CreateUserForm clientId={clientId} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Keys ({apiKeys?.length ?? 0})</CardTitle>
            <CardDescription>
              Keys are shown once on creation. Secret value is never listed.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ApiKeysTable keys={apiKeys ?? []} />
            {canCreateApiKeys && <CreateApiKeyForm clientId={clientId} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function UsersTable({
  users,
}: {
  users: {
    _id: string;
    username: string;
    email: string;
    role: string;
    isActive?: boolean;
  }[];
}) {
  if (users.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No users for this client.</p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="py-2 pr-4 font-medium">Username</th>
            <th className="py-2 pr-4 font-medium">Email</th>
            <th className="py-2 pr-4 font-medium">Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id} className="border-b border-border/60">
              <td className="py-2 pr-4 font-medium">{u.username}</td>
              <td className="py-2 pr-4 text-muted-foreground">{u.email}</td>
              <td className="py-2 pr-4">
                <Badge variant="muted">{u.role.replace("_", " ")}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ApiKeysTable({
  keys,
}: {
  keys: {
    _id: string;
    name: string;
    environment?: string;
    isActive?: boolean;
    expiresAt?: string;
  }[];
}) {
  if (keys.length === 0) {
    return <p className="text-sm text-muted-foreground">No API keys yet.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="py-2 pr-4 font-medium">Name</th>
            <th className="py-2 pr-4 font-medium">Env</th>
            <th className="py-2 pr-4 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {keys.map((k) => (
            <tr key={k._id} className="border-b border-border/60">
              <td className="py-2 pr-4 font-medium">{k.name}</td>
              <td className="py-2 pr-4 text-muted-foreground">
                {k.environment ?? "—"}
              </td>
              <td className="py-2 pr-4">
                <Badge variant={k.isActive ? "success" : "muted"}>
                  {k.isActive ? "active" : "revoked"}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CreateApiKeyForm({ clientId }: { clientId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [environment, setEnvironment] = useState("production");
  const [created, setCreated] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const create = useCreateApiKey(clientId);

  function maskApiKey(value: string) {
    if (value.length <= 6) {
      return `${value.slice(0, 2)}****`;
    }

    return `${value.slice(0, 3)}****${value.slice(-4)}`;
  }

  async function copyApiKey(value: string) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
        return;
      }

      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setFormError("Unable to copy the API key. Please copy it manually.");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setCreated(null);
    try {
      const res = await create.mutateAsync({ name, description, environment });
      if (res.keyValue) setCreated(res.keyValue);
      setName("");
      setDescription("");
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Failed to create API key.",
      );
    }
  }

  return (
    <div className="rounded-lg border border-border p-3">
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen((o) => !o)}
        className="mb-2"
      >
        {open ? "Cancel" : "New API key"}
      </Button>

      {created && (
        <div className="mb-3 rounded-md bg-muted p-2">
          <p className="text-xs text-muted-foreground">
            Copy this key now — it won&apos;t be shown again.
          </p>
          <button
            type="button"
            onClick={() => copyApiKey(created)}
            className="block w-full rounded px-0 py-1 text-left text-xs text-foreground hover:underline"
            aria-label="Copy API key"
          >
            <code className="block break-all">{maskApiKey(created)}</code>
          </button>
          <Button
            size="sm"
            variant="ghost"
            type="button"
            className="mt-1"
            onClick={() => copyApiKey(created)}
          >
            {copied ? "Copied to clipboard" : "Copy"}
          </Button>
          {copied && (
            <p className="mt-2 text-xs font-medium text-emerald-400">
              Copied API key to clipboard.
            </p>
          )}
        </div>
      )}

      {open && (
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="keyName">Name</Label>
            <Input
              id="keyName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="keyDesc">Description</Label>
            <Input
              id="keyDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="keyEnv">Environment</Label>
            <select
              id="keyEnv"
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            >
              <option value="development">development</option>
              <option value="staging">staging</option>
              <option value="production">production</option>
              <option value="testing">testing</option>
            </select>
          </div>
          {formError && (
            <p className="text-sm text-destructive">{formError}</p>
          )}
          <Button type="submit" size="sm" disabled={create.isPending}>
            {create.isPending ? "Creating…" : "Create key"}
          </Button>
        </form>
      )}
    </div>
  );
}

function CreateUserForm({ clientId }: { clientId: string }) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client_viewer");
  const [formError, setFormError] = useState<string | null>(null);
  const create = useCreateUser(clientId);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    try {
      await create.mutateAsync({ username, email, password, role });
      setUsername("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Failed to create user.",
      );
    }
  }

  return (
    <div className="rounded-lg border border-border p-3">
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen((o) => !o)}
        className="mb-2"
      >
        {open ? "Cancel" : "New user"}
      </Button>

      {open && (
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="uName">Username</Label>
            <Input
              id="uName"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="uEmail">Email</Label>
            <Input
              id="uEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="uPass">Password</Label>
            <Input
              id="uPass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="uRole">Role</Label>
            <select
              id="uRole"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            >
              <option value="client_viewer">client_viewer</option>
              <option value="client_admin">client_admin</option>
            </select>
          </div>
          {formError && (
            <p className="text-sm text-destructive">{formError}</p>
          )}
          <Button type="submit" size="sm" disabled={create.isPending}>
            {create.isPending ? "Creating…" : "Create user"}
          </Button>
        </form>
      )}
    </div>
  );
}
