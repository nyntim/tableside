import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { spacing, typography } from '../theme/tokens';
import { useResponsive } from '../hooks';
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

export function Nav({ items, header, footer }: NavProps) {
  const { colors } = useTheme();
  const { isDesktop } = useResponsive();

  if (!isDesktop) {
    return (
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        {items.slice(0, 5).map((item) => (
          <Pressable key={item.key} onPress={item.onPress} style={styles.tabItem}>
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
        ))}
      </View>
    );
  }

  return (
    <View style={[styles.sidebar, { backgroundColor: colors.surface, borderRightColor: colors.border }]}>
      {header ? <View style={styles.header}>{header}</View> : null}
      <ScrollView contentContainerStyle={styles.navItems}>
        {items.map((item) => (
          <Pressable
            key={item.key}
            onPress={item.onPress}
            style={[
              styles.navItem,
              item.active && { backgroundColor: colors.surfaceMuted },
            ]}
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
        ))}
      </ScrollView>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 240,
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
    borderRadius: 8,
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
  },
});
