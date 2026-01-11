# Configuración de Environments con Variables de Entorno

## 📋 Resumen

Este proyecto usa **dos proyectos Firebase separados**:

- **DEV**: `tmert-asistente-dev` (desarrollo local)
- **PROD**: `tmert-asistente-prod` (Azure Static Web Apps)

## 🚀 Setup Local (Primera vez)

### 1. Copia el archivo de ejemplo

```bash
cp src/environments/environment.example.ts src/environments/environment.ts
```

### 2. Edita `environment.ts` con tus credenciales DEV

Abre `src/environments/environment.ts` y actualiza con las credenciales de tu proyecto Firebase de desarrollo.

### 3. Inicia la app

```bash
npm start
```

## ☁️ Setup en Azure Static Web Apps

### 1. Crear proyecto Firebase de producción

En [Firebase Console](https://console.firebase.google.com):

1. Crear nuevo proyecto: `tmert-asistente-prod`
2. Ir a Project Settings → General
3. Copiar las credenciales de Firebase

### 2. Configurar variables en Azure

Azure Portal → Tu Static Web App → **Configuration** → **Environment variables**:

```
FIREBASE_API_KEY=AIzaSy...tu-key-de-prod
FIREBASE_AUTH_DOMAIN=tmert-asistente-prod.firebaseapp.com
FIREBASE_PROJECT_ID=tmert-asistente-prod
FIREBASE_STORAGE_BUCKET=tmert-asistente-prod.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abc123
NODE_ENV=production
BUILD_ENV=production
```

### 3. El workflow de Azure lo hará automáticamente

El script `scripts/set-env.js` se ejecuta antes del build y genera `environment.prod.ts` desde las variables de Azure.

## 🛠️ Comandos Disponibles

```bash
# Desarrollo local (usa environment.ts)
npm start

# Build de producción local (genera desde variables de entorno)
npm run build:prod

# Generar environment manualmente desde variables de entorno
npm run set-env
```

## 🔒 Seguridad

✅ **Archivos en Git:**

- `environment.example.ts` (plantilla pública)
- `scripts/set-env.js` (generador)
- `.gitignore` (protección)

❌ **NO en Git (ya configurado en .gitignore):**

- `environment.ts` (credenciales dev)
- `environment.prod.ts` (credenciales prod)

## 📝 Notas Importantes

1. **Nunca commitees** archivos con credenciales reales
2. **Cada desarrollador** debe crear su propio `environment.ts`
3. **En Azure**, las credenciales vienen de Environment Variables
4. **El script valida** que las variables estén presentes en producción

## 🆘 Troubleshooting

**"Error: Variables de entorno faltantes"**
→ Configura todas las variables FIREBASE\_\* en Azure

**"Firebase project not found"**
→ Verifica que el projectId sea correcto

**Build local falla por environment**
→ Copia `environment.example.ts` como `environment.ts` y actualiza las credenciales
