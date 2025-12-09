# Red Académica - Backend API

[![CI/CD Pipeline](https://github.com/USUARIO/REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/USUARIO/REPO/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/USUARIO/REPO/branch/main/graph/badge.svg)](https://codecov.io/gh/USUARIO/REPO)
[![Docker Image](https://img.shields.io/docker/v/USUARIO/red-academica-backend?label=docker&logo=docker)](https://hub.docker.com/r/USUARIO/red-academica-backend)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![NestJS](https://img.shields.io/badge/NestJS-10.x-E0234E?logo=nestjs)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-316192?logo=postgresql)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)

Backend para la Red Social Académica Interna de la Universidad. Construido con NestJS, PostgreSQL y Prisma.

## Características

- Autenticación JWT con Refresh Tokens
- Validación de correos institucionales
- Sistema de publicaciones con likes y comentarios
- Grupos de estudio
- Mensajería entre usuarios
- Eventos universitarios
- Compartición de recursos
- Sistema de notificaciones
- Feed personalizado
- Rate limiting y seguridad
- Documentación automática con Swagger

## Stack Tecnológico

- **Framework**: NestJS 10
- **Base de datos**: PostgreSQL
- **ORM**: Prisma
- **Autenticación**: JWT + Refresh Tokens
- **Validación**: class-validator + class-transformer
- **Documentación**: Swagger/OpenAPI
- **Contenedores**: Docker + Docker Compose

## Requisitos Previos

- Node.js 18 o superior
- Docker y Docker Compose
- npm o yarn

## Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copiar el archivo `.env.example` a `.env` y ajustar los valores:

```bash
cp .env.example .env
```

Editar `.env` con tus configuraciones:

```env
# Database
DATABASE_URL="postgresql://redacademica:redacademica123@localhost:5432/redacademica?schema=public"

# JWT
JWT_SECRET=tu-secreto-super-seguro-cambiar-en-produccion-minimo-32-caracteres
JWT_REFRESH_SECRET=otro-secreto-super-seguro-cambiar-en-produccion-minimo-32-caracteres

# Email (para verificación)
EMAIL_USER=tu-email@unamad.edu.pe
EMAIL_PASSWORD=tu-password-app

# Domain
UNIVERSIDAD_EMAIL_DOMAIN=@unamad.edu.pe
```

### 4. Levantar la base de datos con Docker

```bash
docker-compose up -d
```

Esto levantará PostgreSQL en el puerto 5432.

### 5. Generar Prisma Client y ejecutar migraciones

```bash
# Generar el cliente de Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate
```

### 6. Iniciar el servidor

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

El servidor estará disponible en `http://localhost:3001`

## Documentación de la API

Una vez que el servidor esté corriendo, puedes acceder a la documentación interactiva de Swagger en:

```
http://localhost:3001/api/docs
```

## Estructura del Proyecto

```
backend/
├── src/
│   ├── auth/                 # Módulo de autenticación
│   │   ├── guards/          # Guards de autenticación
│   │   ├── strategies/      # Estrategias de Passport
│   │   ├── dto/             # DTOs de autenticación
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── users/                # Gestión de usuarios
│   │   ├── dto/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   ├── posts/                # Publicaciones
│   │   ├── dto/
│   │   ├── posts.controller.ts
│   │   ├── posts.service.ts
│   │   └── posts.module.ts
│   ├── groups/               # Grupos de estudio
│   ├── messages/             # Sistema de mensajería
│   ├── events/               # Eventos universitarios
│   ├── resources/            # Recursos compartidos
│   ├── notifications/        # Sistema de notificaciones
│   ├── feed/                 # Feed personalizado
│   ├── common/               # Utilidades compartidas
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── filters/
│   │   └── decorators/
│   ├── config/               # Configuración
│   ├── database/             # Prisma service
│   │   ├── database.module.ts
│   │   └── prisma.service.ts
│   ├── app.module.ts
│   └── main.ts
├── prisma/
│   ├── schema.prisma         # Schema de base de datos
│   └── migrations/           # Migraciones
├── test/                     # Tests
├── .env                      # Variables de entorno (no commitear)
├── .env.example              # Ejemplo de variables de entorno
├── docker-compose.yml        # Configuración de Docker
├── package.json
└── README.md
```

## Endpoints Principales

### Autenticación

- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/login` - Iniciar sesión
- `POST /auth/refresh` - Refrescar token
- `POST /auth/logout` - Cerrar sesión
- `GET /auth/verify-email?token=xxx` - Verificar email
- `GET /auth/me` - Obtener usuario actual

### Usuarios

- `GET /users` - Listar usuarios (paginado)
- `GET /users/search?q=query` - Buscar usuarios
- `GET /users/profile/:id` - Obtener perfil de usuario
- `PUT /users/profile` - Actualizar perfil
- `DELETE /users/account` - Eliminar cuenta (soft delete)

### Posts

- `POST /posts` - Crear publicación
- `GET /posts` - Listar publicaciones (paginado)
- `GET /posts/:id` - Obtener publicación por ID
- `PUT /posts/:id` - Actualizar publicación
- `DELETE /posts/:id` - Eliminar publicación
- `POST /posts/:id/comments` - Crear comentario
- `DELETE /posts/comments/:commentId` - Eliminar comentario
- `POST /posts/:id/like` - Dar like
- `DELETE /posts/:id/like` - Quitar like
- `GET /posts/:id/liked` - Verificar si usuario dio like

### Grupos

- `GET /groups` - Listar grupos

### Mensajes

- `GET /messages/conversation/:userId` - Obtener conversación con un usuario

### Eventos

- `GET /events` - Listar eventos próximos

### Recursos

- `GET /resources` - Listar recursos compartidos

### Notificaciones

- `GET /notifications` - Obtener notificaciones del usuario

### Feed

- `GET /feed` - Obtener feed personalizado

## Seguridad Implementada

- ✅ Autenticación JWT con tokens de acceso (15 min) y refresh tokens (7 días)
- ✅ Validación de correos institucionales (@unamad.edu.pe)
- ✅ Rate limiting (100 peticiones/min por IP)
- ✅ Hash de contraseñas con bcrypt (12 rounds)
- ✅ CORS restrictivo
- ✅ Validación de datos con class-validator
- ✅ Sanitización de entradas
- ✅ Guards de autenticación en rutas protegidas
- ✅ TypeScript estricto (no any)

## Comandos Útiles

### Desarrollo

```bash
# Iniciar en modo desarrollo (watch mode)
npm run start:dev

# Ejecutar tests
npm run test

# Ejecutar tests con coverage
npm run test:cov

# Linting y formato
npm run lint
npm run format
```

### Prisma

```bash
# Generar cliente de Prisma
npm run prisma:generate

# Crear migración
npm run prisma:migrate

# Abrir Prisma Studio (GUI para la BD)
npm run prisma:studio

# Reset de la base de datos (desarrollo)
npx prisma migrate reset
```

### Docker

```bash
# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Eliminar volúmenes
docker-compose down -v
```

## Testing

```bash
# Tests unitarios
npm run test

# Tests en modo watch
npm run test:watch

# Coverage
npm run test:cov

# Tests e2e
npm run test:e2e
```

## Próximos Pasos

### Módulos Pendientes de Completar

Los siguientes módulos tienen estructura básica pero necesitan implementación completa:

1. **Groups** - Funcionalidades pendientes:
   - Crear/editar/eliminar grupos
   - Unirse/salir de grupos
   - Roles de grupo (admin, moderador, miembro)
   - Gestión de miembros

2. **Messages** - Funcionalidades pendientes:
   - Enviar mensajes
   - Marcar como leído
   - Eliminar mensajes
   - Límite de mensajes por minuto

3. **Events** - Funcionalidades pendientes:
   - Crear/editar/eliminar eventos
   - Confirmar asistencia
   - Generar código QR
   - Recordatorios automáticos

4. **Resources** - Funcionalidades pendientes:
   - Subir archivos
   - Validación de tipos MIME
   - Escaneo de virus
   - Límite de recursos por usuario nuevo

5. **Notifications** - Funcionalidades pendientes:
   - Crear notificaciones automáticas
   - Marcar como leído
   - Configuración de preferencias

6. **Feed** - Funcionalidades pendientes:
   - Algoritmo de personalización
   - Filtros avanzados
   - Caché con Redis

### Mejoras Recomendadas

- [ ] Implementar sistema de email (verificación, recuperación de contraseña)
- [ ] Agregar upload de archivos a S3/Cloudinary
- [ ] Implementar caché con Redis
- [ ] Agregar tests unitarios y e2e
- [ ] Implementar sistema de moderación de contenido
- [ ] Agregar WebSockets para mensajería en tiempo real
- [ ] Implementar sistema de reportes
- [ ] Agregar analytics y estadísticas

## Troubleshooting

### La base de datos no se conecta

```bash
# Verificar que Docker esté corriendo
docker-compose ps

# Ver logs de PostgreSQL
docker-compose logs postgres
```

### Error en las migraciones

```bash
# Resetear la base de datos (¡CUIDADO EN PRODUCCIÓN!)
npx prisma migrate reset

# Aplicar migraciones nuevamente
npx prisma migrate dev
```

### Errores de TypeScript

```bash
# Limpiar y reconstruir
rm -rf dist node_modules
npm install
npm run build
```

## Contribución

1. Crear una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
2. Hacer commit de los cambios: `git commit -m 'feat: agregar nueva funcionalidad'`
3. Push a la rama: `git push origin feature/nueva-funcionalidad`
4. Crear un Pull Request

## Licencia

MIT

## Contacto

Para dudas sobre el proyecto, contactar con el equipo de desarrollo.
