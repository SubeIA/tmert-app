export const PASSWORD_VALIDATION = {
  PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  LENGTH: {
    MIN: 8,
    MAX: 128,
  },
  MESSAGES: {
    REQUIRED: 'La contraseña es requerida',
    INVALID:
      'La contraseña debe contener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial',
    MIN_LENGTH: 'La contraseña debe tener al menos 8 caracteres',
    MAX_LENGTH: 'La contraseña no debe exceder los 128 caracteres',
    MISMATCH: 'Las contraseñas no coinciden',
  },
  RULES: {
    required: true,
    minLength: 8,
    maxLength: 128,
  },
} as const;
