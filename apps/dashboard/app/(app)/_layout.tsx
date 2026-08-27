import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Nav, spacing, typography, useResponsive, useTheme } from '@odyssey/ui';
import { Slot } from 'expo-router';

const NAV_ITEMS = [
  { key: 'home', label: 'Home', icon: '🏠', href: '/' },
  { key: 'orders', label: 'Orders', icon: '📋', href: '/orders' },
  { key: 'crm', label: 'CRM', icon: '👥', href: '/crm' },
  { key: 'menu', label: 'Menu', icon: '🍽️', href: '/menu' },
  { key: 'settings', label: 'Settings', icon: '⚙️', href: '/settings' },
];

export default function AppLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useTheme();
  const { isDesktop } = useResponsive();

  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    active:
      item.href === '/'
        ? pathname === '/' || pathname === '/index'
        : pathname.startsWith(item.href),
    onPress: () => router.push(item.href as never),
  }));

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.shell}>
        {isDesktop ? (
          <Nav
            items={navItems}
            header={
              <View>
                <Text style={[typography.xl, { color: colors.text, fontWeight: '700' }]}>
                  Odyssey Ops
                </Text>
                <Text style={[typography.xs, { color: colors.textMuted }]}>Restaurant dashboard</Text>
              </View>
            }
            footer={
              <Text
                style={[typography.sm, { color: colors.primary }]}
                onPress={() => router.push('/ui-library' as never)}
              >
                UI Library →
              </Text>
            }
          />
        ) : null}
        <View style={styles.main}>
          <Slot />
        </View>
        {!isDesktop ? <Nav items={navItems} /> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  shell: {
    flex: 1,
    flexDirection: 'row',
  },
  main: {
    flex: 1,
  },
});
