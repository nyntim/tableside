import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import {
  Badge,
  Button,
  Drawer,
  EmptyState,
  ErrorState,
  Input,
  Money,
  Select,
  SkeletonGroup,
  Table,
  radius,
  spacing,
  typography,
  useTheme,
} from '@tableside/ui';
import { useMenuManagement } from '@/features/menu/useMenuManagement';

export default function MenuScreen() {
  const { colors } = useTheme();
  const {
    categories,
    items,
    categoryOptions,
    selectedCategoryId,
    setSelectedCategoryId,
    isLoading,
    isError,
    refetch,
    createItem,
    updateItem,
    editorItem,
    isCreatingItem,
    openItem,
    openNewItem,
    closeEditor,
  } = useMenuManagement();

  if (isLoading) {
    return (
      <View style={{ padding: spacing[6], backgroundColor: colors.background, flex: 1 }}>
        <SkeletonGroup count={5} />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={[typography['3xl'], { color: colors.text }]}>Menu</Text>
          <Text style={[typography.sm, { color: colors.textMuted }]}>Manage items and availability</Text>
        </View>
        <Button label="+ Add item" onPress={openNewItem} />
      </View>
      {isError ? <ErrorState onRetry={refetch} message="Menu data could not be loaded." /> : null}
      <ScrollView horizontal contentContainerStyle={styles.tabs}>
        <Pressable
          onPress={() => setSelectedCategoryId(undefined)}
          style={({ hovered }) => [
            styles.tab,
            {
              backgroundColor: !selectedCategoryId
                ? colors.primary
                : hovered
                  ? colors.surfaceHover
                  : colors.surface,
              borderColor: !selectedCategoryId ? colors.primary : colors.border,
            },
          ]}
        >
          <Text style={[typography.sm, { color: !selectedCategoryId ? colors.primaryText : colors.text }]}>All items</Text>
        </Pressable>
        {categories.map((category) => (
          <Pressable
            key={category.id}
            onPress={() => setSelectedCategoryId(category.id)}
            style={({ hovered }) => [
              styles.tab,
              {
                backgroundColor:
                  selectedCategoryId === category.id
                    ? colors.primary
                    : hovered
                      ? colors.surfaceHover
                      : colors.surface,
                borderColor: selectedCategoryId === category.id ? colors.primary : colors.border,
              },
            ]}
          >
            <Text style={[typography.sm, { color: selectedCategoryId === category.id ? colors.primaryText : colors.text }]}>
              {category.name} · {category.itemCount ?? 0}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {items.length === 0 ? (
        <EmptyState title="No menu items" description="Add the first item in this category." actionLabel="Add item" onAction={openNewItem} />
      ) : (
        <Table
          data={items}
          keyExtractor={(item) => item.id}
          onRowPress={(item) => openItem(item.id)}
          columns={[
            {
              key: 'item',
              header: 'Item',
              flex: 1.6,
              minWidth: 220,
              sortable: true,
              sortValue: (item) => item.name,
              render: (item) => (
                <View style={styles.item}>
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
                  ) : (
                    <View style={[styles.thumbnail, { backgroundColor: colors.surface }]} />
                  )}
                  <View style={styles.itemMeta}>
                    <Text numberOfLines={1} style={[typography.sm, { color: colors.text, fontWeight: '600' }]}>
                      {item.name}
                    </Text>
                    <Text numberOfLines={1} style={[typography.xs, { color: colors.textMuted }]}>
                      {item.categoryName}
                    </Text>
                  </View>
                </View>
              ),
            },
            {
              key: 'price',
              header: 'Price',
              flex: 0.7,
              minWidth: 104,
              sortable: true,
              sortValue: (item) => item.priceCents,
              render: (item) => <Money cents={item.priceCents} size="small" />,
            },
            {
              key: 'availability',
              header: 'Availability',
              render: (item) => (
                <Switch
                  value={item.isAvailable}
                  trackColor={{ false: colors.border, true: colors.success }}
                  onValueChange={() => updateItem(item.id, { isAvailable: !item.isAvailable })}
                />
              ),
            },
            { key: 'status', header: 'Status', render: (item) => <Badge label={item.isAvailable ? 'Available' : 'Out of Stock'} variant={item.isAvailable ? 'success' : 'warning'} /> },
          ]}
        />
      )}
      <MenuEditor
        visible={isCreatingItem || !!editorItem}
        item={editorItem}
        categoryOptions={categoryOptions}
        onClose={closeEditor}
        onCreate={createItem}
        onUpdate={updateItem}
      />
    </ScrollView>
  );
}

type EditorItem = ReturnType<typeof useMenuManagement>['editorItem'];

function MenuEditor({
  visible,
  item,
  categoryOptions,
  onClose,
  onCreate,
  onUpdate,
}: {
  visible: boolean;
  item?: EditorItem;
  categoryOptions: Array<{ label: string; value: string }>;
  onClose: () => void;
  onCreate: ReturnType<typeof useMenuManagement>['createItem'];
  onUpdate: ReturnType<typeof useMenuManagement>['updateItem'];
}) {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [dietaryTags, setDietaryTags] = useState<string[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);
  useEffect(() => {
    setName(item?.name ?? '');
    setDescription(item?.description ?? '');
    setPrice(item ? String(item.priceCents / 100) : '');
    setCategoryId(item?.categoryId ?? categoryOptions[0]?.value ?? '');
    setImageUrl(item?.imageUrl ?? '');
    setDietaryTags(item?.dietaryTags ?? []);
    setIsAvailable(item?.isAvailable ?? true);
  }, [categoryOptions, item]);

  const save = async () => {
    const data = {
      categoryId,
      name: name.trim(),
      description: description.trim() || null,
      priceCents: Math.round(Number(price) * 100),
      imageUrl: imageUrl.trim() || null,
      dietaryTags,
      isAvailable,
    };
    if (!data.name || !data.categoryId || !Number.isFinite(data.priceCents)) return;
    if (item) await onUpdate(item.id, data);
    else await onCreate(data);
    onClose();
  };

  return (
    <Drawer visible={visible} title={item ? 'Edit menu item' : 'Add menu item'} onClose={onClose} width={480}>
      <View style={[styles.upload, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.preview} /> : null}
        <Text style={[typography.sm, { color: colors.text }]}>Drop an image here or paste its URL</Text>
        <Text style={[typography.xs, { color: colors.textMuted }]}>Image preview is stored as URL metadata.</Text>
      </View>
      <Input label="Image URL" value={imageUrl} onChangeText={setImageUrl} placeholder="https://…" />
      <Input label="Name" value={name} onChangeText={setName} />
      <Input label="Description" value={description} onChangeText={setDescription} multiline />
      <Input label="Price" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
      <Select label="Category" value={categoryId} options={categoryOptions} onChange={setCategoryId} />
      <View>
        <Text style={[typography.sm, { color: colors.text, marginBottom: spacing[2] }]}>Dietary tags</Text>
        <View style={styles.tags}>
          {['vegetarian', 'vegan', 'gluten-free', 'spicy'].map((tag) => (
            <Pressable
              key={tag}
              onPress={() =>
                setDietaryTags((current) =>
                  current.includes(tag) ? current.filter((value) => value !== tag) : [...current, tag],
                )
              }
              style={({ hovered }) => [
                styles.tab,
                {
                  backgroundColor: dietaryTags.includes(tag)
                    ? colors.primary
                    : hovered
                      ? colors.surfaceHover
                      : colors.surface,
                  borderColor: dietaryTags.includes(tag) ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[typography.xs, { color: dietaryTags.includes(tag) ? colors.primaryText : colors.text }]}>{tag}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={styles.availability}>
        <Text style={[typography.sm, { color: colors.text }]}>Available for ordering</Text>
        <Switch value={isAvailable} onValueChange={setIsAvailable} trackColor={{ false: colors.border, true: colors.success }} />
      </View>
      <Button label={item ? 'Save changes' : 'Add item'} onPress={save} />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing[6],
    gap: spacing[4],
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing[3] },
  tabs: { flexDirection: 'row', gap: spacing[2] },
  tab: { paddingHorizontal: spacing[3], paddingVertical: spacing[2], borderRadius: radius.full, borderWidth: 1 },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], minWidth: 0, flex: 1 },
  itemMeta: { flex: 1, minWidth: 0 },
  thumbnail: { width: 44, height: 44, borderRadius: radius.md, flexShrink: 0 },
  upload: { minHeight: 180, borderWidth: 1, borderStyle: 'dashed', borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', gap: spacing[2], overflow: 'hidden' },
  preview: { width: '100%', height: 120 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  availability: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
