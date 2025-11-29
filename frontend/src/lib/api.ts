import { API_BASE_URL } from "./config";
import { supabase } from "./supabaseClient";

const API_PREFIX = "/api/v1";
const normalizedBaseUrl = `${API_BASE_URL}${API_PREFIX}`;

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

type ApiFetchOptions = RequestInit & {
  searchParams?: Record<string, string | number | boolean | undefined>;
  accessToken?: string | null;
};

const buildUrl = (path: string, searchParams?: ApiFetchOptions["searchParams"]) => {
  const url = new URL(path.replace(/^\//, ""), normalizedBaseUrl.endsWith("/") ? normalizedBaseUrl : `${normalizedBaseUrl}/`);

  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
};

const maybeGetAccessTokenFromSupabase = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
};

export async function apiFetch<T>(path: string, options?: ApiFetchOptions): Promise<T> {
  const { searchParams, accessToken, ...fetchOptions } = options ?? {};
  const token = accessToken ?? (await maybeGetAccessTokenFromSupabase());
  const url = buildUrl(path, searchParams);
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers ?? {}),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  const payload = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new ApiError("API request failed", response.status, payload);
  }

  return payload as T;
}

// Example typed helpers that mirror the default FastAPI scaffold.
export interface WorkLogEntryDTO {
  id: number;
  work_date: string;
  hours: number;
  description?: string | null;
  user_id?: string | null;
  tag?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkLogCreateDTO {
  work_date: string;
  hours: number;
  description?: string;
  tag?: string;
}

export const api = {
  listWorkLogEntries: (accessToken?: string) =>
    apiFetch<WorkLogEntryDTO[]>("/work-log", {
      accessToken,
    }),
  createWorkLogEntry: (payload: WorkLogCreateDTO, accessToken: string) =>
    apiFetch<WorkLogEntryDTO>("/work-log", {
      method: "POST",
      body: JSON.stringify(payload),
      accessToken,
    }),
  deleteWorkLogEntry: (id: number, accessToken: string) =>
    apiFetch<{ message: string }>(`/work-log/${id}`, {
      method: "DELETE",
      accessToken,
    }),
};
