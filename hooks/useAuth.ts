import { useCallback } from 'react';
import { auth } from '../appwrite';
import { useRouter } from 'expo-router';

export default function useAuth() {
  const router = useRouter();

  const checkUserPresence = useCallback(async () => {
    try {
      await auth.get();
      // user exists, navigate to main
      router.replace('/');
    } catch (e) {
      router.replace('(auth)/login');
    }
  }, [router]);

  return { checkUserPresence };
}
