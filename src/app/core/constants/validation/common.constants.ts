export const COMMON_VALIDATION = {
  PATTERNS: {
    PHONE: /^\+?[\d\s-()]+$/,
    URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
    ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
    NUMERIC: /^\d+$/,
  },
  MESSAGES: {
    REQUIRED: 'Este campo es requerido',
    PATTERN: 'Formato inválido',
    MIN_LENGTH: (length: number) => `La longitud mínima es de ${length} caracteres`,
    MAX_LENGTH: (length: number) => `La longitud máxima es de ${length} caracteres`,
    MIN_VALUE: (value: number) => `El valor mínimo es ${value}`,
    MAX_VALUE: (value: number) => `El valor máximo es ${value}`,
  },
  LENGTH: {
    NAME_MIN: 2,
    NAME_MAX: 50,
    DESCRIPTION_MAX: 500,
    PHONE_MIN: 7,
    PHONE_MAX: 15,
  },
} as const;
