import { useMemo, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import {
  useDeleteMenuCategoriesId,
  useDeleteMenuItemsId,
  useGetMenuCategories,
  useGetMenuItems,
  usePatchMenuCategoriesId,
  usePatchMenuItemsId,
  usePostMenuCategories,
  usePostMenuItems,
} from '@tableside/api-client';
import type { GetMenuCategories200Item, GetMenuItems200Item } from '@tableside/api-client';
import { useToast } from '@tableside/ui';
import { unwrapResponse } from '@/lib/api';

export function useMenuManagement() {
  const params = useLocalSearchParams<{ selected?: string; new?: string }>();
  const { show } = useToast();
  const categoriesQuery = useGetMenuCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [editorItemId, setEditorItemId] = useState<string | undefined>(params.selected);
  const [isCreatingItem, setIsCreatingItem] = useState(params.new === '1');
  const itemsQuery = useGetMenuItems(
    selectedCategoryId ? { categoryId: selectedCategoryId } : undefined,
  );

  const createCategory = usePostMenuCategories();
  const updateCategory = usePatchMenuCategoriesId();
  const deleteCategory = useDeleteMenuCategoriesId();
  const createItem = usePostMenuItems();
  const updateItem = usePatchMenuItemsId();
  const deleteItem = useDeleteMenuItemsId();

  const categories = unwrapResponse<GetMenuCategories200Item[]>(categoriesQuery.data) ?? [];
  const items = unwrapResponse<GetMenuItems200Item[]>(itemsQuery.data) ?? [];

  const categoryOptions = useMemo(
    () => categories.map((category) => ({ label: category.name, value: category.id })),
    [categories],
  );

  const wrap = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      show({ title: success, variant: 'success' });
      await categoriesQuery.refetch();
      await itemsQuery.refetch();
    } catch (error) {
      show({
        title: 'Action failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'error',
      });
    }
  };

  return {
    categories,
    items,
    categoryOptions,
    selectedCategoryId,
    setSelectedCategoryId,
    editorItem: items.find((item) => item.id === editorItemId),
    isCreatingItem,
    openItem: (id: string) => {
      setEditorItemId(id);
      setIsCreatingItem(false);
    },
    openNewItem: () => {
      setEditorItemId(undefined);
      setIsCreatingItem(true);
    },
    closeEditor: () => {
      setEditorItemId(undefined);
      setIsCreatingItem(false);
    },
    isLoading: categoriesQuery.isLoading || itemsQuery.isLoading,
    isError: categoriesQuery.isError || itemsQuery.isError,
    refetch: () => {
      categoriesQuery.refetch();
      itemsQuery.refetch();
    },
    createCategory: (data: { name: string }) =>
      wrap(() => createCategory.mutateAsync({ data }), 'Category created'),
    updateCategory: (id: string, data: { name?: string; isActive?: boolean }) =>
      wrap(() => updateCategory.mutateAsync({ id, data }), 'Category updated'),
    deleteCategory: (id: string) =>
      wrap(() => deleteCategory.mutateAsync({ id }), 'Category deleted'),
    createItem: (data: {
      categoryId: string;
      name: string;
      priceCents: number;
      description?: string | null;
      imageUrl?: string | null;
      dietaryTags?: string[];
      isAvailable?: boolean;
    }) => wrap(() => createItem.mutateAsync({ data }), 'Item created'),
    updateItem: (
      id: string,
      data: {
        categoryId?: string;
        name?: string;
        priceCents?: number;
        isAvailable?: boolean;
        description?: string | null;
        imageUrl?: string | null;
        dietaryTags?: string[];
      },
    ) => wrap(() => updateItem.mutateAsync({ id, data }), 'Item updated'),
    deleteItem: (id: string) => wrap(() => deleteItem.mutateAsync({ id }), 'Item deleted'),
  };
}
