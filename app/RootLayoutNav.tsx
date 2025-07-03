import { useAuth } from '@/app/AuthContext';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import Dashboard from '@/app/(drawer)/index'; // Your dashboard screen

const Drawer = createDrawerNavigator();

export default function RootLayoutNav() {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!isLoggedIn) {
    // Not logged in, show auth stack (login screen)
    return (
      <Stack>
        <Stack.Screen
          name="auth/index"  // path to your login screen
          options={{ headerShown: false }}
        />
      </Stack>
    );
  }

  // Logged in, show main drawer navigator
  return (
    <Drawer.Navigator screenOptions={{ headerShown: true }}>
      <Drawer.Screen name="index" component={Dashboard} options={{ title: 'Home' }} />
      
    </Drawer.Navigator>
  );
}