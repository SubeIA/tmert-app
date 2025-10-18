export const AUTH_CONSTANTS = {
  STORAGE_KEYS: {
    CURRENT_USER: 'tmert_current_user',
    AUTH_TOKEN: 'tmert_auth_token',
    REFRESH_TOKEN: 'tmert_refresh_token',
    REMEMBER_ME: 'tmert_remember_me',
  },

  ENDPOINTS: {
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    PROFILE: '/api/auth/profile',
  },

  SESSION: {
    TOKEN_REFRESH_INTERVAL: 300000,
    SESSION_TIMEOUT: 3600000,
    IDLE_TIMEOUT: 900000,
  },

  ROUTES: {
    LOGIN: '/auth/login',
    AFTER_LOGIN: '/home',
    AFTER_LOGOUT: '/auth/login',
  },
} as const;
