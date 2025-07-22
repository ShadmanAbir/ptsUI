// Core data types for the production tracking system

export interface ProductionLine {
  id: number;
  name: string;
  capacity: number;
  isActive: boolean;
  supervisorId?: number;
}

export interface Buyer {
  id: number;
  name: string;
  code: string;
  contactEmail: string;
  isActive: boolean;
}

export interface Style {
  id: number;
  styleNo: string;
  description: string;
  buyerId: number;
  fabricType: string;
  targetSAM: number; // Standard Allowed Minutes
  complexity: 'Low' | 'Medium' | 'High';
}

export interface ProductionOrder {
  id: number;
  orderNo: string;
  styleId: number;
  buyerId: number;
  quantity: number;
  deliveryDate: string;
  unitPrice: number;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export interface LineSetup {
  id: number;
  lineId: number;
  orderId: number;
  productionDate: string;
  targetQuantity: number;
  setupTime: string;
  isActive: boolean;
}

export interface HourlyProduction {
  id: number;
  lineSetupId: number;
  hourSlot: string;
  targetQuantity: number;
  actualQuantity: number;
  defectQuantity: number;
  remarks?: string;
  entryTime: string;
  enteredBy: number;
}

export interface ProductionEntry {
  lineId: number;
  productionDate: string;
  style: string;
  orderNo: string;
  buyer: string;
  fabricType: string;
  pmId: number;
  hourSlot: string;
  targetQuantity: number;
  actualQuantity: number;
  remarks: string;
}

export interface QualityDefect {
  id: number;
  hourlyProductionId: number;
  defectType: string;
  defectCount: number;
  severity: 'Minor' | 'Major' | 'Critical';
  description?: string;
  actionTaken?: string;
}

export interface Employee {
  id: number;
  employeeCode: string;
  name: string;
  role: 'Operator' | 'Supervisor' | 'QC' | 'Manager';
  lineId?: number;
  isActive: boolean;
  contactNumber?: string;
}

export interface ProductionSummary {
  lineId: number;
  lineName: string;
  productionDate: string;
  orderNo: string;
  style: string;
  buyer: string;
  targetQuantity: number;
  actualQuantity: number;
  defectQuantity: number;
  efficiency: number;
  qualityRate: number;
}

export interface DashboardMetrics {
  totalLines: number;
  activeLines: number;
  todayProduction: number;
  todayTarget: number;
  overallEfficiency: number;
  qualityRate: number;
  topPerformingLine: string;
  criticalOrders: number;
}