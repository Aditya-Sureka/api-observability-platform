export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Typed fetch wrapper for the monitoring backend.
 *
 * - Always sends credentials (httpOnly `authToken` cookie).
 * - Parses the backend `ResponseFormatter` envelope ({ success, message, data, ... })
 *   and returns `data`.
 * - Throws `ApiError` with status + server message on non-2xx.
 */
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  const res = await fetch(`${base}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let body: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    if (res.status === 401) {
      if (typeof window !== "undefined") {
        window.location.assign("/login");
      }
      throw new ApiError("Unauthorized", 401, body);
    }
    const message =
      (body as { message?: string })?.message || res.statusText || "Request failed";
    throw new ApiError(message, res.status, body);
  }

  if (body && typeof body === "object" && "data" in body) {
    return (body as { data: T }).data;
  }
  return body as T;
}

async function requestEnvelope<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  const res = await fetch(`${base}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let body: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    if (res.status === 401) {
      if (typeof window !== "undefined") {
        window.location.assign("/login");
      }
      throw new ApiError("Unauthorized", 401, body);
    }
    const message =
      (body as { message?: string })?.message || res.statusText || "Request failed";
    throw new ApiError(message, res.status, body);
  }

  return body as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  getEnvelope: <T>(path: string) => requestEnvelope<T>(path, { method: "GET" }),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "POST", body: data ? JSON.stringify(data) : undefined }),
};
