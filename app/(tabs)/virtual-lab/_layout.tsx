import { Stack } from 'expo-router';

export default function VirtualLabLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[practiceId]" />
    </Stack>
  );
}
