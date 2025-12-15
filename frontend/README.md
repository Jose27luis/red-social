# Red Académica UNAMAD - Frontend

Frontend de la red social universitaria construido con Next.js 14, TypeScript y TailwindCSS.

## 🚀 Requisitos Previos

- Node.js 18+
- npm o yarn
- Docker Desktop (para la base de datos del backend)
- Backend corriendo en `http://localhost:3001`

## 📦 Instalación

```bash
# Instalar dependencias
npm install
```

## ⚙️ Configuración

Las variables de entorno ya están configuradas en `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Red Académica UNAMAD
NEXT_PUBLIC_UNIVERSIDAD_DOMAIN=@unamad.edu.pe
```

## 🏃‍♂️ Ejecutar el Proyecto

### Paso 1: Iniciar Docker Desktop

Asegúrate de que Docker Desktop esté corriendo.

### Paso 2: Iniciar la Base de Datos y Backend

```bash
# Desde el directorio backend
cd ../backend
docker-compose up -d
npm run start:dev
```

El backend estará disponible en `http://localhost:3001`

### Paso 3: Iniciar el Frontend

```bash
# Desde el directorio frontend
npm run dev
```

El frontend estará disponible en `http://localhost:3002`

## 🔑 Autenticación

### Crear una cuenta

1. Ve a `http://localhost:3002` (redirige a `/login`)
2. Haz clic en "Regístrate aquí"
3. Completa el formulario:
   - Email debe terminar en `@unamad.edu.pe`
   - Contraseña: mínimo 8 caracteres, con mayúsculas, minúsculas, números y símbolos
   - Selecciona tu rol: Estudiante, Profesor o Egresado
4. Haz clic en "Crear Cuenta"

### Iniciar Sesión

1. Ingresa tu email y contraseña
2. Serás redirigido al feed (una vez implementado)

## 🎨 Temas

- **Modo claro/oscuro**: Toggle disponible en el navbar (por implementar)
- Preferencia guardada en localStorage
- Transiciones suaves

## 📁 Estructura del Proyecto

```
frontend/
├── app/                    # App Router de Next.js
│   ├── (auth)/            # Rutas de autenticación
│   │   ├── login/         # ✅ Página de login
│   │   └── register/      # ✅ Página de registro
│   ├── (main)/            # Rutas principales (por implementar)
│   ├── layout.tsx         # ✅ Layout raíz
│   ├── providers.tsx      # ✅ React Query Provider
│   └── globals.css        # ✅ Estilos globales
├── components/ui/         # ✅ Componentes shadcn/ui
├── hooks/
│   └── useAuth.ts         # ✅ Hook de autenticación
├── lib/
│   ├── api/
│   │   ├── axios.ts       # ✅ Axios + JWT interceptors
│   │   └── endpoints.ts   # ✅ Todos los endpoints
│   ├── utils.ts           # ✅ Utilidades
│   └── constants.ts       # ✅ Constantes
├── store/
│   ├── useAuthStore.ts    # ✅ Store de autenticación
│   └── useThemeStore.ts   # ✅ Store del tema
├── types/                 # ✅ Tipos TypeScript completos
└── middleware.ts          # ✅ Middleware de Next.js
```

## 🛠️ Tecnologías

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: TailwindCSS v4
- **Componentes UI**: shadcn/ui
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **HTTP Client**: Axios con interceptors
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

## ✅ Estado de Implementación

### Completado
- ✅ Configuración base de Next.js 14
- ✅ Sistema de autenticación (login/register)
- ✅ Integración con backend
- ✅ Manejo de JWT tokens con refresh automático
- ✅ Validación de formularios
- ✅ Tipos TypeScript completos
- ✅ Sistema de temas (light/dark)

### Pendiente
- ⏳ Layout principal con Navbar y Sidebars
- ⏳ Feed de publicaciones
- ⏳ Sistema de perfiles
- ⏳ Módulo de Eventos
- ⏳ Módulo de Grupos
- ⏳ Módulo de Mensajería
- ⏳ Módulo de Recursos

## 🐛 Solución de Problemas

### El frontend no se conecta al backend

1. Verifica que Docker Desktop esté corriendo
2. Verifica que el backend esté en `http://localhost:3001`:
   ```bash
   curl http://localhost:3001/api/docs
   ```
3. Revisa la consola del navegador (F12)

### Error "Puerto 3000 ocupado"

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Tokens expirados constantemente

Verifica que la hora del sistema esté correcta

## 📝 Scripts Disponibles

```bash
npm run dev      # Desarrollo
npm run build    # Build de producción
npm run start    # Producción
npm run lint     # Linting
```

## 📄 Licencia

Proyecto académico - UNAMAD 2024
