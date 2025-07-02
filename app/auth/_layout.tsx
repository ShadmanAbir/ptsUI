import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '@/app/AuthContext';

export default function AuthLayout() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      router.replace('/(app)');
    }
  }, [isLoggedIn]);

  return (
    <Stack>
      <Stack.Screen name="login/index" options={{ headerShown: false }} />
    </Stack>
  );
}
