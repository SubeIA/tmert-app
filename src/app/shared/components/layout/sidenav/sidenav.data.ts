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
    label: 'Empresas',
    icon: 'business',
    route: '/companies',
    roles: [],
  },
  {
    label: 'Usuarios',
    icon: 'people',
    route: '/users',
    roles: [],
  },
  {
    label: 'Mis Evaluaciones',
    icon: 'assignment_turned_in',
    route: '/evaluations',
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
