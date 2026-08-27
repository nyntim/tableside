/** Unwrap Orval fetch responses that include `{ status, data }` envelopes. */
export function unwrapResponse<T>(
  response?: { status: number; data: unknown; headers?: Headers } | null,
): T | undefined {
  if (!response || response.status < 200 || response.status >= 300) {
    return undefined;
  }
  return response.data as T;
}
