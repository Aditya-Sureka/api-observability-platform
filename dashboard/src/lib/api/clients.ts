import { api } from "./client";

export interface Client {
  _id: string;
  name: string;
  slug: string;
  email: string;
  description?: string;
  website?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientUser {
  _id: string;
  username: string;
  email: string;
  role: string;
  clientId?: string | null;
  isActive?: boolean;
  permissions?: Record<string, boolean>;
  createdAt?: string;
}

export interface ClientApiKey {
  _id: string;
  keyId: string;
  name: string;
  description?: string;
  environment?: string;
  isActive?: boolean;
  expiresAt?: string;
  createdAt?: string;
}

export interface ClientsList {
  clients: Client[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface PaginatedClientsEnvelope {
  data: Client[];
  pagination?: ClientsList["pagination"];
}

export const clientApi = {
  listClients: async (params?: { page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    const q = qs.toString();

    const envelope = await api.getEnvelope<PaginatedClientsEnvelope>(
      `/api/admin/clients${q ? `?${q}` : ""}`,
    );

    const page = params?.page ?? envelope.pagination?.page ?? 1;
    const limit = params?.limit ?? envelope.pagination?.limit ?? 50;
    const clients = envelope.data ?? [];
    const total = envelope.pagination?.total ?? clients.length;
    const totalPages =
      envelope.pagination?.totalPages ??
      (limit > 0 ? Math.ceil(total / limit) : 1);

    return {
      clients,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  },

  getClient: (id: string) => api.get<Client>(`/api/admin/clients/${id}`),

  listClientUsers: (id: string) =>
    api.get<ClientUser[]>(`/api/admin/clients/${id}/users`),

  listClientApiKeys: (id: string) =>
    api.get<ClientApiKey[]>(`/api/admin/clients/${id}/api-keys`),

  createApiKey: (
    id: string,
    data: { name: string; description?: string; environment?: string },
  ) =>
    api.post<ClientApiKey & { keyValue?: string }>(
      `/api/admin/clients/${id}/api-keys`,
      data,
    ),

  createUser: (
    id: string,
    data: {
      username: string;
      email: string;
      password: string;
      role?: string;
    },
  ) => api.post<ClientUser>(`/api/admin/clients/${id}/users`, data),
};
