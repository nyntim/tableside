import { defineConfig } from 'orval';

export default defineConfig({
  odyssey: {
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
          useQuery: true,
          useMutation: true,
          useInfinite: false,
        },
      },
    },
  },
});
