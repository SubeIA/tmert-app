export const COMMON_UI = {
  ACTIONS: {
    LOADING: 'Cargando...',
    SAVE: 'Guardar',
    CANCEL: 'Cancelar',
    DELETE: 'Eliminar',
    EDIT: 'Editar',
    CLOSE: 'Cerrar',
    CONFIRM: 'Confirmar',
    BACK: 'Volver',
    NEXT: 'Siguiente',
    SUBMIT: 'Finalizar',
    SEARCH: 'Buscar',
    FILTER: 'Filtrar',
    EXPORT: 'Exportar',
    IMPORT: 'Importar',
  },

  NAVIGATION: {
    HOME: 'Inicio',
    DASHBOARD: 'Dashboard',
    USERS: 'Users',
    SETTINGS: 'Settings',
    ANALYTICS: 'Analytics',
    PROFILE: 'Profile',
    LOGOUT: 'Cerrar sesión',
  },

  NOTIFICATIONS: {
    SUCCESS: {
      LOGIN: 'Inicio de sesión exitoso',
      LOGOUT: 'Sesión cerrada exitosamente',
      SAVED: 'Cambios guardados exitosamente',
      DELETED: 'Eliminado exitosamente',
      UPDATED: 'Actualizado exitosamente',
      CREATED: 'Creado exitosamente',
    },
    ERROR: {
      LOGIN: 'Email o contraseña inválidos',
      GENERIC: 'Ocurrió un error. Por favor intenta de nuevo.',
      NETWORK: 'Error de red. Por favor verifica tu conexión.',
      UNAUTHORIZED: 'Acceso no autorizado',
      NOT_FOUND: 'Recurso no encontrado',
      SERVER: 'Error del servidor. Por favor intenta más tarde.',
    },
    INFO: {
      NO_DATA: 'No hay datos disponibles',
      LOADING: 'Cargando datos...',
      PROCESSING: 'Procesando...',
    },
    WARNING: {
      UNSAVED_CHANGES: 'Tienes cambios sin guardar',
      CONFIRM_DELETE: '¿Estás seguro de que quieres eliminar esto?',
      SESSION_EXPIRING: 'Tu sesión está por expirar',
    },
  },

  ARIA_LABELS: {
    TOGGLE_PASSWORD: 'Alternar visibilidad de contraseña',
    CLOSE_MENU: 'Cerrar menú',
    OPEN_MENU: 'Abrir menú',
    TOGGLE_SIDEBAR: 'Alternar barra lateral',
    SEARCH: 'Buscar',
    PROFILE_MENU: 'Menú de perfil',
    NOTIFICATIONS: 'Notificaciones',
  },
} as const;
