import AsyncStorage from '@react-native-async-storage/async-storage';

const IP = '192.168.1.247';
const PORT = '9000';

export const API_BASE_URL = `http://${IP}:${PORT}/api`;

// A simple fetch wrapper that automatically adds Authorization header if token exists
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = await AsyncStorage.getItem('authToken');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Try to get error message from response body
    let errorMessage = 'API request failed';
    try {
      const errorData = await response.json();
      if (errorData.message) errorMessage = errorData.message;
    } catch {
      // fallback if response isn't JSON
      errorMessage = await response.text();
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
