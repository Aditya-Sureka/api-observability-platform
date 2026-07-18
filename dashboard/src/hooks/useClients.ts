"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { clientApi } from "@/lib/api/clients";

export function useClients(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["clients", params],
    queryFn: () => clientApi.listClients(params),
  });
}

export function useClient(id: string | undefined) {
  return useQuery({
    queryKey: ["client", id],
    queryFn: () => clientApi.getClient(id as string),
    enabled: !!id,
  });
}

export function useClientUsers(id: string | undefined) {
  return useQuery({
    queryKey: ["client-users", id],
    queryFn: () => clientApi.listClientUsers(id as string),
    enabled: !!id,
  });
}

export function useClientApiKeys(id: string | undefined) {
  return useQuery({
    queryKey: ["client-apikeys", id],
    queryFn: () => clientApi.listClientApiKeys(id as string),
    enabled: !!id,
  });
}

export function useCreateApiKey(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      environment?: string;
    }) => clientApi.createApiKey(id, data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["client-apikeys", id] }),
  });
}

export function useCreateUser(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      username: string;
      email: string;
      password: string;
      role?: string;
    }) => clientApi.createUser(id, data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["client-users", id] }),
  });
}
