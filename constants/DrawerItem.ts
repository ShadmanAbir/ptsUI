export type DrawerItem = {
  label: string;
  iconName: string; // Ionicons icon name
  route: string;
  requiredPermissions?: string[]; // If empty or undefined, no permission needed
};

export const drawerItems: DrawerItem[] = [
  { label: 'Dashboard', iconName: 'speedometer-outline', route: 'index' },
  { label: 'Production Entry', iconName: 'create-outline', route: 'productionentry', requiredPermissions: ['ProductionEntry'] },
  { label: 'Line Setup', iconName: 'options-outline', route: 'LineSetup', requiredPermissions: ['LineSetup'] },
  { label: 'Orders', iconName: 'list-outline', route: 'Orders', requiredPermissions: ['OrdersView'] },
  { label: 'Quality Control', iconName: 'shield-checkmark-outline', route: 'QualityControl', requiredPermissions: ['QualityControl'] },
  { label: 'Reports', iconName: 'stats-chart-outline', route: 'reports', requiredPermissions: ['ProductionDashboardView'] },
  { label: 'Settings', iconName: 'settings-outline', route: 'settings'},
];
