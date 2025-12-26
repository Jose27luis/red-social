# Red Académica UNAMAD

[![CI/CD Pipeline](https://github.com/USUARIO/REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/USUARIO/REPO/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/USUARIO/REPO/branch/main/graph/badge.svg)](https://codecov.io/gh/USUARIO/REPO)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker Image](https://img.shields.io/docker/v/USUARIO/red-academica-backend?label=docker&logo=docker)](https://hub.docker.com/r/USUARIO/red-academica-backend)

> Red Social Académica Interna para la Universidad Nacional Amazónica de Madre de Dios (UNAMAD)

## 📋 Descripción

Plataforma de red social académica diseñada específicamente para estudiantes, profesores y alumni de la UNAMAD. Facilita la colaboración, el intercambio de conocimientos y la comunicación dentro de la comunidad universitaria.

## ✨ Características Principales

- **Autenticación Segura**: Sistema de autenticación con JWT y validación de correos institucionales
- **Publicaciones y Discusiones**: Comparte ideas, preguntas y recursos académicos
- **Grupos de Estudio**: Crea y únete a grupos temáticos o de carreras
- **Mensajería Directa**: Comunícate privadamente con otros miembros
- **Eventos Académicos**: Organiza y participa en eventos universitarios
- **Compartición de Recursos**: Sube y comparte material académico
- **Sistema de Notificaciones**: Mantente al día con las actividades relevantes
- **Feed Personalizado**: Contenido adaptado a tus intereses y conexiones

## 🏗️ Arquitectura del Proyecto

```
proyectoTiendaOmnilife/
├── backend/              # API REST con NestJS
│   ├── src/
│   ├── prisma/
│   ├── Dockerfile
│   └── docker-compose.yml
├── .github/
│   └── workflows/
│       └── ci.yml       # Pipeline CI/CD
└── README.md
```

## 🚀 Stack Tecnológico

### Backend
- **Framework**: NestJS 10 + TypeScript
- **Base de Datos**: PostgreSQL 16
- **ORM**: Prisma
- **Autenticación**: JWT + Refresh Tokens
- **Validación**: class-validator + class-transformer
- **Documentación**: Swagger/OpenAPI
- **Containerización**: Docker + Docker Compose

## 📦 Instalación y Configuración

### Prerrequisitos

- Node.js 18 o superior
- Docker y Docker Compose
- Git

### Instalación Rápida

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/jose27luis/red-social.git
   cd red-social
   ```

2. **Configurar el Backend**
   ```bash
   cd backend
   cp .env.example .env
   # Edita .env con tus configuraciones
   ```

3. **Iniciar con Docker**
   ```bash
   docker-compose up -d
   ```

4. **Instalar dependencias y ejecutar migraciones**
   ```bash
   npm install
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. **Iniciar el servidor de desarrollo**
   ```bash
   npm run start:dev
   ```

El servidor estará disponible en `http://localhost:3001`

La documentación de la API en `http://localhost:3001/api/docs`

## 📚 Documentación

- [Documentación del Backend](./backend/README.md)
- [Arquitectura del Sistema](./arquitectura.md)
- [Documentación del Proyecto](./proyecto.md)

## 🔧 Scripts Disponibles

### Backend

```bash
# Desarrollo
npm run start:dev        # Iniciar en modo desarrollo
npm run start:debug      # Iniciar con debugger

# Testing
npm run test            # Ejecutar tests
npm run test:watch      # Tests en modo watch
npm run test:cov        # Tests con coverage
npm run test:e2e        # Tests end-to-end

# Build
npm run build           # Compilar proyecto
npm run start:prod      # Ejecutar en producción

# Linting y formato
npm run lint            # Ejecutar ESLint
npm run format          # Formatear código con Prettier

# Prisma
npm run prisma:generate # Generar Prisma Client
npm run prisma:migrate  # Ejecutar migraciones
npm run prisma:studio   # Abrir Prisma Studio
```

## 🔄 CI/CD Pipeline

El proyecto cuenta con un pipeline automatizado de CI/CD usando GitHub Actions:

### Jobs Configurados

- **Lint & Format Check**: Verifica el código con ESLint y Prettier
- **Tests**: Ejecuta tests unitarios con coverage en múltiples versiones de Node
- **Build**: Compila la aplicación
- **Docker Build**: Construye y publica imágenes Docker
- **Security Scan**: Escaneo de vulnerabilidades con Trivy

### Versiones de Node Soportadas

- Node.js 18.x
- Node.js 20.x

## 🐳 Docker

### Construir imagen localmente

```bash
cd backend
docker build -t red-academica-backend .
```

### Ejecutar con Docker Compose

```bash
docker-compose up -d
```

### Servicios disponibles

- **PostgreSQL**: Puerto 5432
- **Backend API**: Puerto 3001

## 🔐 Seguridad

- Autenticación JWT con tokens de acceso (15 min) y refresh tokens (7 días)
- Validación de correos institucionales (@unamad.edu.pe)
- Rate limiting (100 peticiones/min por IP)
- Hash de contraseñas con bcrypt (12 rounds)
- CORS restrictivo
- Validación y sanitización de entradas
- TypeScript estricto

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests con coverage
npm run test:cov

# Tests e2e
npm run test:e2e
```

## 📊 Monitoreo y Métricas

- **Code Coverage**: Integrado con Codecov
- **Security Scanning**: Trivy para análisis de vulnerabilidades
- **CI/CD Status**: GitHub Actions

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Convenciones de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bugs
- `docs:` Cambios en documentación
- `style:` Cambios de formato (no afectan el código)
- `refactor:` Refactorización de código
- `test:` Agregar o modificar tests
- `chore:` Tareas de mantenimiento

## 📝 Configuración de Secretos para CI/CD

Para que el pipeline de CI/CD funcione correctamente, configura los siguientes secretos en GitHub:

1. Ve a **Settings** → **Secrets and variables** → **Actions**
2. Agrega los siguientes secretos:

| Secret | Descripción | Requerido |
|--------|-------------|-----------|
| `DOCKER_USERNAME` | Usuario de Docker Hub | Sí (para Docker build) |
| `DOCKER_PASSWORD` | Contraseña o token de Docker Hub | Sí (para Docker build) |
| `CODECOV_TOKEN` | Token de Codecov | Opcional (para reportes de coverage) |

## 📈 Roadmap

- [x] Backend API con NestJS
- [x] Autenticación y autorización
- [x] Sistema de publicaciones
- [x] CI/CD con GitHub Actions
- [ ] Sistema de grupos completo
- [ ] Mensajería en tiempo real (WebSockets)
- [ ] Implementación de eventos
- [ ] Sistema de recursos compartidos
- [ ] Notificaciones push
- [ ] Frontend web
- [ ] Aplicación móvil

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Equipo de Desarrollo

Proyecto desarrollado para la Universidad Nacional Amazónica de Madre de Dios (UNAMAD).

## 📞 Contacto

Para preguntas o sugerencias sobre el proyecto, contactar al equipo de desarrollo. Teco

---

