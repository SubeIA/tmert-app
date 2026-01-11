#!/usr/bin/env node

/**
 * Script para generar archivos de environment desde variables de entorno
 * Se ejecuta automáticamente en Azure Static Web Apps antes del build
 */

const fs = require('fs');
const path = require('path');

const environmentsDir = path.join(__dirname, '..', 'src', 'environments');

// Determinar si es producción o desarrollo
const isProduction =
  process.env.NODE_ENV === 'production' || process.env.BUILD_ENV === 'production';
const targetFile = isProduction ? 'environment.prod.ts' : 'environment.ts';

console.log(`🔧 Generando ${targetFile} desde variables de entorno...`);
console.log(`📦 Modo: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);

// Obtener variables de entorno (con valores por defecto para desarrollo local)
const config = {
  production: isProduction,
  apiUrl: process.env.API_URL || 'http://localhost:3000/api',
  tmertApiUrl: process.env.TMERT_API_URL || 'http://localhost:8000',
  appName: process.env.APP_NAME || 'TMERT App',
  version: process.env.APP_VERSION || '1.0.0',
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY || '',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.FIREBASE_APP_ID || '',
  },
};

// Validar que las credenciales de Firebase estén presentes en producción
if (isProduction) {
  const missingVars = [];
  if (!config.firebase.apiKey) missingVars.push('FIREBASE_API_KEY');
  if (!config.firebase.authDomain) missingVars.push('FIREBASE_AUTH_DOMAIN');
  if (!config.firebase.projectId) missingVars.push('FIREBASE_PROJECT_ID');

  if (missingVars.length > 0) {
    console.error('❌ Error: Variables de entorno faltantes:', missingVars.join(', '));
    console.error(
      '💡 Configúralas en Azure Static Web Apps → Configuration → Environment variables'
    );
    process.exit(1);
  }
}

// Generar contenido del archivo
const fileContent = `/**
 * Este archivo es generado automáticamente por scripts/set-env.js
 * NO EDITAR MANUALMENTE
 * 
 * Generado: ${new Date().toISOString()}
 * Modo: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}
 */

export const environment = ${JSON.stringify(config, null, 2)};
`;

// Asegurar que el directorio existe
if (!fs.existsSync(environmentsDir)) {
  fs.mkdirSync(environmentsDir, { recursive: true });
}

// Escribir archivo
const targetPath = path.join(environmentsDir, targetFile);
fs.writeFileSync(targetPath, fileContent, 'utf8');

console.log(`✅ ${targetFile} generado exitosamente`);
console.log(`📍 Ubicación: ${targetPath}`);
console.log('🔐 Firebase Project:', config.firebase.projectId || '(no configurado)');
