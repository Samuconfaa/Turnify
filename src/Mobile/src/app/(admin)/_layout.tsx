import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="shifts/[id]" options={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }} />
    </Stack>
  );
}
