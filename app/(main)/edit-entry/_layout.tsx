import { Stack } from 'expo-router';

export default function EditDocumentLayout() {
  return (
    <Stack>
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
