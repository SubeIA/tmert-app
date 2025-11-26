export interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number | string;
  badgeColor?: 'primary' | 'accent' | 'warn';
  children?: NavItem[];
  roles?: string[];
  disabled?: boolean;
}

export const SIDEBAR_NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    icon: 'dashboard',
    route: '/home',
  },
  {
    label: 'Evaluación TMERT',
    icon: 'assignment',
    route: '/tmert-evaluation',
  },
  {
    label: 'Users',
    icon: 'people',
    route: '/users',
  },
  {
    label: 'Settings',
    icon: 'settings',
    route: '/settings',
  },
  {
    label: 'Analytics',
    icon: 'analytics',
    route: '/analytics',
  },
] as const;

export const SIDEBAR_CONFIG = {
  width: 260,
  mobileWidth: 240,
  collapsedWidth: 64,
  logoIcon: 'business',
  appName: 'TMERT',
  appFullName: 'TMERT Asistente',
} as const;
