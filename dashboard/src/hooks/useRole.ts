"use client";

import { useProfile } from "@/hooks/useAuth";
import type { Role, User } from "@/lib/api/dto";

export interface RoleFlags {
  user: User | undefined;
  isLoading: boolean;
  isError: boolean;
  role: Role | undefined;
  isSuperAdmin: boolean;
  isClientAdmin: boolean;
  isClientViewer: boolean;
  clientId: string | null | undefined;
  canManageUsers: boolean;
  canCreateApiKeys: boolean;
  canViewAnalytics: boolean;
  canExportData: boolean;
}

function resolvePermissions(user: User | undefined) {
  const role = user?.role;
  const isSuperAdmin = role === "super_admin";

  const perms = user?.permissions ?? {};
  const canManageUsers = isSuperAdmin || Boolean(perms.canManagerUsers);
  const canCreateApiKeys = isSuperAdmin || Boolean(perms.canCreateApiKeys);
  const canViewAnalytics = isSuperAdmin || Boolean(perms.canViewAnalytics);
  const canExportData = isSuperAdmin || Boolean(perms.canExportData);

  return {
    role,
    isSuperAdmin,
    isClientAdmin: role === "client_admin",
    isClientViewer: role === "client_viewer",
    clientId: user?.clientId ?? null,
    canManageUsers,
    canCreateApiKeys,
    canViewAnalytics,
    canExportData,
  };
}

export function useRole(): RoleFlags {
  const { data: user, isLoading, isError } = useProfile();
  return {
    user,
    isLoading,
    isError,
    ...resolvePermissions(user),
  };
}
