import { defineConfig } from 'orval';

export default defineConfig({
  tableside: {
    input: {
      target: '../../services/backend/openapi/openapi.json',
    },
    output: {
      mode: 'tags-split',
      target: './src/generated',
      schemas: './src/generated/models',
      client: 'react-query',
      httpClient: 'fetch',
      mock: true,
      clean: true,
      override: {
        mutator: {
          path: './src/mutator.ts',
          name: 'customFetch',
        },
        query: {
          version: 5,
        },
      },
    },
  },
});
