import ApiClientInstance from '@/api/ApiClient';
import {
  Buyer,
  DashboardMetrics,
  HourlyProduction,
  LineSetup,
  ProductionLine,
  ProductionOrder,
  ProductionSummary,
  QualityDefect,
  Style
} from '@/types/production';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ProductionService {
  // Cache keys
  private static readonly CACHE_KEYS = {
    LINES: 'cache_production_lines',
    BUYERS: 'cache_buyers',
    STYLES: 'cache_styles',
    ORDERS: 'cache_orders',
    HOURLY_ENTRIES: 'cache_hourly_entries',
    DASHBOARD_METRICS: 'cache_dashboard_metrics',
  };

  // Instance reference to static CACHE_KEYS
  private CACHE_KEYS = ProductionService.CACHE_KEYS;

  // Production Lines
  async getProductionLines(): Promise<ProductionLine[]> {
    try {
      console.log('Fetching production lines from API...');
      const data = await ApiClientInstance.getProductionLines();
      console.log('Production lines fetched successfully:', data);
      await AsyncStorage.setItem(this.CACHE_KEYS.LINES, JSON.stringify(data));
      return data;
    } catch (error) {
      console.warn('Failed to fetch production lines:', error);
      // Fallback to cached data
      try {
        const cached = await AsyncStorage.getItem(this.CACHE_KEYS.LINES);
        if (cached) {
          console.log('Using cached production lines');
          return JSON.parse(cached);
        }
      } catch (cacheError) {
        console.warn('Failed to read cache:', cacheError);
      }

      console.log('Using mock production lines');
      return this.getMockLines();
    }
  }

  async createProductionLine(line: Omit<ProductionLine, 'id'>): Promise<ProductionLine> {
    try {
      return await ApiClientInstance.createProductionLine(line);
    } catch (error) {
      throw new Error('Failed to create production line');
    }
  }

  // Buyers
  async getBuyers(): Promise<Buyer[]> {
    try {
      const data = await ApiClientInstance.getBuyers();
      await AsyncStorage.setItem(this.CACHE_KEYS.BUYERS, JSON.stringify(data));
      return data;
    } catch (error) {
      const cached = await AsyncStorage.getItem(this.CACHE_KEYS.BUYERS);
      return cached ? JSON.parse(cached) : this.getMockBuyers();
    }
  }

  // Styles
  async getStyles(buyerId?: number): Promise<Style[]> {
    try {
      const data = await ApiClientInstance.getStyles(buyerId);
      await AsyncStorage.setItem(this.CACHE_KEYS.STYLES, JSON.stringify(data));
      return data;
    } catch (error) {
      const cached = await AsyncStorage.getItem(this.CACHE_KEYS.STYLES);
      const allStyles = cached ? JSON.parse(cached) : this.getMockStyles();
      return buyerId ? allStyles.filter((s: Style) => s.buyerId === buyerId) : allStyles;
    }
  }

  // Production Orders
  async getProductionOrders(status?: string): Promise<ProductionOrder[]> {
    try {
      const data = await ApiClientInstance.getProductionOrders(status);
      await AsyncStorage.setItem(this.CACHE_KEYS.ORDERS, JSON.stringify(data));
      return data;
    } catch (error) {
      const cached = await AsyncStorage.getItem(this.CACHE_KEYS.ORDERS);
      return cached ? JSON.parse(cached) : this.getMockOrders();
    }
  }

  // Hourly Production Entry
  async submitHourlyProduction(entry: Omit<HourlyProduction, 'id' | 'entryTime'>): Promise<HourlyProduction> {
    try {
      const result = await ApiClientInstance.submitHourlyProduction(entry);

      // Update local cache
      await this.updateLocalHourlyCache(result);
      return result;
    } catch (error) {
      // Store offline for later sync
      await this.storeOfflineEntry(entry);
      throw new Error('Stored offline - will sync when connection is available');
    }
  }

  // Dashboard Metrics
  async getDashboardMetrics(date?: string): Promise<DashboardMetrics> {
    try {
      const data = await ApiClientInstance.getDashboardMetrics(date);
      await AsyncStorage.setItem(this.CACHE_KEYS.DASHBOARD_METRICS, JSON.stringify(data));
      return data;
    } catch (error) {
      const cached = await AsyncStorage.getItem(this.CACHE_KEYS.DASHBOARD_METRICS);
      return cached ? JSON.parse(cached) : this.getMockDashboardMetrics();
    }
  }

  // Production Summary/Reports
  async getProductionSummary(startDate: string, endDate: string, lineId?: number): Promise<ProductionSummary[]> {
    try {
      return await ApiClientInstance.getProductionSummary(startDate, endDate, lineId);
    } catch (error) {
      return this.getMockProductionSummary();
    }
  }

  // Quality Defects
  async submitQualityDefect(defect: Omit<QualityDefect, 'id'>): Promise<QualityDefect> {
    try {
      return await ApiClientInstance.submitQualityDefect(defect);
    } catch (error) {
      throw new Error('Failed to submit quality defect');
    }
  }

  // Line Setup
  async createLineSetup(setup: Omit<LineSetup, 'id'>): Promise<LineSetup> {
    try {
      return await ApiClientInstance.createLineSetup(setup);
    } catch (error) {
      throw new Error('Failed to create line setup');
    }
  }

  async getLineSetups(date?: string): Promise<LineSetup[]> {
    try {
      return await ApiClientInstance.getLineSetups(date);
    } catch (error) {
      return [];
    }
  }

  // Get defects by production entry
  async getDefectsByProductionEntry(hourlyProductionId: number): Promise<QualityDefect[]> {
    try {
      return await ApiClientInstance.getDefects(hourlyProductionId);
    } catch (error) {
      return [];
    }
  }

  // Get hourly entries by line setup
  async getHourlyEntriesByLineSetup(lineSetupId: number): Promise<HourlyProduction[]> {
    try {
      return await ApiClientInstance.getHourlyProduction(lineSetupId);
    } catch (error) {
      return [];
    }
  }

  // Offline Support
  private async storeOfflineEntry(entry: Omit<HourlyProduction, 'id' | 'entryTime'>) {
    const offlineEntries = await AsyncStorage.getItem('offline_entries') || '[]';
    const entries = JSON.parse(offlineEntries);
    entries.push({ ...entry, timestamp: Date.now() });
    await AsyncStorage.setItem('offline_entries', JSON.stringify(entries));
  }

  async syncOfflineEntries(): Promise<number> {
    const offlineEntries = await AsyncStorage.getItem('offline_entries');
    if (!offlineEntries) return 0;

    const entries = JSON.parse(offlineEntries);
    let syncedCount = 0;

    for (const entry of entries) {
      try {
        await this.submitHourlyProduction(entry);
        syncedCount++;
      } catch (error) {
        console.error('Failed to sync entry:', error);
      }
    }

    if (syncedCount > 0) {
      await AsyncStorage.removeItem('offline_entries');
    }

    return syncedCount;
  }

  private async updateLocalHourlyCache(entry: HourlyProduction) {
    const cached = await AsyncStorage.getItem(this.CACHE_KEYS.HOURLY_ENTRIES) || '[]';
    const entries = JSON.parse(cached);
    entries.push(entry);
    await AsyncStorage.setItem(this.CACHE_KEYS.HOURLY_ENTRIES, JSON.stringify(entries));
  }

  // Mock data for offline/fallback scenarios
  private getMockLines(): ProductionLine[] {
    return [
      { id: 1, name: 'Line 1', capacity: 120, isActive: true, supervisorId: 1 },
      { id: 2, name: 'Line 2', capacity: 150, isActive: true, supervisorId: 2 },
      { id: 3, name: 'Line 3', capacity: 100, isActive: true, supervisorId: 3 },
    ];
  }

  private getMockBuyers(): Buyer[] {
    return [
      { id: 1, name: 'H&M', code: 'HM001', contactEmail: 'orders@hm.com', isActive: true },
      { id: 2, name: 'Zara', code: 'ZR001', contactEmail: 'production@zara.com', isActive: true },
      { id: 3, name: 'Uniqlo', code: 'UQ001', contactEmail: 'supply@uniqlo.com', isActive: true },
    ];
  }

  private getMockStyles(): Style[] {
    return [
      { id: 1, styleNo: 'ST001', description: 'Basic T-Shirt', buyerId: 1, fabricType: 'Cotton', targetSAM: 15, complexity: 'Low' },
      { id: 2, styleNo: 'ST002', description: 'Polo Shirt', buyerId: 1, fabricType: 'Cotton Blend', targetSAM: 25, complexity: 'Medium' },
      { id: 3, styleNo: 'ST003', description: 'Dress Shirt', buyerId: 2, fabricType: 'Cotton', targetSAM: 35, complexity: 'High' },
    ];
  }

  private getMockOrders(): ProductionOrder[] {
    return [
      {
        id: 1,
        orderNo: 'ORD001',
        styleId: 1,
        buyerId: 1,
        quantity: 5000,
        deliveryDate: '2025-02-15',
        unitPrice: 12.50,
        status: 'In Progress',
        createdAt: '2025-01-15T00:00:00Z'
      },
      {
        id: 2,
        orderNo: 'ORD002',
        styleId: 2,
        buyerId: 2,
        quantity: 3000,
        deliveryDate: '2025-02-20',
        unitPrice: 18.75,
        status: 'Pending',
        createdAt: '2025-01-18T00:00:00Z'
      },
    ];
  }

  private getMockDashboardMetrics(): DashboardMetrics {
    return {
      totalLines: 5,
      activeLines: 3,
      todayProduction: 1250,
      todayTarget: 1500,
      overallEfficiency: 83.3,
      qualityRate: 96.5,
      topPerformingLine: 'Line 2',
      criticalOrders: 2,
    };
  }

  private getMockProductionSummary(): ProductionSummary[] {
    return [
      {
        lineId: 1,
        lineName: 'Line 1',
        productionDate: '2025-01-21',
        orderNo: 'ORD001',
        style: 'Basic T-Shirt',
        buyer: 'H&M',
        targetQuantity: 500,
        actualQuantity: 485,
        defectQuantity: 12,
        efficiency: 97.0,
        qualityRate: 97.5,
      },
    ];
  }
}

export default new ProductionService();