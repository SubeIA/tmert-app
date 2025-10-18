export const EMAIL_VALIDATION = {
  PATTERN: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  LENGTH: {
    MAX: 100,
  },
  MESSAGES: {
    REQUIRED: 'El email es requerido',
    INVALID: 'Por favor ingresa un email válido',
    MAX_LENGTH: 'El email no debe exceder los 100 caracteres',
  },
  RULES: {
    required: true,
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    maxLength: 100,
  },
} as const;
