# Guía de Despliegue - Azure Static Web Apps

## Configuración de Variables de Entorno

### 1. Variables Requeridas en Azure

En **Azure Portal** → Tu Static Web App → **Configuration** → **Environment variables**, configura:

#### Firebase (Proyecto de Producción)

```
FIREBASE_API_KEY=AIzaSy...
FIREBASE_AUTH_DOMAIN=tu-proyecto-prod.firebaseapp.com
FIREBASE_PROJECT_ID=tu-proyecto-prod
FIREBASE_STORAGE_BUCKET=tu-proyecto-prod.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abc123
```

#### Otras Variables

```
NODE_ENV=production
BUILD_ENV=production
API_URL=https://tu-api.azurewebsites.net/api
TMERT_API_URL=https://tu-tmert-api.azurewebsites.net
APP_NAME=TMERT App
APP_VERSION=1.0.0
```

### 2. Configuración Local (Desarrollo)

Crea archivos locales (ya están en .gitignore):

**src/environments/environment.ts** (desarrollo local):

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  tmertApiUrl: 'http://localhost:8000',
  appName: 'TMERT App',
  version: '1.0.0',
  firebase: {
    apiKey: 'AIzaSy...', // Proyecto Firebase DEV
    authDomain: 'tmert-asistente-dev.firebaseapp.com',
    projectId: 'tmert-asistente-dev',
    storageBucket: 'tmert-asistente-dev.firebasestorage.app',
    messagingSenderId: '...',
    appId: '...',
  },
};
```

### 3. Crear Proyectos Firebase Separados

#### Proyecto DEV (Desarrollo Local)

1. Firebase Console → Crear proyecto: `tmert-asistente-dev`
2. Copiar credenciales a `environment.ts`

#### Proyecto PROD (Azure Producción)

1. Firebase Console → Crear proyecto: `tmert-asistente-prod`
2. Configurar credenciales como variables de entorno en Azure

### 4. Workflow de Build

El script `scripts/set-env.js` se ejecuta automáticamente:

- **Local**: Usa `environment.ts` directamente
- **Azure CI/CD**: Genera archivos desde variables de entorno antes del build

### 5. Comandos Útiles

```bash
# Desarrollo local
npm start

# Build de producción local (usando environment.prod.ts)
npm run build

# Generar environment desde variables de entorno (simular Azure)
node scripts/set-env.js

# Build completo con environment desde variables
node scripts/set-env.js && npm run build
```

### 6. Verificar Configuración en Azure

Después del despliegue:

1. Abre la aplicación en el navegador
2. Abre DevTools → Console
3. Busca logs de Firebase que muestran el projectId
4. Verifica que esté usando el proyecto correcto

### 7. Seguridad

✅ **Sí subir a Git:**

- `environment.example.ts` (plantilla)
- `scripts/set-env.js` (generador)
- `.gitignore` (protección)

❌ **NO subir a Git:**

- `environment.ts` (desarrollo)
- `environment.prod.ts` (producción)
- Archivos con credenciales reales

### 8. Troubleshooting

**Error: Variables de entorno faltantes**

- Verifica que todas las variables FIREBASE\_\* estén configuradas en Azure
- Revisa los logs de build en GitHub Actions

**App usa proyecto Firebase incorrecto**

- Verifica las variables en Azure Configuration
- Fuerza un nuevo deployment: Settings → General → Re-deploy

**Build local falla**

- Asegúrate de tener `environment.ts` creado localmente
- Usa `environment.example.ts` como referencia
