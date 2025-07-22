import { apiFetch } from '@/constants/Api';
import {
    Buyer,
    HourlyProduction,
    LineSetup,
    ProductionEntry,
    ProductionLine,
    ProductionOrder,
    ProductionSummary,
    QualityDefect,
    Style
} from '@/types/production';

/**
 * API Client for the Production Tracking System
 * This client handles all API calls to the backend server
 */
class ApiClient {
  // Production Lines
  async getProductionLines(): Promise<ProductionLine[]> {
    const response = await apiFetch('/production/lines');
    return response.data || [];
  }

  async createProductionLine(line: Omit<ProductionLine, 'id'>): Promise<ProductionLine> {
    const response = await apiFetch('/production/lines', {
      method: 'POST',
      body: JSON.stringify(line),
    });
    return response.data;
  }

  // Buyers
  async getBuyers(): Promise<Buyer[]> {
    const response = await apiFetch('/buyers');
    return response.data || [];
  }

  async createBuyer(buyer: Omit<Buyer, 'id'>): Promise<Buyer> {
    const response = await apiFetch('/buyers', {
      method: 'POST',
      body: JSON.stringify(buyer),
    });
    return response.data;
  }

  // Styles
  async getStyles(buyerId?: number): Promise<Style[]> {
    const endpoint = buyerId ? `/styles?buyerId=${buyerId}` : '/styles';
    const response = await apiFetch(endpoint);
    return response.data || [];
  }

  async createStyle(style: Omit<Style, 'id'>): Promise<Style> {
    const response = await apiFetch('/styles', {
      method: 'POST',
      body: JSON.stringify(style),
    });
    return response.data;
  }

  // Production Orders
  async getProductionOrders(status?: string): Promise<ProductionOrder[]> {
    const endpoint = status ? `/orders?status=${status}` : '/orders';
    const response = await apiFetch(endpoint);
    return response.data || [];
  }

  async createProductionOrder(order: Omit<ProductionOrder, 'id' | 'createdAt'>): Promise<ProductionOrder> {
    const response = await apiFetch('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
    return response.data;
  }

  // Production Entry
  async submitProductionEntry(entry: ProductionEntry): Promise<any> {
    const response = await apiFetch('/Production', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
    return response;
  }

  // Line Setup
  async createLineSetup(setup: Omit<LineSetup, 'id'>): Promise<LineSetup> {
    const response = await apiFetch('/production/line-setup', {
      method: 'POST',
      body: JSON.stringify(setup),
    });
    return response.data;
  }

  async getLineSetups(date?: string): Promise<LineSetup[]> {
    const endpoint = date ? `/production/line-setups?date=${date}` : '/production/line-setups';
    const response = await apiFetch(endpoint);
    return response.data || [];
  }

  // Hourly Production
  async submitHourlyProduction(entry: Omit<HourlyProduction, 'id' | 'entryTime'>): Promise<HourlyProduction> {
    const response = await apiFetch('/production/hourly', {
      method: 'POST',
      body: JSON.stringify({
        ...entry,
        entryTime: new Date().toISOString(),
      }),
    });
    return response.data;
  }

  async getHourlyProduction(lineSetupId?: number): Promise<HourlyProduction[]> {
    const endpoint = lineSetupId ? `/production/hourly?lineSetupId=${lineSetupId}` : '/production/hourly';
    const response = await apiFetch(endpoint);
    return response.data || [];
  }

  // Quality Defects
  async submitQualityDefect(defect: Omit<QualityDefect, 'id'>): Promise<QualityDefect> {
    const response = await apiFetch('/quality/defects', {
      method: 'POST',
      body: JSON.stringify(defect),
    });
    return response.data;
  }

  async getDefects(hourlyProductionId?: number): Promise<QualityDefect[]> {
    const endpoint = hourlyProductionId ? `/quality/defects?hourlyProductionId=${hourlyProductionId}` : '/quality/defects';
    const response = await apiFetch(endpoint);
    return response.data || [];
  }

  // Reports
  async getProductionSummary(startDate: string, endDate: string, lineId?: number): Promise<ProductionSummary[]> {
    const params = new URLSearchParams({
      startDate,
      endDate,
      ...(lineId && { lineId: lineId.toString() }),
    });
    
    const response = await apiFetch(`/reports/production-summary?${params}`);
    return response.data || [];
  }

  async exportReport(startDate: string, endDate: string, format: string = 'excel'): Promise<{ url: string }> {
    const response = await apiFetch('/reports/export', {
      method: 'POST',
      body: JSON.stringify({
        startDate,
        endDate,
        format,
      }),
    });
    return response.data;
  }

  // Dashboard
  async getDashboardMetrics(date?: string): Promise<any> {
    const endpoint = date ? `/dashboard/metrics?date=${date}` : '/dashboard/metrics';
    const response = await apiFetch(endpoint);
    return response.data || {};
  }
}

export default new ApiClient();