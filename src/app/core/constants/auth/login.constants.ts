export const LOGIN_CONSTANTS = {
  DEV_CREDENTIALS: {
    EMAIL: 'admin@tmert.com',
    PASSWORD: 'admin123',
    USER: {
      id: '1',
      email: 'admin@tmert.com',
      name: 'Admin TMERT',
      role: 'admin',
    },
  },

  ENDPOINTS: {
    LOGIN: '/api/auth/login',
    VERIFY: '/api/auth/verify',
  },

  TIMING: {
    LOGIN_DELAY: 1000,
  },
} as const;
