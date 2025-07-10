import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const LocalIP = '192.168.1.247';
const Web_IP = '175.29.147.129';
const PORT = '9000';

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
  const token = await AsyncStorage.getItem('authToken');
  const baseUrl = await getApiBaseUrl();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${baseUrl}${endpoint}`, {
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
