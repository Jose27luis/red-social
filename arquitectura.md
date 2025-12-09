# Arquitectura - Red Académica Interna

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Backend - NestJS](#backend---nestjs)
4. [Base de Datos](#base-de-datos)
5. [Módulos Principales](#módulos-principales)
6. [Seguridad](#seguridad)
7. [Infraestructura](#infraestructura)
8. [Frontend (Planificado)](#frontend-planificado)

---

## 🎯 Visión General

Este es un proyecto de **Red Social Académica Interna** diseñado para la Universidad Nacional de UNAMAD. Es una aplicación moderna, escalable y segura que facilita la interacción entre estudiantes, profesores y administrativos.

**Stack Tecnológico:**
- **Backend**: NestJS 10 + TypeScript 5.1
- **Base de Datos**: PostgreSQL 16 + Prisma ORM 5.7
- **Frontend**: Next.js 13+ (planificado)
- **Infraestructura**: Docker + Docker Compose
- **Autenticación**: JWT + Passport.js
- **Documentación API**: Swagger/OpenAPI

---

## 📁 Estructura del Proyecto

```
proyectoTiendaOmnilife/
├── backend/                              # Backend implementado
│   ├── src/
│   │   ├── auth/                        # Módulo de autenticación
│   │   ├── users/                       # Gestión de usuarios
│   │   ├── posts/                       # Publicaciones y comentarios
│   │   ├── groups/                      # Grupos de estudio
│   │   ├── messages/                    # Sistema de mensajería
│   │   ├── events/                      # Eventos universitarios
│   │   ├── resources/                   # Compartición de archivos
│   │   ├── notifications/               # Sistema de notificaciones
│   │   ├── feed/                        # Feed personalizado
│   │   ├── database/                    # Configuración Prisma
│   │   ├── common/                      # Utilidades compartidas
│   │   ├── config/                      # Configuración general
│   │   ├── app.module.ts                # Módulo raíz
│   │   ├── main.ts                      # Punto de entrada
│   │   └── ...
│   ├── prisma/
│   │   └── schema.prisma                # Esquema de BD
│   ├── test/                            # Tests
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   ├── .env.example
│   └── README.md
├── proyecto.md                          # Especificaciones detalladas
└── arquitectura.md                      # Este archivo
```

---

## 🚀 Backend - NestJS

### Características Principales

NestJS proporciona una arquitectura modular robusta basada en TypeScript:

- ✅ **Decoradores**: `@Module`, `@Controller`, `@Service`, `@Injectable`
- ✅ **Inyección de Dependencias**: Automática y configurable
- ✅ **Pipes**: Validación automática de datos
- ✅ **Guards**: Autenticación y autorización
- ✅ **Interceptors**: Transformación de respuestas
- ✅ **Exception Filters**: Manejo centralizado de errores

### Configuración Global (main.ts)

```typescript
// CORS - Restrictivo
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
});

// Validación Global con class-validator
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,              // Elimina propiedades no definidas
    forbidNonWhitelisted: true,   // Rechaza propiedades no definidas
    transform: true,              // Transforma automáticamente tipos
  }),
);

// Rate Limiting
app.use(ThrottlerGuard);  // 100 requests/minuto

// Swagger Documentation
const config = new DocumentBuilder()
  .setTitle('Red Académica API')
  .setVersion('1.0')
  .addBearerAuth()  // JWT Authentication
  .build();

SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

// Escucha en puerto 3001
await app.listen(process.env.PORT || 3001);
```

---

## 🗄️ Base de Datos

### Tecnología: Prisma ORM + PostgreSQL

Prisma es un ORM tipo-seguro que genera tipos TypeScript automáticamente.

### Modelos Principales

#### **User (Usuarios)**
```prisma
model User {
  id                 String
  email              String      @unique
  password           String
  firstName          String
  lastName           String
  department         String?
  career             String?
  bio                String?
  profileImage       String?
  interests          String[]
  role               UserRole    @default(STUDENT)  // STUDENT, PROFESSOR, ADMIN, ALUMNI
  privacyLevel       PrivacyLevel @default(PUBLIC)

  // Relaciones
  posts              Post[]
  comments           Comment[]
  likes              Like[]
  groupMemberships   GroupMember[]
  sentMessages       Message[]     @relation("sender")
  receivedMessages   Message[]     @relation("receiver")
  events             Event[]
  resources          Resource[]
  notifications      Notification[]
  followers          Follow[]      @relation("followers")
  following          Follow[]      @relation("following")
  reports            Report[]
  createdAt          DateTime      @default(now())
  updatedAt          DateTime      @updatedAt
}

enum UserRole {
  STUDENT
  PROFESSOR
  ADMIN
  ALUMNI
}
```

#### **Post (Publicaciones)**
```prisma
model Post {
  id            String
  content       String        @db.VarChar(3000)  // Máximo 3000 caracteres
  images        String[]                         // Máximo 10 imágenes
  type          PostType      @default(DISCUSSION)
  author        User          @relation(fields: [authorId], references: [id])
  authorId      String

  // Contenido interactivo
  comments      Comment[]
  likes         Like[]
  group         Group?        @relation(fields: [groupId], references: [id])
  groupId       String?

  // Auditoría
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

enum PostType {
  QUESTION          // Preguntas
  DISCUSSION        // Discusiones académicas
  RESOURCE          // Recursos educativos
  EVENT            // Anuncios de eventos
  ANNOUNCEMENT     // Anuncios generales
}
```

#### **Comment (Comentarios)**
```prisma
model Comment {
  id        String
  content   String      @db.VarChar(1000)  // Máximo 1000 caracteres
  post      Post        @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId    String
  author    User        @relation(fields: [authorId], references: [id])
  authorId  String
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
}
```

#### **Group (Grupos de Estudio)**
```prisma
model Group {
  id          String
  name        String
  description String?
  type        GroupType      @default(PUBLIC)  // PUBLIC, PRIVATE, INVITE_ONLY
  maxMembers  Int            @default(100)

  members     GroupMember[]
  posts       Post[]
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
}

model GroupMember {
  id        String
  user      User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    String
  group     Group          @relation(fields: [groupId], references: [id], onDelete: Cascade)
  groupId   String
  role      GroupMemberRole @default(MEMBER)  // ADMIN, MODERATOR, MEMBER
  joinedAt  DateTime       @default(now())

  @@unique([userId, groupId])
}

enum GroupMemberRole {
  ADMIN
  MODERATOR
  MEMBER
}
```

#### **Message (Mensajería)**
```prisma
model Message {
  id        String
  content   String      @db.VarChar(1000)  // Máximo 1000 caracteres
  sender    User        @relation("sender", fields: [senderId], references: [id])
  senderId  String
  receiver  User        @relation("receiver", fields: [receiverId], references: [id])
  receiverId String
  read      Boolean     @default(false)
  createdAt DateTime    @default(now())
}
```

#### **Event (Eventos)**
```prisma
model Event {
  id          String
  title       String
  description String?
  startDate   DateTime
  endDate     DateTime
  location    String?
  maxAttendees Int?      @default(500)
  organizer   User      @relation(fields: [organizerId], references: [id])
  organizerId String
  isOnline    Boolean   @default(false)
  createdAt   DateTime  @default(now())
}
```

#### **Resource (Recursos)**
```prisma
model Resource {
  id          String
  fileName    String
  filePath    String
  type        String      // PDF, DOCX, PPTX, etc.
  uploader    User        @relation(fields: [uploaderId], references: [id])
  uploaderId  String
  downloads   Int         @default(0)
  createdAt   DateTime    @default(now())
}
```

#### **Follow (Seguimiento)**
```prisma
model Follow {
  id          String
  follower    User      @relation("followers", fields: [followerId], references: [id], onDelete: Cascade)
  followerId  String
  following   User      @relation("following", fields: [followingId], references: [id], onDelete: Cascade)
  followingId String
  createdAt   DateTime  @default(now())

  @@unique([followerId, followingId])
}
```

#### **Notification (Notificaciones)**
```prisma
model Notification {
  id        String
  type      String      // post_like, comment, follow, etc.
  user      User        @relation(fields: [userId], references: [id])
  userId    String
  read      Boolean     @default(false)
  createdAt DateTime    @default(now())
}
```

#### **Report (Reportes y Moderación)**
```prisma
model Report {
  id        String
  reason    String
  reporter  User      @relation(fields: [reporterId], references: [id])
  reporterId String
  createdAt DateTime  @default(now())
}
```

---

## 🧩 Módulos Principales

### 1. **Auth Module** (Autenticación)

Ubicación: `src/auth/`

**Responsabilidades:**
- Registro de usuarios
- Login y logout
- Generación de JWT tokens
- Refresh tokens
- Validación de credenciales

**Estrategias de Passport:**
- **LocalStrategy**: Email + Password (login)
- **JwtStrategy**: Validación de access tokens
- **JwtRefreshStrategy**: Validación de refresh tokens

**Guards:**
- `JwtAuthGuard`: Protege rutas autenticadas
- `LocalAuthGuard`: Protege endpoint de login
- `JwtRefreshAuthGuard`: Protege endpoint de refresh

**DTOs:**
```typescript
// Registro
RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

// Login
LoginDto {
  email: string;
  password: string;
}

// Respuesta
LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}

// Refresh
RefreshTokenDto {
  refreshToken: string;
}
```

### 2. **Users Module** (Gestión de Usuarios)

Ubicación: `src/users/`

**Responsabilidades:**
- CRUD de usuarios
- Actualización de perfil
- Búsqueda de usuarios
- Gestión de privacidad
- Seguimiento (follow/unfollow)

**Endpoints Principales:**
```
GET    /users/:id              # Obtener usuario
GET    /users/search?q=...     # Buscar usuarios
PATCH  /users/:id              # Actualizar perfil
DELETE /users/:id              # Eliminar cuenta
POST   /users/:id/follow       # Seguir usuario
DELETE /users/:id/follow       # Dejar de seguir
```

### 3. **Posts Module** (Publicaciones)

Ubicación: `src/posts/`

**Responsabilidades:**
- Crear, leer, actualizar, eliminar publicaciones
- Comentarios en publicaciones
- Sistema de likes
- Filtrado por tipo (QUESTION, DISCUSSION, RESOURCE, EVENT, ANNOUNCEMENT)

**DTOs:**
```typescript
CreatePostDto {
  content: string;           // 1-3000 caracteres
  images?: string[];        // Máximo 10 imágenes
  type?: PostType;          // DISCUSSION (default)
  groupId?: string;         // Opcional - para publicar en grupo
}

CreateCommentDto {
  content: string;          // 1-1000 caracteres
  postId: string;
}
```

**Endpoints:**
```
GET    /posts                 # Obtener publicaciones
POST   /posts                 # Crear publicación
GET    /posts/:id             # Obtener publicación específica
PATCH  /posts/:id             # Actualizar publicación
DELETE /posts/:id             # Eliminar publicación
POST   /posts/:id/comments    # Comentar en publicación
POST   /posts/:id/likes       # Like en publicación
DELETE /posts/:id/likes       # Unlike en publicación
```

### 4. **Groups Module** (Grupos de Estudio)

Ubicación: `src/groups/`

**Responsabilidades:**
- Crear y gestionar grupos
- Agregar/remover miembros
- Roles en grupos (ADMIN, MODERATOR, MEMBER)
- Publicaciones en grupos

**Tipos de Grupos:**
- `PUBLIC`: Cualquiera puede unirse
- `PRIVATE`: Solo por invitación
- `INVITE_ONLY`: Solo administrador invita

### 5. **Messages Module** (Mensajería)

Ubicación: `src/messages/`

**Responsabilidades:**
- Mensajería 1 a 1 entre usuarios
- Marca como leído
- Historial de mensajes

**Límites:**
- Máximo 1000 caracteres por mensaje

### 6. **Events Module** (Eventos)

Ubicación: `src/events/`

**Responsabilidades:**
- Crear y gestionar eventos
- Registro de asistentes
- QR codes para check-in
- Eventos online y presenciales
- Máximo 500 asistentes

### 7. **Resources Module** (Recursos)

Ubicación: `src/resources/`

**Responsabilidades:**
- Compartición de archivos
- Descarga de recursos
- Rastreo de descargas
- Soporte de múltiples formatos (PDF, DOCX, PPTX, imágenes)

### 8. **Notifications Module** (Notificaciones)

Ubicación: `src/notifications/`

**Responsabilidades:**
- Sistema de notificaciones
- Notificación de likes, comentarios, menciones
- Seguimiento de nuevos followers
- Marca como leído

### 9. **Feed Module** (Feed Personalizado)

Ubicación: `src/feed/`

**Responsabilidades:**
- Algoritmo de feed personalizado
- Filtración según intereses
- Ordenamiento por relevancia
- Paginación

### 10. **Database Module** (Configuración Global)

Ubicación: `src/database/`

**Responsabilidades:**
- Configuración de Prisma
- Inicialización de conexión a PostgreSQL
- Gestión de migraciones

```typescript
// Inyectable en otros módulos
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

---

## 🔒 Seguridad

### Capas de Seguridad Implementadas

#### 1. **Autenticación JWT**
- Access tokens: 15 minutos de validez
- Refresh tokens: 7 días de validez
- Cambio de tokens en cada login

#### 2. **Hash de Contraseñas**
- Algoritmo: bcrypt
- Rounds: Mínimo 12
- Nunca se almacenan contraseñas en texto plano

#### 3. **Rate Limiting**
- Límite: 100 requests/minuto por IP
- Implementado con `@nestjs/throttler`

#### 4. **CORS Restrictivo**
- Solo dominios autorizados pueden acceder
- Soporte de credenciales habilitado

#### 5. **Validación de Entrada**
- `class-validator` valida todos los DTOs
- `whitelist: true` - rechaza propiedades no esperadas
- `forbidNonWhitelisted: true` - retorna error
- `transform: true` - convierte tipos automáticamente

#### 6. **Sanitización**
- Prevención de XSS: Validación en frontend y backend
- Prevención de SQL Injection: Prisma ORM (prevención nativa)
- Validación de contenido de usuario

#### 7. **Privacidad de Datos**
Tres niveles de privacidad:
- `PUBLIC`: Visible para todos
- `UNIVERSITY_ONLY`: Solo usuarios de la universidad
- `PRIVATE`: Solo el usuario ve su contenido

#### 8. **Límites de Contenido**
- Posts: Máximo 3000 caracteres, 10 imágenes
- Comentarios: Máximo 1000 caracteres
- Mensajes: Máximo 1000 caracteres
- Grupos: Máximo 100 miembros
- Eventos: Máximo 500 asistentes

---

## 🐳 Infraestructura

### Docker & Docker Compose

**Dockerfile** (Multi-stage build):
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run prisma:generate
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
EXPOSE 3001
CMD ["node", "dist/main"]
```

**docker-compose.yml** (Servicios):
```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: redacademica
      POSTGRES_USER: redacademica
      POSTGRES_PASSWORD: redacademica123
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U redacademica"]
      interval: 10s
      timeout: 5s
      retries: 5

  # NestJS Backend
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://redacademica:redacademica123@postgres:5432/redacademica
      NODE_ENV: development
    depends_on:
      postgres:
        condition: service_healthy
    command: npm run start:dev

networks:
  default:
    name: red-academica-network
```

### Comandos Principales

```bash
# Levantar infraestructura completa
docker-compose up -d

# Ver logs
docker-compose logs -f backend
docker-compose logs -f postgres

# Detener servicios
docker-compose down

# Reconstruir imagen
docker-compose up --build
```

---

## 🎨 Frontend (Planificado)

### Stack Tecnológico Propuesto

```json
{
  "framework": "Next.js 13+",
  "language": "TypeScript",
  "styling": "Tailwind CSS",
  "ui_components": "shadcn/ui o Radix UI",
  "forms": "React Hook Form + Zod",
  "state": "Zustand o React Context",
  "http_client": "Axios o Fetch API",
  "testing": "Jest + React Testing Library"
}
```

### Estructura Propuesta

```
frontend/
├── app/                    # App Router (Next.js 13+)
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── feed/
│   │   ├── users/
│   │   ├── groups/
│   │   ├── messages/
│   │   └── events/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/
│   ├── layout/
│   ├── posts/
│   ├── groups/
│   └── common/
├── lib/
│   ├── api-client.ts
│   ├── types.ts
│   └── utils.ts
├── hooks/
│   ├── useAuth.ts
│   ├── usePosts.ts
│   └── useUser.ts
├── styles/
│   └── globals.css
└── public/
    └── assets/
```

---

## 📊 Flujo de Autenticación

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │
       ├─ POST /auth/register (RegisterDto)
       │     └──> Valida email, hash contraseña, crea usuario
       │
       ├─ POST /auth/login (LoginDto)
       │     ├─> Valida credenciales
       │     ├─> Genera accessToken (15 min)
       │     ├─> Genera refreshToken (7 días)
       │     └─> Retorna LoginResponseDto
       │
       ├─ Solicitudes autenticadas (con JWT)
       │     ├─> Headers: Authorization: Bearer <accessToken>
       │     └─> JwtAuthGuard valida y extrae userId
       │
       └─ POST /auth/refresh (RefreshTokenDto)
             ├─> JwtRefreshAuthGuard valida refreshToken
             ├─> Genera nuevo accessToken
             └─> Genera nuevo refreshToken
```

---

## 🔄 Flujo de Publicación

```
┌──────────────────┐
│  Usuario logueado│
└────────┬─────────┘
         │
         ├─ POST /posts (CreatePostDto)
         │     ├─> JwtAuthGuard: obtiene userId
         │     ├─> ValidationPipe: valida contenido
         │     │   ├─ 1-3000 caracteres
         │     │   └─ Máximo 10 imágenes
         │     ├─ PostsService.create()
         │     │   ├─ Crea registro en BD
         │     │   └─ Notifica a followers
         │     └─ Retorna PostDto
         │
         ├─ POST /posts/:id/comments (CreateCommentDto)
         │     ├─ JwtAuthGuard: obtiene userId
         │     ├─ ValidationPipe: valida contenido (1-1000 caracteres)
         │     ├─ CommentService.create()
         │     │   ├─ Crea comentario
         │     │   └─ Notifica al autor del post
         │     └─ Retorna CommentDto
         │
         ├─ POST /posts/:id/likes
         │     ├─ JwtAuthGuard: obtiene userId
         │     ├─ Verifica duplicado (Like)
         │     ├─ Crea Like record
         │     └─ Notifica al autor
         │
         └─ DELETE /posts/:id
               ├─ JwtAuthGuard: obtiene userId
               ├─ Verifica permisos (autor o admin)
               ├─ PostsService.delete()
               │   └─ Cascade delete de comentarios y likes
               └─ Retorna 204 No Content
```

---

## 📈 Escalabilidad Futura

### Mejoras Planeadas

1. **Caché con Redis**
   - Posts populares
   - Perfiles de usuarios
   - Feed personalizado

2. **WebSockets (Socket.io)**
   - Mensajería en tiempo real
   - Notificaciones en vivo
   - Presencia de usuarios

3. **Búsqueda Full-text**
   - Elasticsearch
   - Búsqueda avanzada de posts y usuarios

4. **Procesamiento de Imágenes**
   - Sharp para redimensionamiento
   - AWS S3 para almacenamiento
   - CDN para distribución

5. **Microservicios**
   - Separar servicios por dominio
   - Message queue (RabbitMQ)
   - API Gateway

---

## 🧪 Testing

### Estructura

```bash
# Tests unitarios
npm run test

# Tests con cobertura
npm run test:cov

# Tests e2e
npm run test:e2e

# Watch mode
npm run test:watch
```

### Jest Configuration

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": "src",
  "testRegex": ".*\\.spec\\.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "collectCoverageFrom": [
    "**/*.(t|j)s"
  ],
  "coverageDirectory": "../coverage"
}
```

---

## 📚 Recursos Útiles

### Documentación Oficial
- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs)

### Comandos Útiles

```bash
# Backend
npm install                    # Instalar dependencias
npm run start:dev             # Iniciar en modo desarrollo
npm run build                 # Compilar producción
npm run start:prod            # Iniciar en producción
npm run prisma:generate       # Generar Prisma Client
npm run prisma:migrate        # Ejecutar migraciones
npm run prisma:studio         # Abrir Prisma Studio (GUI)

# Testing
npm test                      # Ejecutar tests
npm run test:cov             # Tests con cobertura
npm run test:e2e             # Tests end-to-end

# Documentación
# Acceder a http://localhost:3001/api/docs (Swagger)
```

---

## 🤝 Flujo de Desarrollo

### Setup Inicial

```bash
# 1. Clonar proyecto
git clone <repo>
cd proyectoTiendaOmnilife

# 2. Instalar dependencias
cd backend
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# 4. Levantar infraestructura
docker-compose up -d

# 5. Generar Prisma Client
npm run prisma:generate

# 6. Ejecutar migraciones
npm run prisma:migrate

# 7. Iniciar servidor
npm run start:dev

# 8. Acceder a documentación
# http://localhost:3001/api/docs
```

### Workflow de Feature

1. **Crear rama**: `git checkout -b feature/nombre-feature`
2. **Implementar feature**: Siguiendo la estructura de módulos
3. **Tests**: Crear tests unitarios e integrales
4. **Documentación**: Actualizar DTOs y comentarios
5. **Pull Request**: Revisar y mergear

---

## 📞 Notas Importantes

- **Variables de Entorno**: No commitear `.env` (usar `.env.example`)
- **Migraciones**: Ejecutar siempre después de cambios en schema.prisma
- **Documentación**: Mantener Swagger actualizado
- **Seguridad**: Nunca exponer JWT_SECRET
- **Base de Datos**: PostgreSQL usa puerto 5432 en Docker
- **API**: Disponible en `http://localhost:3001`
- **Swagger**: `http://localhost:3001/api/docs`

---

**Última actualización**: Diciembre 2024
**Versión**: 1.0.0
