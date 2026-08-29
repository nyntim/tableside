import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Nav, spacing, typography, useResponsive, useTheme } from '@tableside/ui';
import { Slot } from 'expo-router';

const NAV_ITEMS = [
  { key: 'home', label: 'Home', icon: '🏠', href: '/' },
  { key: 'orders', label: 'Orders', icon: '📋', href: '/orders' },
  { key: 'menu', label: 'Menu', icon: '🍽️', href: '/menu' },
  { key: 'crm', label: 'CRM', icon: '👥', href: '/crm' },
  { key: 'settings', label: 'Settings', icon: '⚙️', href: '/settings' },
];

const SETTINGS_ITEMS = [
  { key: 'profile', label: 'Restaurant Profile', icon: '•', href: '/settings' },
  { key: 'ordering', label: 'Ordering', icon: '•', href: '/settings' },
  { key: 'hours', label: 'Hours', icon: '•', href: '/settings' },
];

export default function AppLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useTheme();
  const { isDesktop } = useResponsive();
  const inSettings = pathname.startsWith('/settings');

  const navItems = (inSettings ? SETTINGS_ITEMS : NAV_ITEMS).map((item) => ({
    ...item,
    active: inSettings
      ? item.key === 'profile'
      : item.href === '/'
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
                {inSettings ? (
                  <>
                    <Text
                      style={[typography.sm, { color: colors.primary }]}
                      onPress={() => router.push('/' as never)}
                    >
                      ‹ Back
                    </Text>
                    <Text style={[typography.lg, styles.settingsTitle, { color: colors.text }]}>
                      Settings
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={[typography.xl, { color: colors.text, fontWeight: '700' }]}>
                      Tableside
                    </Text>
                    <Text style={[typography.xs, { color: colors.textMuted }]}>
                      Tableside Kitchen⌄
                    </Text>
                  </>
                )}
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
          <View style={[styles.topbar, { borderBottomColor: colors.border }]}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={[typography.xs, { color: colors.primaryText, fontWeight: '700' }]}>TK</Text>
            </View>
          </View>
          <View style={styles.page}>
            <Slot />
          </View>
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
  page: { flex: 1 },
  topbar: {
    height: 64,
    paddingHorizontal: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing[3],
    borderBottomWidth: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsTitle: { marginTop: spacing[3], fontWeight: '700' },
});
