import ProductionService from '@/services/ProductionService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

class SyncManager {
  private static instance: SyncManager;
  private syncInterval: NodeJS.Timeout | null = null;
  private isSyncing = false;
  
  private constructor() {
    // Private constructor for singleton pattern
  }
  
  public static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }
  
  /**
   * Start background sync based on settings
   */
  public async startBackgroundSync(): Promise<void> {
    // Stop any existing sync interval
    this.stopBackgroundSync();
    
    try {
      // Get sync settings
      const settingsStr = await AsyncStorage.getItem('appSettings');
      if (!settingsStr) return;
      
      const settings = JSON.parse(settingsStr);
      
      // Check if auto sync is enabled
      if (!settings.autoSync) return;
      
      // Get sync interval in minutes (default to 30 if not set)
      const syncIntervalMinutes = settings.syncInterval || 30;
      
      // Convert to milliseconds
      const syncIntervalMs = syncIntervalMinutes * 60 * 1000;
      
      // Start sync interval
      this.syncInterval = setInterval(() => {
        this.syncData();
      }, syncIntervalMs);
      
      console.log(`Background sync started with interval: ${syncIntervalMinutes} minutes`);
    } catch (error) {
      console.error('Failed to start background sync:', error);
    }
  }
  
  /**
   * Stop background sync
   */
  public stopBackgroundSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('Background sync stopped');
    }
  }
  
  /**
   * Perform data synchronization
   */
  public async syncData(): Promise<{ success: boolean; message: string }> {
    // Prevent multiple syncs running at the same time
    if (this.isSyncing) {
      return { success: false, message: 'Sync already in progress' };
    }
    
    this.isSyncing = true;
    
    try {
      // Check network connectivity
      const netInfo = await NetInfo.fetch();
      
      if (!netInfo.isConnected) {
        this.isSyncing = false;
        return { success: false, message: 'No internet connection' };
      }
      
      // Sync offline entries
      const syncedCount = await ProductionService.syncOfflineEntries();
      
      this.isSyncing = false;
      
      if (syncedCount > 0) {
        return { 
          success: true, 
          message: `Successfully synced ${syncedCount} offline entries` 
        };
      } else {
        return { 
          success: true, 
          message: 'No offline entries to sync' 
        };
      }
    } catch (error) {
      this.isSyncing = false;
      return { 
        success: false, 
        message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
  
  /**
   * Check if there are offline entries that need to be synced
   */
  public async hasOfflineEntries(): Promise<boolean> {
    try {
      const offlineEntries = await AsyncStorage.getItem('offline_entries');
      return offlineEntries !== null && JSON.parse(offlineEntries).length > 0;
    } catch {
      return false;
    }
  }
}

export default SyncManager.getInstance();