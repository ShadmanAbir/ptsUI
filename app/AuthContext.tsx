import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { User } from '@/types/production';

// Types for AuthContext
interface AuthContextType {
  isLoggedIn: boolean;
  userToken: string | null;
  refreshToken: string | null;
  user: User | null;
  permissions: string[];
  login: (
    token: string,
    refreshToken: string,
    user: User,
    permissions: string[]
  ) => void;
  logout: () => void;
  loading: boolean;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Restore session from storage
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const refresh = await AsyncStorage.getItem('refreshToken');
        const userJson = await AsyncStorage.getItem('user');
        const permsJson = await AsyncStorage.getItem('permissions');

        if (token && userJson) {
          setUserToken(token);
          setRefreshToken(refresh);
          setUser(JSON.parse(userJson));
          setPermissions(JSON.parse(permsJson || '[]'));
        }
      } catch (e) {
        console.error('🔴 Failed to restore session:', e);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Login method
  const login = async (
    token: string,
    refreshToken: string,
    userObj: User,
    perms: string[]
  ) => {
    try {
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(userObj));
      await AsyncStorage.setItem('permissions', JSON.stringify(perms));

      setUserToken(token);
      setRefreshToken(refreshToken);
      setUser(userObj);
      setPermissions(perms);
    } catch (e) {
      console.error('🔴 Failed to save session:', e);
    }
  };

  // Logout method
  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['userToken', 'refreshToken', 'user', 'permissions']);
      setUserToken(null);
      setRefreshToken(null);
      setUser(null);
      setPermissions([]);
      router.replace('/auth'); // or wherever your login screen is
    } catch (e) {
      console.error('🔴 Failed to clear session:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!userToken,
        userToken,
        refreshToken,
        user,
        permissions,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('🚫 useAuth must be used within an AuthProvider');
  }
  return context;
};
