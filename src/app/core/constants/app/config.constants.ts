export const APP_CONFIG = {
  APP: {
    NAME: 'TMERT Asistente',
    VERSION: '1.0.0',
    DESCRIPTION: 'TMERT Administrative Dashboard',
    COMPANY: 'TMERT',
  },

  FORMATS: {
    DATE: 'dd/MM/yyyy',
    DATE_TIME: 'dd/MM/yyyy HH:mm',
    TIME: 'HH:mm',
    DATE_TIME_SECONDS: 'dd/MM/yyyy HH:mm:ss',
  },

  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],
    MAX_PAGE_SIZE: 1000,
  },

  API: {
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
  },

  STORAGE_PREFIX: 'tmert_',

  NOTIFICATION: {
    SUCCESS_DURATION: 3000,
    ERROR_DURATION: 5000,
    INFO_DURATION: 3000,
    WARNING_DURATION: 4000,
  },
} as const;
