import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useGetMetricsSummary } from '@tableside/api-client';
import type { GetMetricsSummary200, GetMetricsSummaryRange } from '@tableside/api-client';
import { unwrapResponse } from '@/lib/api';

export function useHomeMetrics() {
  const [range, setRange] = useState<GetMetricsSummaryRange>('7d');
  const query = useGetMetricsSummary({ range });

  return {
    metrics: unwrapResponse<GetMetricsSummary200>(query.data),
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    range,
    setRange,
  };
}
