import { Stack } from 'expo-router';

export default function EmployeeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="vacations/new" options={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }} />
    </Stack>
  );
}
