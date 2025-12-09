# Red Social Académica Interna - Especificaciones del Proyecto

## 1. OBJETIVO DEL PROYECTO
Desarrollar una red social exclusiva para la comunidad universitaria que facilite la colaboración académica, el intercambio de conocimientos y el networking entre estudiantes.

---

## 2. STACK TECNOLÓGICO

### Backend
- **Framework**: NestJS 10
- **Base de datos**: PostgreSQL 
- **ORM**: Prisma o TypeORM
- **Autenticación**: JWT + Refresh Tokens
- **Validación**: class-validator + class-transformer
- **Documentación API**: Swagger/OpenAPI

### Frontend
- **Framework**: Next.js  (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Componentes UI**: shadcn/ui o Radix UI
- **Estado Global**: Zustand o React Context
- **Formularios**: React Hook Form + Zod
- **Peticiones HTTP**: Axios o Fetch API

### Infraestructura y DevOps
- **Control de versiones**: Git + GitHub
- **Variables de entorno**: .env (nunca commitear)
- **Contenedores**: Docker + Docker Compose
- **Testing**: Jest + Testing Library

---

## 3. RESTRICCIONES Y LIMITACIONES

### 3.1 Restricciones de Seguridad

#### Autenticación y Autorización
- **OBLIGATORIO**: Implementar autenticación JWT con tokens de acceso (15 min) y refresh tokens (7 días)
- **OBLIGATORIO**: Validar correos electrónicos institucionales (@unamad.edu.pe)
- **OBLIGATORIO**: Implementar rate limiting (máx 100 peticiones/min por IP)
- **OBLIGATORIO**: Hash de contraseñas con bcrypt (mínimo 12 rounds)
- **RESTRICCIÓN**: No almacenar contraseñas en texto plano
- **RESTRICCIÓN**: No exponer información sensible en logs
- **OBLIGATORIO**: Implementar CORS restrictivo (solo dominios autorizados)
- **OBLIGATORIO**: Sanitizar todas las entradas de usuario para prevenir XSS e inyección SQL

#### Validación de Datos
- **OBLIGATORIO**: Validar todos los inputs en backend (nunca confiar en frontend)
- **OBLIGATORIO**: Limitar tamaño de archivos subidos (máx 10MB para imágenes, 50MB para documentos)
- **OBLIGATORIO**: Validar tipos MIME de archivos
- **RESTRICCIÓN**: No permitir ejecución de scripts en archivos subidos
- **OBLIGATORIO**: Escapar contenido HTML en publicaciones

#### Privacidad de Datos
- **OBLIGATORIO**: Implementar niveles de privacidad en perfiles (público, solo universidad, privado)
- **OBLIGATORIO**: Permitir a usuarios eliminar su cuenta y datos (GDPR compliance)
- **RESTRICCIÓN**: No compartir datos personales con terceros sin consentimiento
- **OBLIGATORIO**: Encriptar datos sensibles en base de datos
- **OBLIGATORIO**: Implementar logs de auditoría para acciones críticas

### 3.2 Restricciones Funcionales

#### Usuarios y Perfiles
- **OBLIGATORIO**: Solo usuarios con correo institucional pueden registrarse
- **OBLIGATORIO**: Verificación de correo electrónico antes de activar cuenta
- **RESTRICCIÓN**: Un correo = una cuenta única
- **OBLIGATORIO**: Roles definidos: Estudiante, Profesor, Administrativo, Alumni
- **OBLIGATORIO**: Perfil debe incluir: nombre, carrera/departamento, foto, bio, intereses académicos
- **RESTRICCIÓN**: Límite de 500 caracteres en biografía
- **RESTRICCIÓN**: Máximo 10 intereses académicos por perfil

#### Publicaciones y Contenido
- **OBLIGATORIO**: Moderación de contenido (reportes y revisión manual/automática)
- **RESTRICCIÓN**: Máximo 3000 caracteres por publicación
- **RESTRICCIÓN**: Máximo 10 imágenes por publicación
- **OBLIGATORIO**: Implementar filtros anti-spam y palabras prohibidas
- **OBLIGATORIO**: Etiquetar tipo de contenido: pregunta, discusión, recurso, evento, anuncio
- **RESTRICCIÓN**: Solo permitir editar publicaciones dentro de 24 horas
- **OBLIGATORIO**: Mostrar indicador "editado" en publicaciones modificadas

#### Grupos de Estudio
- **RESTRICCIÓN**: Máximo 100 miembros por grupo
- **OBLIGATORIO**: Grupos pueden ser: públicos, privados o por invitación
- **OBLIGATORIO**: Roles en grupo: administrador, moderador, miembro
- **RESTRICCIÓN**: Solo administradores pueden eliminar grupos
- **OBLIGATORIO**: Sistema de aprobación para grupos privados

#### Sistema de Mensajería
- **RESTRICCIÓN**: Solo mensajes entre usuarios verificados
- **OBLIGATORIO**: Detectar y bloquear spam/phishing
- **RESTRICCIÓN**: Máximo 1000 caracteres por mensaje
- **OBLIGATORIO**: Encriptación end-to-end opcional
- **RESTRICCIÓN**: Límite de 50 mensajes por minuto por usuario

#### Eventos Universitarios
- **OBLIGATORIO**: Validar fechas (no eventos en el pasado)
- **RESTRICCIÓN**: Máximo 500 asistentes confirmados por evento
- **OBLIGATORIO**: Confirmación de asistencia con código QR
- **OBLIGATORIO**: Recordatorios automáticos 24h antes del evento

#### Compartición de Recursos
- **RESTRICCIÓN**: Tipos permitidos: PDF, DOCX, PPTX, ZIP, imágenes
- **RESTRICCIÓN**: Bloquear ejecutables (.exe, .bat, .sh, .app)
- **OBLIGATORIO**: Escaneo de virus en archivos subidos
- **OBLIGATORIO**: Atribución y respeto de derechos de autor
- **RESTRICCIÓN**: Máximo 3 recursos compartidos por día por usuario nuevo

### 3.3 Restricciones de Performance

#### Base de Datos
- **OBLIGATORIO**: Indexar campos frecuentemente consultados (email, username, fechas)
- **OBLIGATORIO**: Implementar paginación (máx 20 items por página)
- **OBLIGATORIO**: Usar consultas optimizadas (evitar N+1)
- **OBLIGATORIO**: Implementar caché para queries pesadas (Redis recomendado)
- **RESTRICCIÓN**: Tiempo máximo de respuesta API: 2 segundos

#### Frontend
- **OBLIGATORIO**: Lazy loading de imágenes
- **OBLIGATORIO**: Code splitting por rutas
- **OBLIGATORIO**: Optimización de imágenes (WebP, tamaños responsivos)
- **RESTRICCIÓN**: Bundle inicial máximo 500KB
- **OBLIGATORIO**: Implementar skeleton loaders

#### Escalabilidad
- **OBLIGATORIO**: Diseño stateless del backend (para horizontal scaling)
- **OBLIGATORIO**: Almacenar archivos en servicio externo (AWS S3, Cloudinary)
- **RESTRICCIÓN**: No almacenar archivos en servidor local
- **OBLIGATORIO**: Implementar CDN para assets estáticos

### 3.4 Restricciones de UX/UI

#### Diseño
- **OBLIGATORIO**: Diseño responsive (mobile-first)
- **OBLIGATORIO**: Modo oscuro/claro
- **OBLIGATORIO**: Accesibilidad WCAG 2.1 nivel AA
- **RESTRICCIÓN**: Máximo 3 clicks para cualquier funcionalidad principal
- **OBLIGATORIO**: Feedback visual para todas las acciones (loading, success, error)

#### Navegación
- **OBLIGATORIO**: Breadcrumbs en páginas profundas
- **OBLIGATORIO**: Búsqueda con autocompletado
- **OBLIGATORIO**: Filtros en feed (por tipo, fecha, relevancia)
- **RESTRICCIÓN**: Menú principal máximo 7 items

### 3.5 Restricciones de Desarrollo

#### Código
- **OBLIGATORIO**: TypeScript estricto (no usar `any`)
- **OBLIGATORIO**: ESLint + Prettier configurados
- **OBLIGATORIO**: Nomenclatura consistente (camelCase para variables, PascalCase para componentes)
- **OBLIGATORIO**: Comentarios en funciones complejas
- **OBLIGATORIO**: Separación de responsabilidades (controllers, services, repositories)
- **RESTRICCIÓN**: Funciones máximo 50 líneas
- **RESTRICCIÓN**: Archivos máximo 300 líneas

#### Git y Versionado
- **OBLIGATORIO**: Commits descriptivos en inglés
- **OBLIGATORIO**: Branches por feature (feature/nombre-funcionalidad)
- **OBLIGATORIO**: Pull requests con revisión de código
- **RESTRICCIÓN**: No hacer commit directo a main/master
- **OBLIGATORIO**: .gitignore configurado (node_modules, .env, dist)

#### Testing
- **OBLIGATORIO**: Tests unitarios para servicios críticos (min 70% coverage)
- **OBLIGATORIO**: Tests de integración para endpoints principales
- **RECOMENDADO**: Tests E2E para flujos críticos
- **OBLIGATORIO**: CI/CD con tests automáticos

#### Documentación
- **OBLIGATORIO**: README.md con instrucciones de instalación
- **OBLIGATORIO**: Documentar variables de entorno requeridas
- **OBLIGATORIO**: API docs con Swagger
- **OBLIGATORIO**: Comentarios JSDoc en funciones públicas
- **OBLIGATORIO**: Diagrama ERD de base de datos

---

## 4. ARQUITECTURA DEL PROYECTO

### 4.1 Estructura Backend (NestJS)

```
backend/
├── src/
│   ├── auth/                 # Módulo de autenticación
│   ├── users/                # Gestión de usuarios
│   ├── posts/                # Publicaciones
│   ├── groups/               # Grupos de estudio
│   ├── messages/             # Sistema de mensajería
│   ├── events/               # Eventos universitarios
│   ├── resources/            # Recursos compartidos
│   ├── notifications/        # Sistema de notificaciones
│   ├── feed/                 # Algoritmo de feed
│   ├── common/               # Utilidades compartidas
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── filters/
│   │   └── decorators/
│   ├── config/               # Configuración
│   └── database/             # Schemas y migraciones
├── test/
├── .env.example
├── docker-compose.yml
└── package.json
```

### 4.2 Estructura Frontend (Next.js)

```
frontend/
├── src/
│   ├── app/                  # App Router
│   │   ├── (auth)/          # Rutas de autenticación
│   │   ├── (dashboard)/     # Rutas principales
│   │   ├── profile/
│   │   ├── groups/
│   │   ├── messages/
│   │   ├── events/
│   │   └── resources/
│   ├── components/           # Componentes reutilizables
│   │   ├── ui/              # Componentes UI base
│   │   ├── posts/
│   │   ├── groups/
│   │   └── layout/
│   ├── lib/                  # Utilidades
│   │   ├── api/             # Cliente API
│   │   ├── hooks/           # Custom hooks
│   │   ├── utils/
│   │   └── validation/
│   ├── stores/               # Estado global
│   ├── types/                # Tipos TypeScript
│   └── styles/               # Estilos globales
├── public/
├── .env.local.example
└── package.json
```

---

## 5. MODELO DE DATOS PRINCIPAL

### Entidades Principales

#### User
- id (UUID)
- email (unique, institucional)
- password (hashed)
- firstName
- lastName
- role (enum: STUDENT, PROFESSOR, ADMIN, ALUMNI)
- department/career
- profilePicture (URL)
- bio (max 500 chars)
- interests (array)
- isVerified (boolean)
- isActive (boolean)
- createdAt
- updatedAt

#### Post
- id (UUID)
- authorId (FK User)
- content (max 3000 chars)
- type (enum: QUESTION, DISCUSSION, RESOURCE, EVENT, ANNOUNCEMENT)
- images (array URLs)
- likesCount
- commentsCount
- isEdited (boolean)
- createdAt
- updatedAt

#### Group
- id (UUID)
- name
- description
- type (enum: PUBLIC, PRIVATE, INVITE_ONLY)
- creatorId (FK User)
- membersCount
- coverImage (URL)
- createdAt
- updatedAt

#### Event
- id (UUID)
- title
- description
- organizerId (FK User)
- startDate
- endDate
- location
- maxAttendees
- isOnline (boolean)
- qrCode (string)
- createdAt
- updatedAt

#### Message
- id (UUID)
- senderId (FK User)
- receiverId (FK User)
- content (max 1000 chars)
- isRead (boolean)
- createdAt

#### Resource
- id (UUID)
- uploaderId (FK User)
- title
- description
- fileUrl
- fileType
- fileSize
- downloadCount
- createdAt

---

## 6. FUNCIONALIDADES PRINCIPALES (MVP)

### Fase 1 - Core (Prioridad Alta)
1. ✅ Registro y autenticación con email institucional
2. ✅ Creación y edición de perfil
3. ✅ Publicación de posts (texto e imágenes)
4. ✅ Feed principal con paginación
5. ✅ Sistema de likes y comentarios
6. ✅ Búsqueda de usuarios

### Fase 2 - Social (Prioridad Media)
7. ✅ Creación y gestión de grupos
8. ✅ Sistema de mensajería 1 a 1
9. ✅ Sistema de notificaciones básico
10. ✅ Seguir/dejar de seguir usuarios
11. ✅ Compartición de recursos

### Fase 3 - Avanzado (Prioridad Baja)
12. ✅ Eventos universitarios
13. ✅ Algoritmo de feed personalizado
14. ✅ Mensajería grupal
15. ✅ Sistema de reportes y moderación
16. ✅ Estadísticas y analytics

---

## 7. VARIABLES DE ENTORNO REQUERIDAS

### Backend (.env)
```
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/redacademica

# JWT
JWT_SECRET=tu-secreto-super-seguro-cambiar-en-produccion
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=otro-secreto-super-seguro
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development

# Email (para verificación)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@unamad.edu.pe
EMAIL_PASSWORD=tu-password-app

# File Upload
MAX_FILE_SIZE=52428800
ALLOWED_FILE_TYPES=pdf,docx,pptx,jpg,jpeg,png

# Security
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100

# Domain
UNIVERSIDAD_EMAIL_DOMAIN=@universidad.edu
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Red Académica
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
```

---

## 8. CONSIDERACIONES DE SEGURIDAD CRÍTICAS

### ⚠️ NUNCA HACER:
1. ❌ Commitear archivos .env al repositorio
2. ❌ Exponer secrets/tokens en el frontend
3. ❌ Permitir SQL injection (usar ORM siempre)
4. ❌ Almacenar passwords sin hash
5. ❌ Confiar en validaciones solo del frontend
6. ❌ Permitir acceso sin autenticación a rutas protegidas
7. ❌ Exponer stack traces en producción
8. ❌ Usar console.log con datos sensibles
9. ❌ Permitir CORS abierto (*)
10. ❌ Ejecutar código de usuarios sin sanitizar

### ✅ SIEMPRE HACER:
1. ✅ Validar y sanitizar TODAS las entradas
2. ✅ Implementar rate limiting
3. ✅ Usar HTTPS en producción
4. ✅ Mantener dependencias actualizadas
5. ✅ Hacer backups regulares de BD
6. ✅ Implementar logging de errores
7. ✅ Usar variables de entorno para secrets
8. ✅ Implementar CSP headers
9. ✅ Revisar código antes de mergear
10. ✅ Hacer tests de seguridad

---

## 9. COMANDOS ÚTILES

### Setup Inicial
```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev

# Frontend
cd frontend
npm install
npm run dev
```

### Docker
```bash
# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

### Testing
```bash
# Backend
npm run test
npm run test:cov

# Frontend
npm run test
npm run test:watch
```

---

## 10. RECURSOS Y REFERENCIAS

### Documentación Oficial
- [NestJS](https://docs.nestjs.com/)
- [Next.js](https://nextjs.org/docs)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [Prisma](https://www.prisma.io/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)

### Seguridad
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)

---

## 11. CHECKLIST DE IMPLEMENTACIÓN

### Pre-desarrollo
- [ ] Leer y entender todas las especificaciones
- [ ] Configurar entorno de desarrollo
- [ ] Crear repositorio Git
- [ ] Configurar Docker y Docker Compose
- [ ] Instalar dependencias necesarias

### Durante el desarrollo
- [ ] Seguir arquitectura definida
- [ ] Implementar validaciones en cada endpoint
- [ ] Escribir tests para funcionalidades críticas
- [ ] Documentar código complejo
- [ ] Hacer commits frecuentes y descriptivos
- [ ] Revisar restricciones de seguridad

### Pre-producción
- [ ] Ejecutar todos los tests
- [ ] Verificar que no hay secrets en el código
- [ ] Optimizar performance
- [ ] Configurar variables de entorno de producción
- [ ] Hacer audit de seguridad
- [ ] Preparar documentación de deployment

---

## 12. CONTACTO Y SOPORTE

Para dudas sobre las especificaciones o restricciones del proyecto, consultar con el equipo de desarrollo o el instructor del curso.

**Última actualización**: Noviembre 2025
**Versión del documento**: 1.0