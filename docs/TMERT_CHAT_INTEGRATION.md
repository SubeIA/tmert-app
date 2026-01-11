# Integración TMERT Chat - Guía Rápida

## ✅ Cambios Realizados

Se ha integrado el servicio TMERT API en el componente de chat existente de la aplicación.

### Componentes Modificados

1. **`chat-assistant.component.ts`**
   - ✅ Ahora se conecta automáticamente al API TMERT
   - ✅ Crea threads de conversación al inicializar
   - ✅ Envía mensajes y recibe respuestas del asistente
   - ✅ Gestiona errores y estados de carga
   - ✅ Mantiene contexto con metadata (userId, evaluationId, companyId)

2. **`floating-chat.component.ts`**
   - ✅ Pasa parámetros de contexto al chat-assistant
   - ✅ Emite eventos de thread creado, mensajes y errores

3. **`tmert-evaluation.component.ts`**
   - ✅ Configura el chat con IDs de evaluación y empresa
   - ✅ Recibe callbacks de eventos del chat

## 🔧 Configuración Necesaria

### 1. Obtener Assistant ID

Antes de usar el chat, necesitas el ID de tu asistente TMERT:

**Opción A: Desde la UI de OpenAI**

- Ve a https://platform.openai.com/assistants
- Copia el ID del asistente (formato: `asst_xxxxxxxxxxxx`)

**Opción B: Programáticamente**

```typescript
// En un componente o servicio
this.tmertService.listAssistants().subscribe(response => {
  console.log('Asistentes disponibles:', response.assistants);
  // Usar el ID del asistente deseado
});
```

### 2. Actualizar el Assistant ID

Edita `/src/app/features/tmert-evaluation/tmert-evaluation.component.ts`:

```typescript
// Línea ~32
assistantId = 'asst_TU_ID_REAL_AQUI'; // ← Reemplazar
```

### 3. Configurar User ID (Opcional pero recomendado)

Integra con tu servicio de autenticación:

```typescript
// En tmert-evaluation.component.ts
export class TmertEvaluationComponent implements OnInit {
  private authService = inject(AuthService); // Tu servicio de auth

  userId = computed(() => this.authService.currentUser()?.uid || 'anonymous');
}
```

### 4. Verificar URL del API

Asegúrate de que el API TMERT esté configurado en `environment.ts`:

```typescript
// src/environments/environment.ts
export const environment = {
  // ...
  tmertApiUrl: 'http://localhost:8000', // URL de tu API TMERT
};
```

## 🎯 Cómo Funciona

### Flujo Automático

1. **Usuario abre evaluación** → El componente carga
2. **Chat se inicializa** → Automáticamente crea un thread en TMERT
3. **Usuario escribe mensaje** → Se envía al asistente TMERT
4. **Asistente responde** → La respuesta se muestra en el chat
5. **Contexto preservado** → Todos los mensajes quedan en el thread

### Metadata Enviada al Thread

El chat envía contexto automáticamente:

```typescript
{
  user_id: 'uid-del-usuario',
  evaluation_id: 'eval-123',
  company_id: 'company-456',
  session_id: 'session-1234567890'
}
```

Esto permite que el asistente tenga contexto sobre:

- Quién está preguntando
- Qué evaluación está haciendo
- De qué empresa es la evaluación

## 📊 Eventos Disponibles

El componente emite eventos que puedes capturar:

### En el HTML

```html
<app-floating-chat
  [assistantId]="assistantId"
  [userId]="userId"
  [evaluationId]="evaluationId()"
  [companyId]="companyId()"
  (threadCreated)="onThreadCreated($event)"
  (messageReceived)="onMessageReceived($event)"
  (errorOccurred)="onChatError($event)"
></app-floating-chat>
```

### En el TypeScript

```typescript
onThreadCreated(threadId: string): void {
  // Se creó el thread, puedes guardarlo en Firestore
  console.log('Thread ID:', threadId);
}

onMessageReceived(message: ChatMessage): void {
  // El asistente envió una respuesta
  console.log('Respuesta:', message.content);
}

onChatError(error: string): void {
  // Ocurrió un error
  console.error('Error:', error);
}
```

## 🧪 Testing

### 1. Verifica que el API esté corriendo

```bash
curl http://localhost:8000/health
```

### 2. Lista asistentes disponibles

```bash
curl http://localhost:8000/api/v1/tmert/assistants
```

### 3. Prueba el chat

1. Abre una evaluación
2. Haz clic en el botón flotante del chat
3. Escribe un mensaje
4. El asistente debería responder automáticamente

## 🔍 Troubleshooting

### Error: "Thread not found" o "Assistant not found"

- Verifica que `assistantId` sea correcto
- Verifica que el API esté corriendo
- Revisa la consola del navegador

### Error: Connection refused

- Verifica que `tmertApiUrl` en `environment.ts` sea correcta
- Verifica que el API TMERT esté corriendo en ese puerto
- Revisa configuración de CORS en el backend

### El chat no responde

- Abre DevTools → Console y busca errores
- Verifica que el thread se haya creado (mensaje en consola)
- Verifica que el `assistantId` sea válido

### Error: "Cannot find module '@core/services/tmert/tmert.service'"

- Ejecuta: `npm install` (por si faltan dependencias)
- Verifica que el archivo existe en la ruta correcta
- Reinicia el servidor: `ng serve`

## 📝 Próximos Pasos (Opcional)

### 1. Guardar Thread ID en Firestore

```typescript
onThreadCreated(threadId: string): void {
  this.evaluationService.updateEvaluation(this.evaluationId()!, {
    tmertThreadId: threadId
  });
}
```

### 2. Recuperar Thread existente

```typescript
async ngOnInit() {
  const evaluation = await this.loadEvaluation(id);
  if (evaluation.tmertThreadId) {
    // Cargar historial del thread existente
    this.chatComponent.loadMessageHistory();
  }
}
```

### 3. Personalizar instrucciones por evaluación

```typescript
// En chat-assistant, puedes agregar @Input() instructions
<app-chat-assistant
  [instructions]="'El usuario está evaluando una empresa de construcción...'"
></app-chat-assistant>
```

## 🎨 Personalización

### Cambiar Assistant ID dinámicamente

```typescript
// Puedes tener diferentes asistentes por tipo de evaluación
get assistantId(): string {
  switch(this.evaluationType) {
    case 'construccion': return 'asst_construccion_xxx';
    case 'mineria': return 'asst_mineria_xxx';
    default: return 'asst_general_xxx';
  }
}
```

### Agregar botones de sugerencias

```html
<!-- En chat-assistant.component.html -->
<div class="suggestions">
  <button (click)="onSuggestionClick('¿Qué es un TMERT?')">¿Qué es un TMERT?</button>
  <button (click)="onSuggestionClick('Ayúdame a completar la matriz')">
    Ayúdame con la matriz
  </button>
</div>
```

## 📚 Documentación Completa

Para más detalles sobre el servicio TMERT, consulta:

- `docs/TMERT_SERVICE_USAGE.md` - Documentación completa del servicio
- API Docs: http://localhost:8000/docs (cuando el API esté corriendo)

## ✅ Checklist de Configuración

- [ ] API TMERT corriendo en http://localhost:8000
- [ ] Assistant ID configurado en `tmert-evaluation.component.ts`
- [ ] URL del API configurada en `environment.ts`
- [ ] User ID integrado (o usando fallback)
- [ ] Chat funciona en la página de evaluación
- [ ] Asistente responde correctamente
- [ ] Errores se muestran al usuario

---

**¿Dudas o problemas?** Revisa los logs en la consola del navegador y en el terminal del servidor.
