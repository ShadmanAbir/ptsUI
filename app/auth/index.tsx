import { useAuth } from '@/app/AuthContext';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, TextInput, TouchableOpacity } from 'react-native';
import styles from './styles';

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (username === 'admin' && password === '12345') {
      // Use a fake token for demo
      login('demo-token');
      // Remove router.replace('/(app)'); let context handle navigation
    } else {
      Alert.alert('Login Failed', 'Invalid username or password');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Image
        source={require('@/assets/images/react-logo.png')}
        style={styles.logo}
      />
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

      <TouchableOpacity>
        <ThemedText style={styles.forgotPassword}>Forgot Password?</ThemedText>
      </TouchableOpacity>

      <ThemedView style={styles.signUpContainer}>
        <ThemedText style={styles.noAccountText}>Don&apos;t have an account?</ThemedText>
        <TouchableOpacity>
          <ThemedText style={styles.signUpText}>Sign Up</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}