import { useAuth } from '@/app/AuthContext';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, TextInput, TouchableOpacity, View } from 'react-native';
import { apiFetch } from '../../constants/Api';
import styles from './styles';

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

const handleLogin = async () => {
  if (!username || !password) {
    Alert.alert('Validation Error', 'Please enter both username and password');
    return;
  }

try {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  // ✅ Updated to include refreshToken
  login(data.token, data.refreshToken, data.user, data.permissions);

  router.replace('/');
} catch (error: any) {
  Alert.alert('Login Failed', error.message);
}

};

  return (
    <View style={styles.container}>
      {/* Your UI code here */}
      <Image source={require('@/assets/images/react-logo.png')} style={styles.logo} />
      <ThemedText type="title" style={styles.title}>Welcome Back!</ThemedText>
      <ThemedText type="subtitle" style={styles.subtitle}>Login to your account</ThemedText>

      <TextInput
        style={styles.input}
        placeholder="Username or Email"
        placeholderTextColor="#999"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <ThemedText style={styles.loginButtonText}>Login</ThemedText>
      </TouchableOpacity>
      {/* other UI like forgot password, signup */}
    </View>
  );
}
