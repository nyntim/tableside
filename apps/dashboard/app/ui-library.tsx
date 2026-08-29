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
  Money,
  Select,
  Skeleton,
  SkeletonGroup,
  StatCard,
  StatusBadge,
  Table,
  Timeline,
  palette,
  radius,
  spacing,
  typography,
  useToast,
  useTheme,
} from '@tableside/ui';

export default function UiLibraryScreen() {
  const router = useRouter();
  const { colors, toggleMode, mode } = useTheme();
  const { show } = useToast();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

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

      <Card title="Tokens" subtitle="Shared from @tableside/shared and consumed by NativeWind">
        <View style={styles.row}>
          {Object.entries(palette)
            .filter(([, value]) => typeof value === 'string' && value.startsWith('#'))
            .map(([name, value]) => (
              <View key={name} style={styles.token}>
                <View style={[styles.swatch, { backgroundColor: value }]} />
                <Text style={[typography.xs, { color: colors.text }]}>{name}</Text>
              </View>
            ))}
        </View>
        <Text style={[typography.sm, { color: colors.textMuted }]}>
          Spacing: 4 · 8 · 12 · 16 · 24 · 32 · 48
        </Text>
        <Text style={[typography.sm, { color: colors.textMuted }]}>
          Radius: 8px surfaces and inputs · 999px buttons and badges
        </Text>
      </Card>

      <View style={styles.row}>
        <StatCard label="Revenue" value={<Money cents={125000} emphasize />} hint="Sample stat" />
        <StatCard label="Orders" value="42" trend="+12% vs last week" trendUp />
      </View>

      <Card title="Buttons">
        <View style={styles.row}>
          <Button label="Primary" />
          <Button label="Secondary" variant="secondary" />
          <Button label="Ghost" variant="ghost" />
          <Button label="Danger" variant="danger" />
          <Button label="Loading" loading />
          <Button label="Disabled" disabled />
        </View>
      </Card>

      <Card title="Form controls">
        <Input label="Text input" placeholder="Type here" />
        <Input label="Error input" value="Invalid value" error="Review this field" />
        <Input label="Disabled input" value="Unavailable" editable={false} />
        <Select
          label="Select"
          options={[
            { label: 'Option A', value: 'a' },
            { label: 'Option B', value: 'b' },
          ]}
          value="a"
          onChange={() => undefined}
        />
        <Select
          label="Disabled select"
          options={[{ label: 'Option A', value: 'a' }]}
          value="a"
          disabled
          onChange={() => undefined}
        />
      </Card>

      <Card title="Badges & status">
        <View style={styles.row}>
          <Badge label="Default" />
          <Badge label="VIP" variant="outline" />
          <Badge label="Active" variant="success" />
          <Badge label="Warning" variant="warning" />
          <Badge label="Error" variant="error" />
          <StatusBadge status="confirmed" />
          <StatusBadge status="preparing" />
          <StatusBadge status="completed" />
        </View>
      </Card>

      <Card title="Table">
        <Table
          columns={[
            {
              key: 'name',
              header: 'Item',
              flex: 1,
              sortable: true,
              sortValue: (row) => row.name,
              render: (row) => <Text style={{ color: colors.text }}>{row.name}</Text>,
            },
            {
              key: 'price',
              header: 'Price',
              flex: 0.6,
              minWidth: 104,
              sortable: true,
              sortValue: (row) => row.price,
              render: (row) => <Money cents={row.price} size="small" />,
            },
          ]}
          data={[
            { id: '1', name: 'Margherita', price: 1299 },
            { id: '2', name: 'Caesar Salad', price: 899 },
          ]}
          keyExtractor={(row) => row.id}
          selectable
          selectedKeys={selectedRows}
          onSelectionChange={setSelectedRows}
        />
      </Card>

      <Card title="Timeline">
        <Timeline
          entries={[
            { id: '1', label: 'Placed', timestamp: '10:24 AM' },
            { id: '2', label: 'Confirmed', timestamp: '10:25 AM' },
            { id: '3', label: 'Preparing', timestamp: '10:28 AM', tone: 'warning' },
            { id: '4', label: 'Ready', timestamp: '10:47 AM', tone: 'success' },
          ]}
        />
        <Timeline
          entries={[
            { id: 'ord-1', label: 'ORD-1001 · completed', timestamp: 'Mon 4:12 PM', detail: '$24.00', tone: 'success' },
            { id: 'ord-2', label: 'ORD-0998 · cancelled', timestamp: 'Sun 1:03 PM', detail: '$18.50', tone: 'error' },
          ]}
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
        <Button
          label="Show toast"
          variant="ghost"
          onPress={() => show({ title: 'Changes saved', variant: 'success' })}
        />
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
  token: { width: 96, gap: spacing[1] },
  swatch: { width: 96, height: 48, borderRadius: radius.md },
});
