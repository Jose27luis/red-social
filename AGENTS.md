# Code Review Rules - Red Academica UNAMAD

Este archivo define los estándares de código que el AI Code Reviewer debe verificar.

## General

- Todo el código debe estar en español (comentarios, nombres de variables descriptivas)
- No usar `console.log` en código de producción (usar Logger en backend)
- No dejar código comentado sin explicación
- Máximo 300 líneas por archivo
- Imports ordenados: externos primero, luego internos

## TypeScript

- **NO usar `any`** - siempre definir tipos específicos
- Usar `const` sobre `let` cuando la variable no se reasigna
- Usar optional chaining (`?.`) en lugar de verificaciones manuales
- Usar nullish coalescing (`??`) en lugar de `||` para valores por defecto
- Interfaces sobre types para objetos
- Enums para valores fijos conocidos

## Backend (NestJS)

### Estructura
- Cada módulo debe tener: controller, service, module, DTOs
- Los servicios no deben acceder directamente a `req` o `res`
- Usar DTOs para validación de entrada con `class-validator`

### Seguridad
- Nunca exponer información sensible en respuestas de error
- Usar `@UseGuards(JwtAuthGuard)` en endpoints protegidos
- Validar todos los inputs con DTOs
- No hardcodear secretos o credenciales

### Prisma/Base de Datos
- Usar transacciones para operaciones múltiples
- No hacer queries N+1 (usar `include` apropiadamente)
- Siempre manejar errores de Prisma

### Manejo de Errores
- Usar excepciones de NestJS (`BadRequestException`, `UnauthorizedException`, etc.)
- Incluir mensajes descriptivos en las excepciones
- No usar try/catch vacíos

## Frontend (Next.js)

### Componentes React
- Usar componentes funcionales con hooks
- Extraer lógica compleja a custom hooks
- Props deben tener interfaces definidas
- Usar `memo` para componentes que reciben las mismas props frecuentemente

### Estado
- Preferir React Query para estado del servidor
- Usar `useState` para estado local simple
- No duplicar estado del servidor en estado local

### Estilos
- Usar clases de Tailwind CSS
- No usar estilos inline excepto para valores dinámicos
- Usar `cn()` para combinar clases condicionales

### Accesibilidad
- Todas las imágenes deben tener `alt`
- Botones deben tener texto o `aria-label`
- Formularios deben tener labels asociados

### Performance
- Usar `next/image` para imágenes
- Lazy loading para componentes pesados
- No hacer fetching en el render (usar useEffect o React Query)

## Testing

- Tests deben tener descripciones claras en español
- Usar mocks para dependencias externas
- Cubrir casos edge y errores
- No testear implementación, testear comportamiento

## Git

- Commits deben seguir Conventional Commits
- No commitear archivos `.env` o secretos
- No commitear `node_modules`, `dist`, `coverage`

## Ejemplos de Violaciones

### MAL
```typescript
// any type
const data: any = await fetch(url);

// console.log en producción
console.log('debug:', data);

// código comentado sin explicación
// const oldFunction = () => {};

// hardcoded secrets
const API_KEY = "sk-12345";
```

### BIEN
```typescript
// tipo específico
const data: UserResponse = await fetch(url);

// usar Logger
this.logger.debug('Fetched data', { userId });

// sin código muerto

// usar variables de entorno
const API_KEY = this.configService.get('API_KEY');
```
