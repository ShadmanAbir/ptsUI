import { useAuth } from '@/app/AuthContext';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { apiFetch } from '@/constants/Api';
import SyncManager from '@/utils/SyncManager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface AppSettings {
  notifications: boolean;
  autoSync: boolean;
  syncInterval: number;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  defaultLine: number;
}

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState<AppSettings>({
    notifications: true,
    autoSync: true,
    syncInterval: 30,
    theme: 'auto',
    language: 'en',
    defaultLine: 1,
  });
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [hasOfflineData, setHasOfflineData] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    loadSettings();
    checkOfflineData();
  }, []);
  
  const checkOfflineData = async () => {
    const hasEntries = await SyncManager.hasOfflineEntries();
    setHasOfflineData(hasEntries);
  };

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('appSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const updateSetting = (key: keyof AppSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
    
    // If autoSync setting changed, update sync manager
    if (key === 'autoSync' || key === 'syncInterval') {
      SyncManager.stopBackgroundSync();
      if (newSettings.autoSync) {
        SyncManager.startBackgroundSync();
      }
    }
  };
  
  const syncData = async () => {
    setSyncing(true);
    setSyncMessage('Syncing...');
    
    try {
      const result = await SyncManager.syncData();
      setSyncMessage(result.message);
      
      // Check if there's still offline data
      await checkOfflineData();
    } catch (error: any) {
      setSyncMessage(`Sync failed: ${error.message}`);
    } finally {
      setSyncing(false);
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setSyncMessage('');
      }, 3000);
    }
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      Alert.alert('Success', 'Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              const keys = await AsyncStorage.getAllKeys();
              const cacheKeys = keys.filter(key => 
                key.startsWith('cache_') || key.startsWith('temp_')
              );
              await AsyncStorage.multiRemove(cacheKeys);
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  const exportData = async () => {
    try {
      setLoading(true);
      await apiFetch('/data/export', {
        method: 'POST',
        body: JSON.stringify({ userId: user?.id }),
      });
      Alert.alert('Success', 'Data export initiated. You will receive an email when ready.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.heading}>Settings</ThemedText>

        {/* User Profile Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Profile</ThemedText>
          <View style={styles.profileInfo}>
            <ThemedText style={styles.profileText}>Name: {user?.fullName}</ThemedText>
            <ThemedText style={styles.profileText}>Email: {user?.email}</ThemedText>
            <ThemedText style={styles.profileText}>Username: {user?.username}</ThemedText>
          </View>
        </View>

        {/* App Settings Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>App Settings</ThemedText>
          
          <View style={styles.settingRow}>
            <ThemedText>Enable Notifications</ThemedText>
            <Switch
              value={settings.notifications}
              onValueChange={(value) => updateSetting('notifications', value)}
              trackColor={{ false: '#767577', true: '#007AFF' }}
            />
          </View>

          <View style={styles.settingRow}>
            <ThemedText>Auto Sync</ThemedText>
            <Switch
              value={settings.autoSync}
              onValueChange={(value) => updateSetting('autoSync', value)}
              trackColor={{ false: '#767577', true: '#007AFF' }}
            />
          </View>
          
          {hasOfflineData && (
            <View style={styles.syncContainer}>
              <ThemedText style={styles.syncText}>
                You have offline data that needs to be synced
              </ThemedText>
              <TouchableOpacity 
                style={styles.syncButton} 
                onPress={syncData}
                disabled={syncing}
              >
                {syncing ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <ThemedText style={styles.syncButtonText}>Sync Now</ThemedText>
                )}
              </TouchableOpacity>
              {syncMessage ? (
                <ThemedText style={styles.syncMessage}>{syncMessage}</ThemedText>
              ) : null}
            </View>
          )}

          <View style={styles.inputRow}>
            <ThemedText style={styles.inputLabel}>Default Production Line</ThemedText>
            <TextInput
              style={styles.numberInput}
              value={settings.defaultLine.toString()}
              onChangeText={(text) => updateSetting('defaultLine', parseInt(text) || 1)}
              keyboardType="numeric"
              placeholder="1"
            />
          </View>

          <View style={styles.inputRow}>
            <ThemedText style={styles.inputLabel}>Sync Interval (minutes)</ThemedText>
            <TextInput
              style={styles.numberInput}
              value={settings.syncInterval.toString()}
              onChangeText={(text) => updateSetting('syncInterval', parseInt(text) || 30)}
              keyboardType="numeric"
              placeholder="30"
            />
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Security</ThemedText>
          
          <TextInput
            style={styles.input}
            placeholder="Current Password"
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          
          <TextInput
            style={styles.input}
            placeholder="New Password"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Confirm New Password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]} 
            onPress={changePassword}
            disabled={loading}
          >
            <ThemedText style={styles.buttonText}>Change Password</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Data Management Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Data Management</ThemedText>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={exportData}
            disabled={loading}
          >
            <ThemedText style={styles.buttonText}>Export My Data</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.warningButton]} 
            onPress={clearCache}
          >
            <ThemedText style={styles.buttonText}>Clear Cache</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.button, styles.dangerButton]} 
            onPress={logout}
          >
            <ThemedText style={styles.buttonText}>Logout</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 50,
  },
  heading: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#007AFF',
  },
  syncContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  syncText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  syncButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  syncButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  syncMessage: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    marginBottom: 16,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  profileInfo: {
    gap: 8,
  },
  profileText: {
    fontSize: 16,
    color: '#555',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  inputLabel: {
    flex: 1,
    fontSize: 16,
  },
  numberInput: {
    width: 80,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    textAlign: 'center',
    backgroundColor: '#fff',
  },
  input: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#28a745',
  },
  warningButton: {
    backgroundColor: '#ffc107',
  },
  dangerButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});