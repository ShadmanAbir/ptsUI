import { Image, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import styles from './styles';
import { useAuth } from '@/app/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (username === 'admin' && password === '12345') {
      login();
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