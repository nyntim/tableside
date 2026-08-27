import { useGetSettings, usePatchSettings } from '@tableside/api-client';
import type { GetSettings200, PatchSettingsBody } from '@tableside/api-client';
import { useToast } from '@tableside/ui';
import { unwrapResponse } from '@/lib/api';

export function useSettingsForm() {
  const { show } = useToast();
  const query = useGetSettings();
  const updateSettings = usePatchSettings();
  const settings = unwrapResponse<GetSettings200>(query.data);

  const save = async (data: PatchSettingsBody) => {
    try {
      await updateSettings.mutateAsync({ data });
      show({ title: 'Settings saved', variant: 'success' });
      await query.refetch();
    } catch (error) {
      show({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'error',
      });
    }
  };

  return {
    settings,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    save,
    isSaving: updateSettings.isPending,
  };
}
