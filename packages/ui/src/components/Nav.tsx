import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { palette, radius, spacing, typography } from '../theme/tokens';
import { useInteractionState, useResponsive } from '../hooks';
import { useTheme } from '../theme/ThemeProvider';

export type NavItem = {
  key: string;
  label: string;
  icon?: string;
  href: string;
  active?: boolean;
  onPress: () => void;
};

export type NavProps = {
  items: NavItem[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
};

function focusRing(color: string, focused: boolean): ViewStyle | undefined {
  if (!focused) return undefined;
  return {
    borderColor: color,
    outlineWidth: 2,
    outlineColor: color,
    outlineStyle: 'solid',
    outlineOffset: 2,
  };
}

function SidebarNavItem({ item }: { item: NavItem }) {
  const { colors } = useTheme();
  const { hovered, focused, handlers } = useInteractionState();

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityState={{ selected: !!item.active }}
      onPress={item.onPress}
      style={[
        styles.navItem,
        item.active && { backgroundColor: colors.surface },
        hovered && !item.active && { backgroundColor: colors.surfaceHover },
        focusRing(colors.primary, focused),
      ]}
      {...handlers}
    >
      <Text style={{ fontSize: 16, width: 24 }}>{item.icon ?? '•'}</Text>
      <Text
        style={[
          typography.sm,
          {
            color: item.active ? colors.primary : colors.text,
            fontWeight: item.active ? '600' : '400',
          },
        ]}
      >
        {item.label}
      </Text>
    </Pressable>
  );
}

function TabNavItem({ item }: { item: NavItem }) {
  const { colors } = useTheme();
  const { focused, handlers } = useInteractionState();

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: !!item.active }}
      onPress={item.onPress}
      style={[styles.tabItem, focusRing(colors.primary, focused)]}
      {...handlers}
    >
      <Text style={{ fontSize: 18 }}>{item.icon ?? '•'}</Text>
      <Text
        style={[
          typography.xs,
          {
            color: item.active ? colors.primary : colors.textMuted,
            fontWeight: item.active ? '600' : '400',
          },
        ]}
      >
        {item.label}
      </Text>
    </Pressable>
  );
}

export function Nav({ items, header, footer }: NavProps) {
  const { colors } = useTheme();
  const { isDesktop } = useResponsive();

  if (!isDesktop) {
    return (
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        {items.slice(0, 5).map((item) => (
          <TabNavItem key={item.key} item={item} />
        ))}
      </View>
    );
  }

  return (
    <View style={[styles.sidebar, { backgroundColor: palette.sidebar, borderRightColor: colors.border }]}>
      {header ? <View style={styles.header}>{header}</View> : null}
      <ScrollView contentContainerStyle={styles.navItems}>
        {items.map((item) => (
          <SidebarNavItem key={item.key} item={item} />
        ))}
      </ScrollView>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 208,
    borderRightWidth: 1,
    height: '100%',
  },
  header: {
    padding: spacing[4],
  },
  navItems: {
    padding: spacing[2],
    gap: spacing[1],
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    outlineWidth: 0,
  },
  footer: {
    marginTop: 'auto',
    padding: spacing[4],
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[1],
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing[1],
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    outlineWidth: 0,
  },
});
