"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth";
import { useRouter } from "next/navigation";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: authApi.profile,
    retry: false,
    staleTime: 5 * 60_000,
  });
}

export function useLogin() {
  const router = useRouter();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      username,
      password,
    }: {
      username: string;
      password: string;
    }) => authApi.login(username, password),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      router.replace("/dashboard");
    },
  });
}

export function useOnboardSuperAdmin() {
  const router = useRouter();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      username: string;
      email: string;
      password: string;
    }) => authApi.onboardSuperAdmin(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      router.replace("/dashboard");
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      qc.clear();
      router.replace("/login");
    },
  });
}
