import { Stack } from 'expo-router';
import { AppProviders } from '../src/providers/AppProviders';
import '../global.css';

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(app)" />
        <Stack.Screen name="ui-library" options={{ presentation: 'modal' }} />
      </Stack>
    </AppProviders>
  );
}
