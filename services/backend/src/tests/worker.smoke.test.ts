import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import worker from '../index.js';

describe('worker smoke', () => {
  it('handles health via worker fetch handler', async () => {
    const request = new Request('http://example.com/health');
    const ctx = createExecutionContext();
    const response = await worker.fetch(request, env, ctx);
    await waitOnExecutionContext(ctx);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });
});
