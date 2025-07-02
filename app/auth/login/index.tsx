import { Image, TextInput, TouchableOpacity } from 'react-native';
import React from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import styles from './styles';

export default function LoginScreen() {
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
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#999"
        secureTextEntry
      />

      <TouchableOpacity style={styles.loginButton}>
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