import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Badge,
  Button,
  Card,
  Drawer,
  EmptyState,
  ErrorState,
  Input,
  Modal,
  MoneyText,
  Select,
  Skeleton,
  SkeletonGroup,
  StatCard,
  StatusBadge,
  Table,
  spacing,
  typography,
  useTheme,
} from '@tableside/ui';

export default function UiLibraryScreen() {
  const router = useRouter();
  const { colors, toggleMode, mode } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[typography['2xl'], { color: colors.text, fontWeight: '700' }]}>UI Library</Text>
        <Button label="Close" variant="ghost" onPress={() => router.back()} />
      </View>

      <Text style={[typography.sm, { color: colors.textMuted }]}>
        Design system primitives from @tableside/ui — theme mode: {mode}
      </Text>
      <Button label="Toggle theme" variant="secondary" onPress={toggleMode} />

      <View style={styles.row}>
        <StatCard label="Revenue" value={<MoneyText cents={125000} emphasize />} hint="Sample stat" />
        <StatCard label="Orders" value="42" trend="+12% vs last week" trendUp />
      </View>

      <Card title="Buttons">
        <View style={styles.row}>
          <Button label="Primary" />
          <Button label="Secondary" variant="secondary" />
          <Button label="Ghost" variant="ghost" />
          <Button label="Danger" variant="danger" />
          <Button label="Loading" loading />
        </View>
      </Card>

      <Card title="Form controls">
        <Input label="Text input" placeholder="Type here" />
        <Select
          label="Select"
          options={[
            { label: 'Option A', value: 'a' },
            { label: 'Option B', value: 'b' },
          ]}
          value="a"
          onChange={() => undefined}
        />
      </Card>

      <Card title="Badges & status">
        <View style={styles.row}>
          <Badge label="Default" />
          <Badge label="Success" variant="success" />
          <Badge label="Warning" variant="warning" />
          <Badge label="Error" variant="error" />
          <StatusBadge status="preparing" />
          <StatusBadge status="completed" />
        </View>
      </Card>

      <Card title="Table">
        <Table
          columns={[
            { key: 'name', header: 'Item', flex: 1, render: (row) => <Text>{row.name}</Text> },
            { key: 'price', header: 'Price', flex: 0.6, render: (row) => <MoneyText cents={row.price} /> },
          ]}
          data={[
            { id: '1', name: 'Margherita', price: 1299 },
            { id: '2', name: 'Caesar Salad', price: 899 },
          ]}
          keyExtractor={(row) => row.id}
        />
      </Card>

      <Card title="Feedback states">
        <SkeletonGroup count={2} />
        <EmptyState title="Nothing here yet" description="Sample empty state" />
        <ErrorState message="Sample error state" />
      </Card>

      <View style={styles.row}>
        <Button label="Open drawer" onPress={() => setDrawerOpen(true)} />
        <Button label="Open modal" variant="secondary" onPress={() => setModalOpen(true)} />
      </View>

      <Drawer visible={drawerOpen} title="Drawer" onClose={() => setDrawerOpen(false)}>
        <Text style={{ color: colors.text }}>Drawer content from the design system.</Text>
      </Drawer>

      <Modal
        visible={modalOpen}
        title="Modal"
        onRequestClose={() => setModalOpen(false)}
        onCancel={() => setModalOpen(false)}
        onConfirm={() => setModalOpen(false)}
      >
        <Text style={{ color: colors.textMuted }}>Modal dialog example.</Text>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing[6],
    gap: spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
});
