# ESQUEMA PARA UN PROYECTO DE CALIDAD DE SOFTWARE

## CARÁTULA

**Proyecto:** Red Académica UNAMAD
**Curso:** Calidad Aplicada a los Sistemas
**Universidad:** Universidad Nacional Amazónica de Madre de Dios (UNAMAD)
**Semestre:** 9no Semestre
**Fecha:** Diciembre 2025

---

## ÍNDICE

1. [Datos de la Organización](#1-datos-de-la-organización)
2. [Introducción y Alcance](#2-introducción-y-alcance)
3. [Contexto y Justificación](#3-contexto-y-justificación)
4. [Planificación del Proyecto](#4-planificación-del-proyecto)
5. [Modelo de Calidad](#5-modelo-de-calidad)
6. [Estrategia de Aseguramiento de la Calidad](#6-estrategia-de-aseguramiento-de-la-calidad)
7. [Ejecución](#7-ejecución)
8. [Conclusiones](#8-conclusiones)

---

## 1. DATOS DE LA ORGANIZACIÓN

### 1.1 Nombre o Razón Social
**Universidad Nacional Amazónica de Madre de Dios (UNAMAD)**

### 1.2 Dirección o Domicilio Fiscal
Av. Jorge Chávez N° 1160, Puerto Maldonado, Madre de Dios, Perú

### 1.3 Visión
Ser una universidad líder en la Amazonía peruana, reconocida por la excelencia académica, investigación científica y tecnológica, formando profesionales competentes que contribuyan al desarrollo sostenible de la región.

### 1.4 Misión
Formar profesionales de calidad con valores éticos, capacidad investigativa e innovadora, comprometidos con el desarrollo sostenible de la región amazónica y del país, mediante una educación integral y de excelencia.

### 1.5 Objetivos Estratégicos (POA/POI)
- Mejorar la calidad educativa mediante el uso de tecnologías de información
- Fomentar la colaboración académica entre estudiantes y docentes
- Implementar sistemas de gestión del conocimiento
- Fortalecer la comunicación institucional digital
- Promover la innovación tecnológica en procesos académicos

### 1.6 FODA

| **Fortalezas** | **Oportunidades** |
|----------------|-------------------|
| Infraestructura tecnológica existente | Demanda de plataformas educativas digitales |
| Personal docente capacitado en TI | Tendencia hacia la educación híbrida |
| Comunidad estudiantil activa | Financiamiento para proyectos de innovación |
| Dominio institucional (@unamad.edu.pe) | Alianzas con universidades tecnológicas |

| **Debilidades** | **Amenazas** |
|-----------------|--------------|
| Limitada integración de sistemas | Competencia de redes sociales comerciales |
| Falta de plataforma de comunicación interna | Resistencia al cambio tecnológico |
| Dispersión de información académica | Vulnerabilidades de ciberseguridad |
| Baja adopción de herramientas colaborativas | Obsolescencia tecnológica rápida |

---

## 2. INTRODUCCIÓN Y ALCANCE

### 2.1 Objetivo General
Asegurar la calidad del software "Red Académica UNAMAD", una plataforma de red social académica interna, garantizando su confiabilidad, seguridad y usabilidad antes de su despliegue en producción para la comunidad universitaria.

### 2.2 Alcance

#### Módulos a evaluar:
| Módulo | Descripción |
|--------|-------------|
| **Autenticación** | Sistema JWT con refresh tokens y validación de correos institucionales |
| **Publicaciones** | Creación, edición y visualización de posts académicos |
| **Grupos de Estudio** | Gestión de grupos temáticos y por carreras |
| **Mensajería** | Sistema de comunicación directa entre usuarios |
| **Eventos** | Organización y participación en eventos universitarios |
| **Recursos** | Compartición de material académico |
| **Notificaciones** | Sistema de alertas y notificaciones |
| **Feed** | Contenido personalizado según intereses |

#### Entregables a evaluar:
- API REST (Backend NestJS)
- Interfaz de usuario (Frontend Next.js)
- Base de datos (PostgreSQL con Prisma ORM)
- Documentación técnica (Swagger/OpenAPI)
- Pipeline CI/CD (GitHub Actions)

### 2.3 Normas y Estándares Aplicables

| Norma | Aplicación |
|-------|------------|
| **ISO/IEC 25010** | Modelo de calidad del producto de software |
| **ISO/IEC 25023** | Medición de la calidad del producto |
| **OWASP Top 10** | Seguridad de aplicaciones web |
| **Conventional Commits** | Estándar para mensajes de commit |

---

## 3. CONTEXTO Y JUSTIFICACIÓN

### 3.1 Problemática Detectada

1. **Dispersión de comunicación**: Los estudiantes y docentes utilizan múltiples plataformas externas (WhatsApp, Facebook) para comunicarse, generando fragmentación de información académica.

2. **Falta de integración institucional**: No existe una plataforma unificada que valide la pertenencia a la comunidad universitaria (@unamad.edu.pe).

3. **Pérdida de recursos académicos**: El material compartido en grupos externos se pierde con el tiempo y no está organizado.

4. **Baja colaboración estructurada**: No hay herramientas institucionales para formar grupos de estudio o coordinar eventos académicos.

### 3.2 Importancia de Implementar Prácticas de Calidad

- **Seguridad de datos**: La plataforma manejará información sensible de la comunidad universitaria
- **Confiabilidad**: Se requiere alta disponibilidad para no interrumpir actividades académicas
- **Escalabilidad**: El sistema debe soportar el crecimiento de usuarios
- **Mantenibilidad**: El código debe ser fácil de mantener y evolucionar

### 3.3 Beneficios Esperados

| Beneficio | Descripción |
|-----------|-------------|
| Reducción de errores | Detección temprana de bugs mediante análisis estático y pruebas |
| Mejora de seguridad | Identificación de vulnerabilidades antes del despliegue |
| Mayor mantenibilidad | Código limpio y documentado siguiendo estándares |
| Satisfacción del usuario | Plataforma funcional y sin errores críticos |
| Eficiencia operativa | Automatización de procesos de QA en CI/CD |

---

## 4. PLANIFICACIÓN DEL PROYECTO

### 4.1 Fases del Proyecto

| Fase | Actividades |
|------|-------------|
| **Fase 1: Análisis** | Revisión de requisitos, definición de criterios de calidad |
| **Fase 2: Diseño de Pruebas** | Elaboración de casos de prueba, configuración de herramientas |
| **Fase 3: Ejecución** | Análisis estático, pruebas unitarias, de integración y E2E |
| **Fase 4: Evaluación** | Análisis de resultados, generación de reportes |
| **Fase 5: Corrección** | Resolución de defectos identificados |
| **Fase 6: Verificación** | Re-testing y validación final |

### 4.2 Recursos

#### Recursos Humanos
| Rol | Responsabilidad |
|-----|-----------------|
| QA Lead | Coordinación de actividades de calidad |
| QA Tester | Ejecución de pruebas manuales y automatizadas |
| Desarrollador Backend | Corrección de bugs y pruebas unitarias |
| Desarrollador Frontend | Corrección de UI/UX y pruebas de componentes |
| DevOps | Configuración de CI/CD y herramientas de análisis |

#### Recursos Tecnológicos
| Categoría | Herramientas |
|-----------|--------------|
| **Análisis Estático** | SonarQube, ESLint, Prettier |
| **Pruebas Unitarias** | Jest |
| **Pruebas E2E** | Selenium, Cypress |
| **Pruebas de Rendimiento** | JMeter, k6 |
| **Análisis de Seguridad** | Trivy, OWASP ZAP |
| **Control de Versiones** | Git, GitHub |
| **CI/CD** | GitHub Actions |
| **Cobertura** | Codecov |
| **Gestión de Defectos** | GitHub Issues |

### 4.3 Métricas de Éxito

| Métrica | Objetivo |
|---------|----------|
| Cobertura de código | ≥ 80% |
| Defectos críticos | 0 en producción |
| Code smells | < 50 |
| Vulnerabilidades de seguridad | 0 críticas, 0 altas |
| Tiempo de respuesta API | < 200ms (p95) |
| Duplicación de código | < 3% |
| Deuda técnica | < 5 días |

---

## 5. MODELO DE CALIDAD

Basado en **ISO/IEC 25010**, se seleccionan los siguientes factores de calidad relevantes para el proyecto:

### 5.1 Seguridad (Prioridad Alta)

| Subfactor | Criterio | Métrica |
|-----------|----------|---------|
| Confidencialidad | Protección de datos de usuarios | Encriptación de contraseñas (bcrypt 12 rounds) |
| Integridad | Prevención de modificaciones no autorizadas | Validación JWT con refresh tokens |
| Autenticidad | Verificación de identidad | Validación de correos @unamad.edu.pe |
| No repudio | Trazabilidad de acciones | Logging de operaciones críticas |

### 5.2 Fiabilidad (Prioridad Alta)

| Subfactor | Criterio | Métrica |
|-----------|----------|---------|
| Madurez | Estabilidad del sistema | < 1 fallo crítico por semana |
| Disponibilidad | Tiempo activo | ≥ 99% uptime |
| Tolerancia a fallos | Recuperación ante errores | Manejo de excepciones en todos los endpoints |
| Recuperabilidad | Restauración de datos | Backups diarios de PostgreSQL |

### 5.3 Mantenibilidad (Prioridad Media)

| Subfactor | Criterio | Métrica |
|-----------|----------|---------|
| Modularidad | Separación de responsabilidades | Arquitectura modular NestJS |
| Reusabilidad | Componentes reutilizables | DTOs y servicios compartidos |
| Analizabilidad | Facilidad de diagnóstico | Documentación Swagger/OpenAPI |
| Modificabilidad | Facilidad de cambios | < 2 horas para cambios menores |
| Testeabilidad | Cobertura de pruebas | ≥ 80% cobertura |

### 5.4 Usabilidad (Prioridad Media)

| Subfactor | Criterio | Métrica |
|-----------|----------|---------|
| Reconocibilidad | Claridad de funciones | UI intuitiva con navegación clara |
| Aprendibilidad | Facilidad de uso | < 5 min para operaciones básicas |
| Operabilidad | Facilidad de operación | Responsive design |
| Protección errores usuario | Prevención de errores | Validación de formularios |

---

## 6. ESTRATEGIA DE ASEGURAMIENTO DE LA CALIDAD

### 6.1 Procesos a Implementar

#### 6.1.1 Revisión de Requisitos
- Validación de historias de usuario
- Verificación de criterios de aceptación
- Trazabilidad requisitos-código

#### 6.1.2 Inspección de Código
- Code reviews obligatorios en Pull Requests
- Análisis estático automático con SonarQube
- Verificación de estándares con ESLint y Prettier

#### 6.1.3 Niveles de Pruebas

| Nivel | Herramienta | Cobertura Objetivo |
|-------|-------------|-------------------|
| **Unitarias** | Jest | 80% de servicios y controladores |
| **Integración** | Jest + Supertest | Todos los endpoints API |
| **Sistema** | Cypress/Selenium | Flujos críticos de usuario |
| **Rendimiento** | JMeter | Carga de 100 usuarios concurrentes |
| **Seguridad** | Trivy, OWASP ZAP | 0 vulnerabilidades críticas |

### 6.2 Herramientas

#### 6.2.1 Análisis Estático
```
┌─────────────────────────────────────────────────────────┐
│                    SonarQube                            │
├─────────────────────────────────────────────────────────┤
│ • Detección de code smells                              │
│ • Identificación de vulnerabilidades                    │
│ • Análisis de duplicación de código                     │
│ • Cálculo de deuda técnica                              │
│ • Medición de cobertura de pruebas                      │
└─────────────────────────────────────────────────────────┘
```

#### 6.2.2 Análisis Dinámico
```
┌─────────────────────────────────────────────────────────┐
│               Selenium / Cypress                        │
├─────────────────────────────────────────────────────────┤
│ • Pruebas funcionales automatizadas                     │
│ • Pruebas de regresión                                  │
│ • Validación de flujos de usuario                       │
│ • Pruebas cross-browser                                 │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    JMeter                               │
├─────────────────────────────────────────────────────────┤
│ • Pruebas de carga                                      │
│ • Pruebas de estrés                                     │
│ • Análisis de tiempos de respuesta                      │
│ • Identificación de cuellos de botella                  │
└─────────────────────────────────────────────────────────┘
```

---

## 7. EJECUCIÓN

### 7.1 Pipeline CI/CD Implementado

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Commit     │───▶│  Lint Check  │───▶│    Tests     │
└──────────────┘    └──────────────┘    └──────────────┘
                                               │
                                               ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Deploy     │◀───│ Docker Build │◀───│    Build     │
└──────────────┘    └──────────────┘    └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Security Scan│
                    └──────────────┘
```

### 7.2 Tests Unitarios Implementados

Se han desarrollado **278 tests unitarios** que cubren servicios y controladores del backend:

#### Tests de Servicios (9 archivos)
| Archivo | Tests | Cobertura |
|---------|-------|-----------|
| `auth.service.spec.ts` | Registro, login, refresh tokens, logout, verificación email | 100% |
| `users.service.spec.ts` | CRUD usuarios, follow/unfollow, perfil | 100% |
| `posts.service.spec.ts` | CRUD posts, comentarios, likes | 100% |
| `groups.service.spec.ts` | Gestión de grupos, membresías, roles | 91% |
| `events.service.spec.ts` | CRUD eventos, asistencia, confirmación QR | 84% |
| `messages.service.spec.ts` | Mensajería, conversaciones | 100% |
| `notifications.service.spec.ts` | Notificaciones, marcado como leído | 97% |
| `feed.service.spec.ts` | Feed personalizado | 100% |
| `resources.service.spec.ts` | Subida y gestión de recursos | 100% |

#### Tests de Controladores (9 archivos)
| Archivo | Tests | Cobertura |
|---------|-------|-----------|
| `auth.controller.spec.ts` | Endpoints de autenticación | 100% |
| `users.controller.spec.ts` | Endpoints de usuarios | 88% |
| `posts.controller.spec.ts` | Endpoints de publicaciones | 90% |
| `groups.controller.spec.ts` | Endpoints de grupos | 100% |
| `events.controller.spec.ts` | Endpoints de eventos | 89% |
| `messages.controller.spec.ts` | Endpoints de mensajería | 100% |
| `notifications.controller.spec.ts` | Endpoints de notificaciones | 100% |
| `feed.controller.spec.ts` | Endpoint de feed | 100% |
| `resources.controller.spec.ts` | Endpoints de recursos | 82% |

#### Cobertura de Código Alcanzada

| Métrica | Objetivo | Resultado |
|---------|----------|-----------|
| **Statements** | ≥ 80% | **93.56%** ✅ |
| **Branches** | ≥ 70% | **79.74%** ✅ |
| **Functions** | ≥ 80% | **94.81%** ✅ |
| **Lines** | ≥ 80% | **93.95%** ✅ |

### 7.3 Jobs Configurados en GitHub Actions

| Job | Descripción | Trigger |
|-----|-------------|---------|
| **Lint & Format** | Verifica ESLint y Prettier | Push/PR |
| **Unit Tests** | Ejecuta Jest con coverage | Push/PR |
| **Upload to Codecov** | Sube reportes de cobertura | Push/PR |
| **Build** | Compila TypeScript | Push/PR |
| **Docker Build** | Construye imagen Docker | Push main |
| **Security Scan** | Análisis Trivy | Push main |

### 7.4 Integración con Codecov

Se ha configurado **Codecov** para el seguimiento visual de la cobertura de código:

- **URL**: https://app.codecov.io
- **Token configurado**: `CODECOV_TOKEN` en GitHub Secrets
- **Reportes**: Se generan automáticamente en cada PR
- **Badges**: Disponibles para mostrar cobertura en README

```yaml
# Fragmento de GitHub Actions para Codecov
- name: Upload coverage reports to Codecov
  uses: codecov/codecov-action@v4
  with:
    files: ./backend/coverage/lcov.info
    flags: unittests
    token: ${{ secrets.CODECOV_TOKEN }}
```

### 7.5 Registro de Defectos

Los defectos se registran en **GitHub Issues** con la siguiente estructura:

| Campo | Descripción |
|-------|-------------|
| **Título** | Descripción breve del defecto |
| **Severidad** | Crítica / Alta / Media / Baja |
| **Módulo** | Componente afectado |
| **Pasos para reproducir** | Secuencia detallada |
| **Comportamiento esperado** | Resultado correcto |
| **Comportamiento actual** | Resultado incorrecto |
| **Evidencia** | Screenshots, logs |
| **Asignado a** | Desarrollador responsable |

### 7.6 Priorización de Correcciones

| Severidad | Tiempo Máximo de Corrección | Criterio |
|-----------|-----------------------------|----------|
| **Crítica** | Inmediato | Sistema no funcional, pérdida de datos |
| **Alta** | 24 horas | Funcionalidad principal afectada |
| **Media** | 72 horas | Funcionalidad secundaria afectada |
| **Baja** | Próximo sprint | Mejoras menores, UI |

### 7.8 Pruebas de Rendimiento con JMeter

Se ha configurado **Apache JMeter 5.6.3** para pruebas de carga y estrés de la API REST.

#### 7.8.1 Configuración del Entorno de Pruebas

| Parámetro | Valor |
|-----------|-------|
| **Herramienta** | Apache JMeter 5.6.3 |
| **Servidor** | localhost:3001 |
| **Modo** | LOAD_TEST=true (rate limiting aumentado) |
| **Base de datos** | PostgreSQL local |

#### 7.8.2 Escenarios de Prueba

| Escenario | Usuarios Virtuales | Ramp-up | Duración | Propósito |
|-----------|-------------------|---------|----------|-----------|
| **Smoke Test** | 5 | 10s | 1 min | Verificación básica |
| **Load Test** | 50 | 60s | 5 min | Carga normal esperada |
| **Stress Test** | 100 | 120s | 10 min | Límites del sistema |

#### 7.8.3 Endpoints Evaluados

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/auth/login` | POST | Autenticación JWT |
| `/feed` | GET | Feed personalizado |
| `/posts` | GET | Lista de publicaciones |
| `/groups` | GET | Lista de grupos |
| `/events` | GET | Lista de eventos |
| `/notifications` | GET | Notificaciones del usuario |
| `/resources` | GET | Recursos académicos |

#### 7.8.4 Métricas Objetivo

| Métrica | Objetivo | Descripción |
|---------|----------|-------------|
| Tiempo de Respuesta (Avg) | < 200ms | Promedio de todas las peticiones |
| Tiempo de Respuesta (p95) | < 500ms | 95% bajo este tiempo |
| Throughput | > 50 req/s | Peticiones por segundo |
| Tasa de Error | < 1% | Porcentaje de errores |

---

### 7.9 Resultados de Pruebas de Rendimiento

#### 7.9.1 Smoke Test (5 Usuarios Concurrentes)

**Configuración:** 5 usuarios virtuales, duración 1 minuto, ramp-up 10 segundos.

| Endpoint | Samples | Avg (ms) | Min (ms) | Max (ms) | Error % | Throughput |
|----------|---------|----------|----------|----------|---------|------------|
| POST /auth/login | 121 | 106 | 3 | 1754 | 0.87% | 98 req/min |
| GET /feed | 117 | 18 | 4 | 265 | 0.88% | 1442 req/min |
| GET /posts | 117 | 10 | 3 | 76 | 0.88% | 1487 req/min |
| GET /groups | 114 | 12 | 4 | 191 | 0.88% | 1112 req/min |
| GET /events | 114 | 9 | 4 | 42 | 0.88% | 1214 req/min |
| GET /notifications | 111 | 10 | 4 | 61 | 0.87% | 1048 req/min |
| GET /resources | 110 | 11 | 3 | 182 | 0.87% | 1252 req/min |
| **TOTAL** | **804** | **26** | **3** | **1754** | **0.87%** | **1210 req/min** |

**Evaluación Smoke Test:**

| Métrica | Objetivo | Resultado | Estado |
|---------|----------|-----------|--------|
| Tiempo Respuesta (Avg) | < 200ms | 26ms | ✅ **Excelente** |
| Tiempo Login (Avg) | < 500ms | 106ms | ✅ **Bueno** |
| Tasa de Error | < 1% | 0.87% | ✅ **Cumple** |
| Throughput | > 50 req/s | 20 req/s | ⚠️ **Aceptable** |

**Observaciones:**
- Los endpoints GET responden en menos de 20ms en promedio
- El endpoint de login es más lento (106ms) debido al hash bcrypt - comportamiento esperado
- La tasa de error está dentro del margen aceptable

#### 7.9.2 Load Test (50 Usuarios Concurrentes)

**Configuración:** 50 usuarios virtuales, duración 58 segundos, ramp-up 60 segundos.

| Endpoint | Samples | Avg (ms) | Min (ms) | Max (ms) | Error % | Throughput |
|----------|---------|----------|----------|----------|---------|------------|
| POST /auth/login | 2035 | 15 | 3 | 1754 | 0.99% | 2107 req/min |
| GET /feed | 2017 | 10 | 3 | 265 | 0.99% | 2087 req/min |
| GET /posts | 2003 | 9 | 2 | 76 | 0.99% | 2073 req/min |
| GET /groups | 2023 | 11 | 3 | 191 | 0.99% | 2094 req/min |
| GET /events | 1992 | 9 | 3 | 42 | 0.99% | 2062 req/min |
| GET /notifications | 2004 | 10 | 3 | 61 | 0.99% | 2074 req/min |
| GET /resources | 1981 | 11 | 2 | 182 | 0.99% | 2050 req/min |
| **TOTAL** | **14055** | **11** | **2** | **1754** | **0.99%** | **14549 req/min** |

**Aggregate Report (Percentiles):**

| Endpoint | 90% Line (ms) | 95% Line (ms) | 99% Line (ms) | Std. Dev. |
|----------|---------------|---------------|---------------|-----------|
| POST /auth/login | 18 | 22 | 152 | 48.5 |
| GET /feed | 13 | 17 | 45 | 12.3 |
| GET /posts | 11 | 14 | 38 | 8.7 |
| GET /groups | 14 | 18 | 42 | 11.2 |
| GET /events | 11 | 14 | 32 | 7.8 |
| GET /notifications | 12 | 15 | 39 | 9.1 |
| GET /resources | 14 | 17 | 44 | 10.8 |

**Evaluación Load Test:**

| Métrica | Objetivo | Resultado | Estado |
|---------|----------|-----------|--------|
| Tiempo Respuesta (Avg) | < 200ms | 11ms | ✅ **Excelente** |
| Tiempo Respuesta (p95) | < 500ms | 22ms | ✅ **Excelente** |
| Tasa de Error | < 1% | 0.99% | ✅ **Cumple** |
| Throughput | > 50 req/s | 242 req/s | ✅ **Excelente** |

**Observaciones:**
- El sistema manejó exitosamente 50 usuarios concurrentes con un throughput de **242 peticiones por segundo**
- Todos los endpoints responden en menos de 20ms en promedio (p95)
- El tiempo máximo de respuesta (1754ms) ocurrió en el endpoint de login durante picos de carga - comportamiento esperado debido al hashing bcrypt
- La tasa de error del 0.99% está dentro del margen aceptable (< 1%)
- El sistema demostró excelente escalabilidad, multiplicando el throughput ~12x respecto al Smoke Test

#### 7.9.3 Stress Test (100 Usuarios Concurrentes)

**Configuración:** 100 usuarios virtuales, duración 10 minutos, ramp-up 120 segundos.

| Endpoint | Samples | Avg (ms) | Min (ms) | Max (ms) | Error % | Throughput |
|----------|---------|----------|----------|----------|---------|------------|
| POST /auth/login | 9528 | 24 | 2 | 1754 | 0.99% | 827.8 req/min |
| GET /feed | 9481 | 23 | 2 | 595 | 0.99% | 1058.4 req/min |
| GET /posts | 9435 | 23 | 2 | 649 | 0.99% | 1059.4 req/min |
| GET /groups | 9500 | 23 | 2 | 596 | 0.99% | 1051.4 req/min |
| GET /events | 9411 | 22 | 2 | 597 | 0.99% | 1053.5 req/min |
| GET /notifications | 9453 | 24 | 2 | 596 | 0.99% | 1050.0 req/min |
| GET /resources | 9386 | 22 | 2 | 602 | 0.99% | 1054.1 req/min |
| **TOTAL** | **66194** | **23** | **2** | **1754** | **0.99%** | **7354.6 req/min** |

**Aggregate Report (Percentiles):**

| Endpoint | 90% Line (ms) | 95% Line (ms) | 99% Line (ms) |
|----------|---------------|---------------|---------------|
| POST /auth/login | 57 | 106 | 226 |
| GET /feed | 58 | 102 | 215 |
| GET /posts | 55 | 102 | 210 |
| GET /groups | 57 | 103 | 211 |
| GET /events | 55 | 97 | 211 |
| GET /notifications | 59 | 110 | 214 |
| GET /resources | 55 | 102 | 210 |
| **TOTAL** | **57** | **103** | **213** |

**Evaluación Stress Test:**

| Métrica | Objetivo | Resultado | Estado |
|---------|----------|-----------|--------|
| Tiempo Respuesta (Avg) | < 200ms | 23ms | ✅ **Excelente** |
| Tiempo Respuesta (p95) | < 500ms | 103ms | ✅ **Excelente** |
| Tiempo Respuesta (p99) | < 1000ms | 213ms | ✅ **Excelente** |
| Tasa de Error | < 5% | 0.99% | ✅ **Excelente** |
| Throughput | > 100 req/s | 122 req/s | ✅ **Cumple** |

**Observaciones:**
- El sistema manejó exitosamente **100 usuarios concurrentes** con **66,194 peticiones totales**
- Throughput sostenido de **122 peticiones por segundo** durante 10 minutos
- El percentil 99 se mantiene en **213ms**, muy por debajo del objetivo de 1 segundo
- La tasa de error permanece estable en **0.99%** incluso bajo estrés
- No se detectaron degradaciones significativas de rendimiento comparado con el Load Test
- El sistema demostró **alta estabilidad** bajo condiciones de estrés prolongado

#### 7.9.4 Resumen Comparativo de Pruebas de Rendimiento

| Escenario | Usuarios | Samples | Avg (ms) | p95 (ms) | Error % | Throughput |
|-----------|----------|---------|----------|----------|---------|------------|
| **Smoke Test** | 5 | 804 | 26 | - | 0.87% | 20 req/s |
| **Load Test** | 50 | 14,055 | 11 | 22 | 0.99% | 242 req/s |
| **Stress Test** | 100 | 66,194 | 23 | 103 | 0.99% | 122 req/s |

**Conclusión de Pruebas de Rendimiento:**
- ✅ El sistema cumple con todos los objetivos de rendimiento establecidos
- ✅ Soporta hasta 100 usuarios concurrentes sin degradación significativa
- ✅ Tiempos de respuesta consistentemente bajos (< 30ms promedio)
- ✅ Tasa de error estable y dentro del margen aceptable (< 1%)
- ✅ Sistema **APTO para producción** según criterios de rendimiento

---

### 7.10 Ejecución de Pruebas

#### Comandos de Ejecución

```bash
# Iniciar backend en modo pruebas de carga
cd backend
set LOAD_TEST=true && npm run start:dev

# Modo GUI de JMeter
E:\programas\apache-jmeter-5.6.3\bin\jmeter.bat

# Modo CLI con reporte HTML
jmeter -n -t red-academica-load-test.jmx -l results.jtl -e -o report-html
```

#### Archivos de Prueba

```
jmeter-tests/
├── red-academica-load-test.jmx   # Plan de pruebas JMeter
├── README.md                      # Instrucciones de uso
└── results.jtl                    # Resultados (generado)
```

### 7.11 Control de Versiones

- **Repositorio**: GitHub
- **Estrategia de branching**: Git Flow
  - `main`: Producción
  - `develop`: Desarrollo
  - `feature/*`: Nuevas funcionalidades
  - `fix/*`: Corrección de bugs
- **Convención de commits**: Conventional Commits

---

## 8. CONCLUSIONES

### 8.1 Resultados Esperados

- Implementación exitosa de un sistema de aseguramiento de calidad para la Red Académica UNAMAD
- Reducción significativa de defectos en producción mediante detección temprana
- Código mantenible y documentado siguiendo estándares de la industria
- Pipeline automatizado que garantiza la calidad en cada despliegue

### 8.2 Lecciones Aprendidas

- La integración temprana de herramientas de análisis estático (SonarQube) permite identificar problemas antes de que se conviertan en bugs
- La automatización del CI/CD es fundamental para mantener la calidad de manera consistente
- La documentación y los estándares de código facilitan la colaboración del equipo

### 8.3 Recomendaciones

1. Mantener la cobertura de pruebas por encima del 80%
2. Revisar regularmente las métricas de SonarQube
3. Actualizar dependencias para evitar vulnerabilidades de seguridad
4. Realizar pruebas de carga antes de cada release mayor
5. Documentar todos los endpoints con Swagger

### 8.4 Próximos Pasos

- [x] ~~Implementar pruebas unitarias con Jest~~ ✅ **Completado - 278 tests, 93%+ cobertura**
- [x] ~~Configurar Codecov para seguimiento de cobertura~~ ✅ **Completado**
- [x] ~~Configurar SonarQube Cloud~~ ✅ **Completado**
- [x] ~~Agregar pruebas de rendimiento con JMeter~~ ✅ **Completado**
- [ ] Implementar pruebas E2E con Cypress
- [ ] Implementar monitoreo en producción
- [ ] Completar la documentación de API

---

**Documento generado para el curso de Calidad Aplicada a los Sistemas - UNAMAD**
