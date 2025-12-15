# Guía de Rate Limiting con @nestjs/throttler

Esta guía explica cómo está configurado el rate limiting en la aplicación para prevenir ataques de brute force, DDoS y abuso de APIs.

---

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Configuración Global](#configuración-global)
3. [Limitadores Configurados](#limitadores-configurados)
4. [Endpoints Protegidos](#endpoints-protegidos)
5. [Cómo Funciona](#cómo-funciona)
6. [Personalización](#personalización)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Introducción

### ¿Qué es Rate Limiting?

**Rate limiting** controla la frecuencia con la que los usuarios pueden hacer requests a la API, previniendo:

- ✅ **Brute Force Attacks** - Intentos repetidos de adivinar contraseñas
- ✅ **DDoS Attacks** - Sobrecarga intencional del servidor
- ✅ **API Abuse** - Uso excesivo de recursos
- ✅ **Credential Stuffing** - Probar credenciales robadas
- ✅ **Scraping** - Extracción masiva de datos

### ¿Por qué @nestjs/throttler?

`@nestjs/throttler` es la solución oficial de NestJS para rate limiting, ofreciendo:
- Configuración flexible por endpoint
- Múltiples estrategias de limitación
- Integración nativa con guards de NestJS
- Soporte para diferentes almacenamiento (memoria, Redis)

---

## ⚙️ Configuración Global

### 1. Instalación

```bash
npm install @nestjs/throttler
```

**Versión instalada:** `@nestjs/throttler@5.2.0`

### 2. Configuración en AppModule

Archivo: `src/app.module.ts`

```typescript
ThrottlerModule.forRoot([
  {
    name: 'short',
    ttl: 1000,    // 1 segundo
    limit: 3,     // 3 requests por segundo
  },
  {
    name: 'medium',
    ttl: 10000,   // 10 segundos
    limit: 20,    // 20 requests por 10 segundos
  },
  {
    name: 'long',
    ttl: 60000,   // 1 minuto
    limit: 100,   // 100 requests por minuto (default)
  },
]),
```

### 3. Activación Global

El ThrottlerGuard se aplica globalmente a toda la aplicación:

```typescript
providers: [
  {
    provide: APP_GUARD,
    useClass: ThrottlerGuard,
  },
],
```

**Esto significa que TODOS los endpoints están protegidos por defecto.**

---

## 🔧 Limitadores Configurados

| Nombre | TTL | Límite | Uso Recomendado |
|--------|-----|--------|-----------------|
| **short** | 1 segundo | 3 requests | Endpoints muy sensibles (login, register) |
| **medium** | 10 segundos | 20 requests | Endpoints sensibles (refresh token, uploads) |
| **long** | 1 minuto | 100 requests | Default global para todos los endpoints |

### Cómo Elegir el Limitador

**Usa `short` para:**
- Login
- Registro
- Cambio de contraseña
- Recuperación de contraseña

**Usa `medium` para:**
- Refresh token
- Subida de archivos
- Búsquedas
- Operaciones de escritura

**Usa `long` (default) para:**
- Lectura de datos
- APIs públicas
- Endpoints GET en general

---

## 🛡️ Endpoints Protegidos

### 1. Autenticación (auth.controller.ts)

#### POST /auth/register

```typescript
@Throttle({ short: { ttl: 1000, limit: 3 } })
```

**Límite:** 3 registros por segundo
**Previene:** Spam de cuentas

**Respuestas:**
- `201` - Usuario registrado exitosamente
- `429` - Too many requests (más de 3 intentos/segundo)

#### POST /auth/login

```typescript
@Throttle({ short: { ttl: 60000, limit: 5 } })
```

**Límite:** 5 intentos de login por minuto
**Previene:** Brute force attacks

**Respuestas:**
- `200` - Login exitoso
- `401` - Credenciales incorrectas
- `429` - Too many login attempts. Try again later.

**Ejemplo de ataque bloqueado:**
```bash
# Intento 1: ✅ OK
curl -X POST http://localhost:3001/auth/login -d '{"email":"test@test.com","password":"wrong"}'

# Intento 2: ✅ OK
curl -X POST http://localhost:3001/auth/login -d '{"email":"test@test.com","password":"wrong"}'

# ...

# Intento 6: ❌ 429 Too Many Requests
curl -X POST http://localhost:3001/auth/login -d '{"email":"test@test.com","password":"wrong"}'
```

#### POST /auth/refresh

```typescript
@Throttle({ medium: { ttl: 60000, limit: 10 } })
```

**Límite:** 10 refresh por minuto
**Previene:** Abuso de refresh tokens

### 2. Default Global (Todos los demás endpoints)

Todos los endpoints sin configuración específica usan el limitador `long`:

**Límite:** 100 requests por minuto

---

## 🔍 Cómo Funciona

### Flujo de una Request

```
1. Cliente hace request
   ↓
2. ThrottlerGuard intercepta
   ↓
3. Verifica contador en memoria/Redis
   ↓
4. ¿Excede límite?
   ├─ SÍ  → 429 Too Many Requests
   └─ NO  → Incrementa contador y procede
```

### Almacenamiento en Memoria

Por defecto, @nestjs/throttler usa **almacenamiento en memoria**:

**Ventajas:**
- ✅ Sin dependencias externas
- ✅ Rápido
- ✅ Fácil de configurar

**Desventajas:**
- ❌ Se resetea al reiniciar servidor
- ❌ No funciona con múltiples instancias (load balancer)

**Para producción con múltiples instancias, considera usar Redis:**

```typescript
import { ThrottlerStorageRedisService } from '@nestjs/throttler-storage-redis';

ThrottlerModule.forRoot({
  storage: new ThrottlerStorageRedisService('redis://localhost:6379'),
  throttlers: [/* ... */],
});
```

---

## 🎨 Personalización

### Aplicar Rate Limiting Específico a un Endpoint

```typescript
import { Throttle } from '@nestjs/throttler';

@Controller('posts')
export class PostsController {
  // Endpoint muy restrictivo
  @Post()
  @Throttle({ short: { ttl: 10000, limit: 5 } })
  async createPost() {
    // Solo 5 posts cada 10 segundos
  }

  // Endpoint con límite medio
  @Get()
  @Throttle({ medium: { ttl: 60000, limit: 50 } })
  async getAllPosts() {
    // 50 requests por minuto
  }
}
```

### Deshabilitar Rate Limiting en un Endpoint

```typescript
import { SkipThrottle } from '@nestjs/throttler';

@Controller('public')
export class PublicController {
  // Sin rate limiting
  @Get('status')
  @SkipThrottle()
  async getStatus() {
    return { status: 'ok' };
  }

  // Solo desabilitar un limitador específico
  @Get('data')
  @SkipThrottle({ short: true }) // Desabilita 'short', pero 'medium' y 'long' siguen activos
  async getData() {
    // ...
  }
}
```

### Rate Limiting por Usuario Autenticado

```typescript
import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class UserThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Rastrear por usuario autenticado en lugar de IP
    return req.user?.id || req.ip;
  }
}

// Usar en el controlador
@Controller('users')
@UseGuards(UserThrottlerGuard)
export class UsersController {
  // Rate limiting por usuario, no por IP
}
```

### Configuración Dinámica por Entorno

```typescript
// .env
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100

// app.module.ts
ThrottlerModule.forRoot([
  {
    name: 'long',
    ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10) * 1000,
    limit: parseInt(process.env.RATE_LIMIT_LIMIT || '100', 10),
  },
]),
```

---

## 🧪 Testing

### Probar Rate Limiting Manualmente

#### 1. Con curl

```bash
# Test de login (5 intentos por minuto)
for i in {1..10}; do
  echo "Intento $i:"
  curl -X POST http://localhost:3001/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' \
    -w "\nStatus: %{http_code}\n\n"
  sleep 1
done
```

**Output esperado:**
```
Intento 1: Status: 401 (Unauthorized)
Intento 2: Status: 401
Intento 3: Status: 401
Intento 4: Status: 401
Intento 5: Status: 401
Intento 6: Status: 429 (Too Many Requests) ✅
Intento 7: Status: 429
...
```

#### 2. Con Postman/Insomnia

1. Configura un request POST a `/auth/login`
2. Usa el **Collection Runner** o **Request Runner**
3. Ejecuta 10 veces seguidas
4. Observa que después del request #5, recibes `429`

#### 3. Con Artillery (Load Testing)

```bash
npm install -g artillery

# artillery-test.yml
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 10
      arrivalRate: 20
scenarios:
  - flow:
      - post:
          url: "/auth/login"
          json:
            email: "test@test.com"
            password: "wrong"

# Ejecutar
artillery run artillery-test.yml
```

### Testing Automatizado (Jest)

```typescript
describe('Rate Limiting', () => {
  it('should block after 5 login attempts', async () => {
    const requests = [];

    // Hacer 6 requests
    for (let i = 0; i < 6; i++) {
      requests.push(
        request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: 'test@test.com', password: 'wrong' })
      );
    }

    const responses = await Promise.all(requests);

    // Primeros 5 deberían ser 401 (Unauthorized)
    responses.slice(0, 5).forEach(res => {
      expect(res.status).toBe(401);
    });

    // El 6to debería ser 429 (Too Many Requests)
    expect(responses[5].status).toBe(429);
  });
});
```

---

## 🚨 Troubleshooting

### Problema 1: Rate limiting no funciona

**Causa:** ThrottlerGuard no está aplicado

**Solución:**
```typescript
// app.module.ts
providers: [
  {
    provide: APP_GUARD,
    useClass: ThrottlerGuard,
  },
],
```

### Problema 2: Límites se resetean constantemente

**Causa:** Servidor reiniciándose frecuentemente (almacenamiento en memoria)

**Solución:** Usar Redis para almacenamiento persistente

```bash
npm install @nestjs/throttler-storage-redis redis

# app.module.ts
import { ThrottlerStorageRedisService } from '@nestjs/throttler-storage-redis';

ThrottlerModule.forRoot({
  storage: new ThrottlerStorageRedisService('redis://localhost:6379'),
  // ...
}),
```

### Problema 3: Headers de rate limiting no aparecen

**Respuesta esperada:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

**Solución:** Estos headers son agregados automáticamente por @nestjs/throttler en versiones recientes.

### Problema 4: Bloqueado por IP compartida (NAT, VPN)

**Causa:** Múltiples usuarios detrás de la misma IP pública

**Solución:** Rastrear por usuario autenticado:

```typescript
@Injectable()
export class UserThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Usar user ID si está autenticado, sino IP
    return req.user?.id || req.ip;
  }
}
```

### Problema 5: Necesito bypass temporal

**Solución:**
```typescript
// Para testing o admin
@Get('admin-endpoint')
@SkipThrottle()
async adminOnly() {
  // Sin rate limiting
}
```

---

## 📊 Respuesta HTTP 429

Cuando se excede el límite, el servidor responde:

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 60

{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

**Headers:**
- `Retry-After`: Segundos hasta que puede intentar nuevamente

---

## 🎯 Mejores Prácticas

### 1. Límites Diferentes por Endpoint

```typescript
// Endpoints públicos: más restrictivos
@Post('contact')
@Throttle({ short: { ttl: 60000, limit: 3 } })

// Endpoints autenticados: menos restrictivos
@Get('profile')
@UseGuards(JwtAuthGuard)
@Throttle({ long: { ttl: 60000, limit: 200 } })
```

### 2. Mensajes de Error Claros

```typescript
// Personalizar mensaje de error
@Post('login')
@Throttle({ short: { ttl: 60000, limit: 5 } })
@ApiResponse({ status: 429, description: 'Too many login attempts. Try again in 1 minute.' })
```

### 3. Logging de Rate Limiting

```typescript
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async handleRequest(context: ExecutionContext, limit: number, ttl: number): Promise<boolean> {
    const result = await super.handleRequest(context, limit, ttl);

    if (!result) {
      const request = context.switchToHttp().getRequest();
      console.warn(`Rate limit exceeded for IP: ${request.ip}, endpoint: ${request.url}`);
    }

    return result;
  }
}
```

### 4. Monitoreo

Monitorea las métricas de rate limiting:
- Número de requests bloqueadas (429)
- IPs más bloqueadas
- Endpoints más afectados

```typescript
// Ejemplo con Winston o similar
if (response.status === 429) {
  logger.warn('Rate limit hit', {
    ip: request.ip,
    endpoint: request.url,
    user: request.user?.id,
  });
}
```

---

## 🔗 Recursos Adicionales

- [@nestjs/throttler Documentation](https://docs.nestjs.com/security/rate-limiting)
- [OWASP Rate Limiting Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html)
- [Redis Storage for Throttler](https://github.com/nestjs/throttler-storage-redis)

---

## 📝 Resumen de Configuración Actual

| Endpoint | Límite | TTL | Estrategia |
|----------|--------|-----|------------|
| `POST /auth/login` | 5 | 60s | Prevenir brute force |
| `POST /auth/register` | 3 | 1s | Prevenir spam |
| `POST /auth/refresh` | 10 | 60s | Prevenir abuso de tokens |
| **Default (todos los demás)** | 100 | 60s | Protección general |

**Almacenamiento:** Memoria (considerar Redis para producción)
**Guard:** Aplicado globalmente a toda la aplicación
**Rastreo:** Por IP (por defecto)

---

**Última actualización:** Diciembre 2025
**Mantenido por:** Equipo de Desarrollo
