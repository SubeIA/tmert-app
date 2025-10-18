export const APP_CONSTANTS = {
  APP: {
    NAME: 'TMERT Asistente',
    VERSION: '1.0.0',
    DESCRIPTION: 'TMERT Administrative Dashboard',
    COMPANY: 'TMERT',
  },

  BREAKPOINTS: {
    HANDSET: '(max-width: 599.98px)',
    TABLET: '(min-width: 600px) and (max-width: 959.98px)',
    WEB: '(min-width: 960px)',
    HANDSET_PORTRAIT: '(max-width: 599.98px) and (orientation: portrait)',
    HANDSET_LANDSCAPE: '(max-width: 959.98px) and (orientation: landscape)',
    TABLET_PORTRAIT: '(min-width: 600px) and (max-width: 839.98px) and (orientation: portrait)',
    TABLET_LANDSCAPE: '(min-width: 900px) and (max-width: 1279.98px) and (orientation: landscape)',
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

export type AppConstants = typeof APP_CONSTANTS;
