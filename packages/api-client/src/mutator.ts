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

type FetchConfig = RequestInit & {
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

async function request<T>(
  path: string,
  init?: RequestInit,
  includeResponseMetadata = false,
): Promise<T> {
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

  const data = response.status === 204 ? undefined : await response.json();

  if (includeResponseMetadata) {
    return {
      data,
      status: response.status,
      headers: response.headers,
    } as T;
  }

  return data as T;
}

/** Orval mutator entrypoint (url + RequestInit). */
export async function customFetch<T>(url: string, init?: RequestInit): Promise<T> {
  return request<T>(url, init, true);
}

export { API_BASE_URL };
