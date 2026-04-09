import { Stack } from 'expo-router';

export default function AddDocumentLayout() {
  return (
    <Stack>
      <Stack.Screen name="smart" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="manual" options={{ headerShown: false }} />
    </Stack>
  );
}
