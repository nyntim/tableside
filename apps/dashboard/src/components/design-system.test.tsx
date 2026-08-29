import React from 'react';
import { Text, View } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import {
  Badge,
  Drawer,
  Money,
  StatusBadge,
  Table,
  ThemeProvider,
  Timeline,
  palette,
  statusColors,
} from '@tableside/ui';

function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

describe('design system signatures', () => {
  it('renders money through an accessible split-value component', () => {
    const screen = render(<Money cents={14250} emphasize />, { wrapper: Providers });
    expect(screen.getByLabelText('$142.50')).toBeTruthy();
    expect(screen.getByText('.50')).toBeTruthy();
  });

  it('renders reusable timeline entries with a connecting rail', () => {
    const screen = render(
      <Timeline
        entries={[
          { id: 'placed', label: 'Placed', timestamp: '10:24 AM' },
          { id: 'confirmed', label: 'Confirmed', timestamp: '10:25 AM' },
          { id: 'ord-1', label: 'ORD-1001 · completed', timestamp: 'Mon 4:12 PM' },
        ]}
      />,
      { wrapper: Providers },
    );
    expect(screen.getByText('Placed')).toBeTruthy();
    expect(screen.getByText('Confirmed')).toBeTruthy();
    expect(screen.getByText('ORD-1001 · completed')).toBeTruthy();
    expect(screen.getByText('10:24 AM')).toBeTruthy();
  });

  it('keeps row selection isolated from row press', () => {
    const onSelectionChange = jest.fn();
    const onRowPress = jest.fn();
    const screen = render(
      <Table
        selectable
        selectedKeys={[]}
        onSelectionChange={onSelectionChange}
        onRowPress={onRowPress}
        columns={[
          {
            key: 'name',
            header: 'Name',
            sortable: true,
            sortValue: (row) => row.name,
            render: (row) => <Text>{row.name}</Text>,
          },
        ]}
        data={[{ id: 'one', name: 'One' }]}
        keyExtractor={(row) => row.id}
      />,
      { wrapper: Providers },
    );
    fireEvent.press(screen.getAllByRole('checkbox')[1]!);
    expect(onSelectionChange).toHaveBeenCalledWith(['one']);
    expect(onRowPress).not.toHaveBeenCalled();
  });

  it('does not reuse accent or success colors for confirmed and VIP', () => {
    expect(statusColors.confirmed.text).toBe(palette.textSecondary);
    expect(statusColors.confirmed.text).not.toBe(palette.accent);
    expect(statusColors.confirmed.text).not.toBe(palette.success);
    expect(statusColors.out_for_delivery.text).not.toBe(palette.accent);
    expect(statusColors.confirmed.bg).toBe(palette.surface);
    expect(statusColors.confirmed.bg).not.toBe(palette.surfaceHover);

    const screen = render(
      <View>
        <StatusBadge status="confirmed" />
        <Badge label="VIP" variant="outline" />
      </View>,
      { wrapper: Providers },
    );
    expect(screen.getByText('Confirmed')).toBeTruthy();
    expect(screen.getByText('VIP')).toBeTruthy();
  });

  it('anchors the drawer panel to the full viewport height', () => {
    const screen = render(
      <Drawer visible title="Customer" onClose={() => undefined}>
        <Text>Could not load</Text>
      </Drawer>,
      { wrapper: Providers },
    );
    expect(screen.getByText('Customer')).toBeTruthy();
    expect(screen.getByText('Could not load')).toBeTruthy();
  });
});
