import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// API Configuration
const LocalIP = '192.168.1.247';
const Web_IP = '192.168.1.247';
const PORT = '9000';
const API_TIMEOUT = 10000; // 10 seconds timeout

async function getApiBaseUrl(): Promise<string> {
  try {
    const state = await NetInfo.fetch();

    if (
      state.type === 'wifi' &&
      state.details.ipAddress &&
      (state.details.ipAddress.startsWith('192.168.') ||
        state.details.ipAddress.startsWith('10.'))
    ) {
      // Local network detected
      return `http://${LocalIP}:${PORT}/api`;
    }
  } catch {
    // ignore errors, fallback to internet API
  }
  // Default to internet API
  return `http://${Web_IP}:${PORT}/api`;
}

// A simple fetch wrapper that automatically adds Authorization header if token exists
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  try {
    const token = await AsyncStorage.getItem('userToken'); // Changed from authToken to userToken to match AuthContext
    const baseUrl = await getApiBaseUrl();

    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    // Create an AbortController to handle timeouts
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Try to get error message from response body
      let errorMessage = `API request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.message) errorMessage = errorData.message;
      } catch {
        // fallback if response isn't JSON
        errorMessage = await response.text() || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('API request timed out. Please check your connection and try again.');
    }

    // Log the error for debugging
    console.error('API Error:', error);

    // Rethrow the error with a more user-friendly message
    throw error instanceof Error ? error : new Error('An unexpected error occurred');
  }
}
