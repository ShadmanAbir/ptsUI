export type DrawerItem = {
  label: string;
  iconName: string; // Ionicons icon name
  route: string;
  requiredPermissions?: string[]; // If empty or undefined, no permission needed
};

export const drawerItems: DrawerItem[] = [
  { label: 'Dashboard', iconName: 'speedometer-outline', route: 'Dashboard' },
  { label: 'Production Entry', iconName: 'create-outline', route: 'ProductionEntry', requiredPermissions: ['ProductionEntry'] },
  { label: 'Reports', iconName: 'stats-chart-outline', route: 'Reports', requiredPermissions: ['ProductionDashboardView'] },
  { label: 'Settings', iconName: 'settings-outline', route: 'Settings'},
];
