const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:8799';

export class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export type FetchConfig = RequestInit & {
  params?: Record<string, string | number | boolean | undefined | null>;
  url: string;
};

function buildUrl(path: string, params?: FetchConfig['params']) {
  const url = new URL(path, API_BASE_URL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildUrl(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let payload: { error?: { code?: string; message?: string; details?: Record<string, unknown> } } =
      {};
    try {
      payload = await response.json();
    } catch {
      // ignore parse errors
    }
    throw new ApiRequestError(
      response.status,
      payload.error?.code ?? 'UNKNOWN_ERROR',
      payload.error?.message ?? response.statusText,
      payload.error?.details,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

/** Orval mutator entrypoint (url + RequestInit). */
export async function customFetch<T>(url: string, init?: RequestInit): Promise<T> {
  return request<T>(url, init);
}

/** Legacy config-style helper for manual calls. */
export async function fetchApi<T>(config: FetchConfig): Promise<T> {
  const { url, params, headers, body, ...rest } = config;
  const builtUrl = buildUrl(url, params);
  return request<T>(builtUrl.replace(API_BASE_URL, ''), {
    ...rest,
    headers,
    body: body ?? undefined,
  });
}

export { API_BASE_URL };
