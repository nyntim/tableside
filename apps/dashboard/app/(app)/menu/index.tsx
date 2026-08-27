import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  MoneyText,
  Select,
  SkeletonGroup,
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
    createCategory,
    createItem,
    updateItem,
    deleteItem,
  } = useMenuManagement();

  const [categoryName, setCategoryName] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCategoryId, setItemCategoryId] = useState('');

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  if (isLoading) {
    return (
      <View style={{ padding: spacing[6], backgroundColor: colors.background, flex: 1 }}>
        <SkeletonGroup count={5} />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <Text style={[typography['2xl'], { color: colors.text, fontWeight: '700' }]}>Menu</Text>
      <Text style={[typography.sm, { color: colors.textMuted }]}>Categories and menu item CRUD</Text>

      <Card title="Add category">
        <Input label="Category name" value={categoryName} onChangeText={setCategoryName} />
        <Button
          label="Create category"
          onPress={() => {
            if (categoryName.trim()) {
              createCategory({ name: categoryName.trim() });
              setCategoryName('');
            }
          }}
        />
      </Card>

      <Card title="Add menu item">
        <Select label="Category" options={categoryOptions} value={itemCategoryId} onChange={setItemCategoryId} />
        <Input label="Item name" value={itemName} onChangeText={setItemName} />
        <Input
          label="Price (cents)"
          value={itemPrice}
          onChangeText={setItemPrice}
          keyboardType="number-pad"
        />
        <Button
          label="Create item"
          onPress={() => {
            const priceCents = Number(itemPrice);
            if (itemCategoryId && itemName.trim() && priceCents >= 0) {
              createItem({ categoryId: itemCategoryId, name: itemName.trim(), priceCents });
              setItemName('');
              setItemPrice('');
            }
          }}
        />
      </Card>

      <Select
        label="Filter by category"
        options={[{ label: 'All categories', value: '' }, ...categoryOptions]}
        value={selectedCategoryId ?? ''}
        onChange={(value) => setSelectedCategoryId(value || undefined)}
      />

      {items.length === 0 ? (
        <EmptyState title="No menu items" description="Create a category and item to get started." />
      ) : (
        items.map((item) => (
          <Card key={item.id} title={item.name} subtitle={item.description ?? undefined}>
            <MoneyText cents={item.priceCents} emphasize />
            <Text style={[typography.sm, { color: colors.textMuted, marginTop: spacing[2] }]}>
              {item.isAvailable ? 'Available' : 'Unavailable'}
            </Text>
            <View style={styles.itemActions}>
              <Button
                label={item.isAvailable ? 'Mark unavailable' : 'Mark available'}
                variant="secondary"
                size="sm"
                onPress={() => updateItem(item.id, { isAvailable: !item.isAvailable })}
              />
              <Button label="Delete" variant="danger" size="sm" onPress={() => deleteItem(item.id)} />
            </View>
          </Card>
        ))
      )}

      <Card title="Categories">
        {categories.map((category) => (
          <Text key={category.id} style={{ color: colors.text, paddingVertical: spacing[1] }}>
            {category.name} ({category.itemCount ?? 0} items)
          </Text>
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing[6],
    gap: spacing[4],
  },
  itemActions: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[3],
  },
});
