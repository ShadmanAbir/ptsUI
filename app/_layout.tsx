// /app/_layout.tsx
import { useColorScheme } from '@/hooks/useColorScheme';
import SyncManager from '@/utils/SyncManager';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './AuthContext';

export default function AppLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  
  // Initialize sync manager
  useEffect(() => {
    SyncManager.startBackgroundSync();
    
    return () => {
      SyncManager.stopBackgroundSync();
    };
  }, []);

  if (!loaded) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

function AuthGate() {
  const { isLoggedIn, loading } = useAuth();

  if (loading) return null;

  if (!isLoggedIn) {
    return (
      <Stack>
        <Stack.Screen name="auth/index" options={{ headerShown: false }} />
      </Stack>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(drawer)" />
    </Stack>
  );
}