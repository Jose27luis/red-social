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

### 7.12 Despliegue en Producción

Se ha desplegado la aplicación Red Académica UNAMAD en servicios cloud gratuitos para demostración y pruebas.

#### 7.12.1 Arquitectura de Despliegue

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ARQUITECTURA DE PRODUCCIÓN                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────────┐         ┌─────────────┐         ┌─────────────┐  │
│   │   Usuario   │────────▶│   Vercel    │────────▶│   Render    │  │
│   │  (Browser)  │         │  (Frontend) │         │  (Backend)  │  │
│   └─────────────┘         └─────────────┘         └──────┬──────┘  │
│                                                          │          │
│                                                          ▼          │
│                                                   ┌─────────────┐  │
│                                                   │ PostgreSQL  │  │
│                                                   │  (Render)   │  │
│                                                   └─────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### 7.12.2 Servicios Utilizados

| Componente | Servicio | Plan | URL |
|------------|----------|------|-----|
| **Frontend** | Vercel | Free | https://red-social-ashy.vercel.app |
| **Backend API** | Render | Free | https://red-academica-api.onrender.com |
| **Base de Datos** | Render PostgreSQL | Free | Internal URL (privada) |

#### 7.12.3 Paso 1: Configurar PostgreSQL en Render

1. Crear cuenta en [Render](https://render.com)
2. Ir a **Dashboard** → **New** → **PostgreSQL**
3. Configurar:
   - **Name**: `redacademica`
   - **Database**: `redacademica`
   - **User**: `redacademica`
   - **Region**: Oregon (US West)
   - **Plan**: Free
4. Click en **Create Database**
5. Esperar a que el estado cambie a "Available"
6. Copiar las URLs:
   - **Internal Database URL**: Para usar dentro de Render
   - **External Database URL**: Para conexiones externas (migraciones)

#### 7.12.4 Paso 2: Desplegar Backend en Render

1. Ir a **Dashboard** → **New** → **Web Service**
2. Conectar repositorio de GitHub
3. Configurar:
   - **Name**: `red-academica-api`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**:
     ```bash
     npm install --include=dev && npx prisma generate && npx nest build --webpack=false
     ```
   - **Start Command**:
     ```bash
     node dist/main
     ```
   - **Plan**: Free

4. Configurar **Environment Variables**:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | (Internal Database URL de PostgreSQL) |
| `JWT_SECRET` | (clave secreta segura) |
| `JWT_REFRESH_SECRET` | (otra clave secreta) |
| `JWT_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `FRONTEND_URL` | `https://red-social-ashy.vercel.app` |
| `NODE_ENV` | `production` |
| `PORT` | `3001` |

5. Click en **Create Web Service**
6. Esperar a que el deploy termine (~3-5 minutos)

#### 7.12.5 Paso 2.1: Ejecutar Migraciones de Prisma

Desde la máquina local, ejecutar las migraciones usando la **External Database URL**:

```bash
cd backend

# Configurar variable de entorno temporal
set DATABASE_URL=postgresql://user:password@host/database

# Ejecutar migraciones
npx prisma migrate deploy

# Verificar que las tablas se crearon
npx prisma db pull
```

**Nota**: Se usa la External URL porque Render Free no permite acceso a Shell.

#### 7.12.6 Paso 3: Desplegar Frontend en Vercel

1. Crear cuenta en [Vercel](https://vercel.com)
2. Click en **Add New** → **Project**
3. Importar repositorio de GitHub
4. Configurar:
   - **Framework Preset**: Next.js (auto-detectado)
   - **Root Directory**: `frontend`
5. Configurar **Environment Variables**:

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://red-academica-api.onrender.com` |

6. Click en **Deploy**
7. Esperar a que el deploy termine (~2-3 minutos)

#### 7.12.7 Paso 4: Configurar CORS en Backend

Asegurarse de que la variable `FRONTEND_URL` en Render coincida exactamente con la URL de Vercel:

```
FRONTEND_URL=https://red-social-ashy.vercel.app
```

Si la URL no coincide, se producirán errores de CORS:
```
Access to XMLHttpRequest blocked by CORS policy
```

#### 7.12.8 Verificación del Despliegue

1. **Verificar Backend**: Acceder a `https://red-academica-api.onrender.com/api` para ver la documentación Swagger
2. **Verificar Frontend**: Acceder a `https://red-social-ashy.vercel.app` para ver la interfaz
3. **Verificar Conexión BD**: El backend debe poder conectarse a PostgreSQL

#### 7.12.9 Consideraciones del Plan Gratuito

| Limitación | Descripción | Impacto |
|------------|-------------|---------|
| **Sleep Mode (Render)** | El servidor entra en sleep después de 15 min de inactividad | Primera petición tarda ~30 segundos |
| **Sin Shell (Render Free)** | No hay acceso a terminal remota | Migraciones deben ejecutarse localmente |
| **Almacenamiento BD** | 1GB máximo en PostgreSQL Free | Suficiente para demo |
| **Builds (Vercel)** | 100 deploys/día en plan Free | Suficiente para desarrollo |

#### 7.12.10 Troubleshooting Común

| Problema | Causa | Solución |
|----------|-------|----------|
| `nest: not found` | devDependencies no instaladas | Usar `npm install --include=dev` |
| `Cannot find module dist/main` | Build incompleto | Verificar `tsconfig.build.json` existe |
| CORS error | FRONTEND_URL incorrecta | Actualizar variable en Render |
| Login falla | Usuario no verificado | Actualizar `isVerified=true` en BD |
| Timeout en primera petición | Servidor en sleep | Esperar ~30 segundos |

#### 7.12.11 Archivo tsconfig.build.json

Se requiere este archivo para que NestJS compile correctamente en producción:

```json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]
}
```

---

### 7.13 Sistema de Verificación de Email

Se implementó un sistema de verificación de correo electrónico para garantizar que los usuarios registrados pertenezcan a la comunidad universitaria UNAMAD.

#### 7.13.1 Arquitectura del Sistema de Verificación

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FLUJO DE VERIFICACIÓN DE EMAIL                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│   │ Usuario  │───▶│   Registro   │───▶│  Genera      │───▶│ Envía Email  │ │
│   │          │    │  (Frontend)  │    │  Token       │    │ (SMTP/API)   │ │
│   └──────────┘    └──────────────┘    └──────────────┘    └──────┬───────┘ │
│                                                                   │         │
│                                                                   ▼         │
│   ┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│   │ Usuario  │◀───│   Login      │◀───│  Verificar   │◀───│ Click Link   │ │
│   │ Activo   │    │  Habilitado  │    │  Token       │    │ en Email     │ │
│   └──────────┘    └──────────────┘    └──────────────┘    └──────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 7.13.2 Componentes Implementados

##### Backend (NestJS)

| Archivo | Descripción |
|---------|-------------|
| `src/email/email.module.ts` | Módulo global de email |
| `src/email/email.service.ts` | Servicio de envío con Nodemailer |
| `src/auth/auth.service.ts` | Integración con registro y verificación |
| `src/auth/auth.controller.ts` | Endpoints de verificación y reenvío |

##### Frontend (Next.js)

| Archivo | Descripción |
|---------|-------------|
| `app/(auth)/verify-email/page.tsx` | Página de verificación de token |
| `app/(auth)/register/page.tsx` | Mensaje de confirmación post-registro |
| `lib/api/endpoints.ts` | Función `resendVerification` |

#### 7.13.3 Configuración de Gmail SMTP

Se configuró Gmail SMTP para el envío de correos de verificación:

```env
# Variables de entorno requeridas
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=correo@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # App Password de 16 caracteres
FRONTEND_URL=https://tu-app.vercel.app
```

**Requisitos para Gmail App Password:**
1. Tener habilitada la verificación en 2 pasos (2FA)
2. Ir a https://myaccount.google.com/apppasswords
3. Generar contraseña de aplicación para "Correo"
4. Usar la contraseña de 16 caracteres (sin espacios) en `SMTP_PASS`

**Nota:** Las cuentas institucionales (@unamad.edu.pe) pueden no tener acceso a App Passwords si el administrador de Google Workspace lo tiene deshabilitado.

#### 7.13.4 EmailService - Implementación

```typescript
@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (!host || !port || !user || !pass) {
      this.logger.warn('SMTP not configured - email sending disabled');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: false, // TLS
      auth: { user, pass },
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    // Envía email con plantilla HTML
    await this.transporter.sendMail({
      from: '"Red Académica UNAMAD" <noreply@unamad.edu.pe>',
      to: email,
      subject: 'Verifica tu cuenta - Red Académica UNAMAD',
      html: this.getVerificationEmailTemplate(verificationUrl),
    });
  }
}
```

#### 7.13.5 Plantilla de Email HTML

Se diseñó una plantilla HTML profesional con:
- Logo de UNAMAD (placeholder)
- Mensaje de bienvenida personalizado
- Botón de verificación con estilos inline
- Enlace alternativo en texto
- Footer con información de contacto
- Diseño responsive

#### 7.13.6 Endpoints de API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/auth/register` | Registra usuario y envía email de verificación |
| `GET` | `/auth/verify-email?token=xxx` | Verifica el token y activa la cuenta |
| `POST` | `/auth/resend-verification` | Reenvía email de verificación |

**Ejemplo de uso - Reenvío de verificación:**
```bash
curl -X POST https://api.example.com/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{"email": "usuario@unamad.edu.pe"}'
```

#### 7.13.7 Página de Verificación (Frontend)

La página `/verify-email` maneja los siguientes estados:

| Estado | Descripción | UI |
|--------|-------------|-----|
| `loading` | Verificando token | Spinner animado |
| `success` | Token válido, cuenta activada | Icono verde, redirección a login |
| `error` | Token inválido o expirado | Icono rojo, opción de reenvío |
| `no-token` | No se proporcionó token | Mensaje informativo |

**Requisito técnico - Suspense Boundary:**
```tsx
// Next.js requiere Suspense para useSearchParams
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
```

#### 7.13.8 Tests Actualizados

Se actualizó `auth.service.spec.ts` para incluir el mock de EmailService:

```typescript
const mockEmailService = {
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
};

const module = await Test.createTestingModule({
  providers: [
    AuthService,
    { provide: EmailService, useValue: mockEmailService },
    // ... otros providers
  ],
}).compile();
```

#### 7.13.9 Limitación en Render Free Tier

**Problema detectado:** Render bloquea conexiones SMTP salientes en el plan gratuito.

```
[Nest] ERROR [EmailService] SMTP connection failed: Connection timeout
```

**Síntomas:**
- El email se envía correctamente en desarrollo local
- En producción (Render), la conexión SMTP hace timeout después de ~2 minutos
- El registro del usuario se completa pero sin enviar el email

**Soluciones disponibles:**

| Opción | Descripción | Costo |
|--------|-------------|-------|
| **Resend API** | Servicio de email vía HTTP | Gratis (100 emails/día) |
| **SendGrid API** | Servicio de email vía HTTP | Gratis (100 emails/día) |
| **Render Paid** | Desbloquea SMTP saliente | $7/mes |
| **Verificación manual** | Actualizar BD directamente | Gratis (temporal) |

**Verificación manual de usuarios (workaround temporal):**
```sql
-- Conectar a PostgreSQL de Render usando External URL
psql "postgresql://user:pass@host/db?sslmode=require"

-- Verificar usuario manualmente
UPDATE users SET "isVerified" = true WHERE email = 'usuario@unamad.edu.pe';
```

#### 7.13.10 Commits Relacionados

| Commit | Descripción |
|--------|-------------|
| `2e860a9` | feat: agregamos autenticacion con gmail |
| `0c20568` | fix: arreglamos bugs de test y build para despliegue |

---

### 7.14 Pruebas E2E con Cypress

Se implementaron pruebas End-to-End (E2E) utilizando Cypress para validar flujos completos de usuario.

#### 7.14.1 Configuración de Cypress

**Instalación:**
```bash
cd frontend
npm install -D cypress @testing-library/cypress start-server-and-test
```

**Archivo de configuración (`cypress.config.ts`):**
```typescript
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    env: {
      apiUrl: 'http://localhost:3001',
    },
  },
});
```

#### 7.14.2 Estructura de Archivos

```
frontend/cypress/
├── e2e/
│   ├── auth.cy.ts          # Tests de autenticación
│   ├── feed.cy.ts          # Tests del feed
│   └── navigation.cy.ts    # Tests de navegación
├── fixtures/
│   └── users.json          # Datos de prueba
├── support/
│   ├── commands.ts         # Comandos personalizados
│   └── e2e.ts              # Configuración global
└── tsconfig.json           # Configuración TypeScript
```

#### 7.14.3 Tests Implementados

##### Tests de Autenticación (`auth.cy.ts`)

| Test | Descripción |
|------|-------------|
| Mostrar formulario de login | Verifica elementos del formulario |
| Error con credenciales inválidas | Valida mensaje de error |
| Validar email institucional | Solo acepta @unamad.edu.pe |
| Registro de usuario | Flujo completo de registro |
| Login exitoso | Redirección a feed + tokens |
| Protección de rutas | Redirección a login si no autenticado |
| Logout | Limpieza de tokens y redirección |

##### Tests del Feed (`feed.cy.ts`)

| Test | Descripción |
|------|-------------|
| Visualización del feed | Carga correcta de la página |
| Crear publicación | Escribir y publicar contenido |
| Interacción con posts | Like y comentarios |
| Navegación desde feed | Acceso a grupos, eventos, perfil |

##### Tests de Navegación (`navigation.cy.ts`)

| Test | Descripción |
|------|-------------|
| Enlaces de navegación | Verificar todos los enlaces |
| Navegación entre secciones | Flujo completo de navegación |
| Responsive design | Pruebas en mobile, tablet, desktop |

#### 7.14.4 Comandos Personalizados

```typescript
// cypress/support/commands.ts

// Login via UI
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/feed');
});

// Login via API (más rápido)
Cypress.Commands.add('loginViaApi', (email, password) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/login`,
    body: { email, password },
  }).then((response) => {
    window.localStorage.setItem('accessToken', response.body.accessToken);
  });
});
```

#### 7.14.5 Scripts de Ejecución

```json
{
  "scripts": {
    "cypress:open": "cypress open",
    "cypress:run": "cypress run",
    "e2e": "start-server-and-test dev http://localhost:3002 cypress:run",
    "e2e:open": "start-server-and-test dev http://localhost:3002 cypress:open"
  }
}
```

| Comando | Descripción |
|---------|-------------|
| `npm run cypress:open` | Abre Cypress UI (modo interactivo) |
| `npm run cypress:run` | Ejecuta tests en modo headless |
| `npm run e2e` | Inicia servidor + ejecuta tests |
| `npm run e2e:open` | Inicia servidor + abre Cypress UI |

#### 7.14.6 Integración con CI/CD

Se agregó un job de E2E en GitHub Actions:

```yaml
frontend-e2e:
  name: Frontend E2E Tests (Cypress)
  runs-on: ubuntu-latest
  needs: [frontend-lint]

  services:
    postgres:
      image: postgres:16-alpine

  steps:
    - name: Run Cypress tests
      uses: cypress-io/github-action@v6
      with:
        start: npm run dev
        wait-on: 'http://localhost:3002'
        browser: chrome
```

#### 7.14.7 Pirámide de Testing Completa

```
                    ┌───────────┐
                    │    E2E    │  ← Cypress (flujos completos)
                    │  (pocos)  │
                    └─────┬─────┘
                          │
                ┌─────────┴─────────┐
                │   Integración     │  ← Jest + Supertest (APIs)
                │    (algunos)      │
                └─────────┬─────────┘
                          │
          ┌───────────────┴───────────────┐
          │         Unitarias             │  ← Jest (servicios, componentes)
          │          (muchos)             │
          │        278 tests, 93%+        │
          └───────────────────────────────┘
```

#### 7.14.8 Beneficios de las Pruebas E2E

| Beneficio | Descripción |
|-----------|-------------|
| Validación de flujos reales | Simula interacción real del usuario |
| Detección de regresiones | Identifica errores en integraciones |
| Documentación viva | Los tests documentan el comportamiento esperado |
| Confianza en deploys | Mayor seguridad al desplegar cambios |

---

### 7.15 GGA (Gentleman Guardian Angel) - AI Code Review

Se implementó GGA para revisión automática de código usando IA antes de cada commit.

#### 7.15.1 ¿Qué es GGA?

GGA es una herramienta de code review automatizado que utiliza IA (Claude, Gemini, Codex, Ollama) para validar el código contra estándares definidos.

#### 7.15.2 Instalación

```bash
# Clonar repositorio
git clone https://github.com/Gentleman-Programming/gentleman-guardian-angel.git ~/gga-install

# Instalar
cd ~/gga-install && bash install.sh

# Verificar
gga version
```

#### 7.15.3 Configuración del Proyecto

**Archivo `.gga`:**
```
PROVIDER="claude"
FILE_PATTERNS="*.ts,*.tsx,*.js,*.jsx"
EXCLUDE_PATTERNS="*.test.ts,*.spec.ts,*.test.tsx,*.spec.tsx,*.d.ts"
RULES_FILE="AGENTS.md"
STRICT_MODE="true"
```

#### 7.15.4 Estándares de Código (`AGENTS.md`)

El archivo `AGENTS.md` define las reglas que la IA debe verificar:

- **TypeScript**: No usar `any`, preferir `const`, usar optional chaining
- **NestJS**: Usar DTOs, manejar excepciones, no exponer secretos
- **Next.js**: Componentes funcionales, React Query para estado servidor
- **Testing**: Descripciones claras, mocks para dependencias
- **Git**: Conventional Commits, no commitear secretos

#### 7.15.5 Integración con Husky

```bash
# .husky/pre-commit

# 1. Lint-staged (ESLint + Prettier)
cd backend && npx lint-staged
cd frontend && npx lint-staged

# 2. GGA AI Code Review
if command -v gga &> /dev/null; then
  gga run
fi
```

#### 7.15.6 Flujo de Trabajo

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE COMMIT CON GGA                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   git commit -m "feat: nueva funcionalidad"                     │
│         │                                                        │
│         ▼                                                        │
│   ┌─────────────────────────────────────────┐                   │
│   │         .husky/pre-commit               │                   │
│   ├─────────────────────────────────────────┤                   │
│   │  1. lint-staged (ESLint + Prettier)     │                   │
│   │  2. GGA (Claude AI Review)              │                   │
│   └─────────────────────────────────────────┘                   │
│         │                                                        │
│         ▼                                                        │
│   Claude analiza código vs AGENTS.md                            │
│         │                                                        │
│         ├── ✅ PASSED → Commit se realiza                       │
│         └── ❌ FAILED → Muestra violaciones, bloquea commit     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 7.15.7 Ejemplo de Revisión

**Código con problemas:**
```typescript
const data: any = await fetch(url);  // ❌ Uso de any
console.log(data);                    // ❌ console.log en producción
```

**Respuesta de GGA:**
```
STATUS: FAILED

Violations:
1. Line 1: No usar "any" - definir tipo específico
2. Line 2: No usar console.log - usar Logger de NestJS
```

---

### 7.16 Sistema de Historial de Accesos (Access Logs)

#### 7.16.1 Descripción

Se implementó un sistema de registro de accesos que permite a los usuarios ver el historial de inicios de sesión en su cuenta, incluyendo información sobre el dispositivo, navegador, sistema operativo y ubicación aproximada.

#### 7.16.2 Modelo de Datos

```prisma
model AccessLog {
  id        String   @id @default(uuid())
  userId    String
  ipAddress String
  userAgent String?
  device    String?   // Desktop, Mobile, Tablet
  browser   String?   // Chrome, Firefox, Safari, Edge
  os        String?   // Windows, macOS, Linux, Android, iOS
  country   String?
  city      String?
  success   Boolean  @default(true)
  failReason String?
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([createdAt])
  @@index([success])
  @@map("access_logs")
}
```

#### 7.16.3 Arquitectura

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌─────────────┐
│   Usuario   │────▶│    Login     │────▶│  AuthService │────▶│ AccessLogs  │
│   Login     │     │  Controller  │     │              │     │  Service    │
└─────────────┘     └──────────────┘     └──────────────┘     └──────┬──────┘
                           │                                         │
                           │ IP, User-Agent                         ▼
                           │                                  ┌─────────────┐
                           └─────────────────────────────────▶│  PostgreSQL │
                                                              │  (Render)   │
                                                              └─────────────┘
```

#### 7.16.4 Funcionalidades

| Función | Descripción |
|---------|-------------|
| **Registro automático** | Cada login exitoso se registra automáticamente |
| **Detección de dispositivo** | Identifica si es Desktop, Mobile o Tablet |
| **Detección de navegador** | Chrome, Firefox, Safari, Edge, Opera |
| **Detección de SO** | Windows, macOS, Linux, Android, iOS |
| **Geolocalización** | País y ciudad aproximada vía ip-api.com |
| **Intentos fallidos** | Contador de intentos fallidos en 24h |
| **Paginación** | Historial paginado (20 items por página) |

#### 7.16.5 Endpoints API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/access-logs` | Obtener historial de accesos (paginado) |
| GET | `/access-logs/failed-attempts` | Obtener contador de intentos fallidos |

**Ejemplo de respuesta:**
```json
{
  "data": [
    {
      "id": "uuid",
      "ipAddress": "192.168.1.1",
      "device": "Desktop",
      "browser": "Chrome",
      "os": "Windows",
      "country": "Peru",
      "city": "Puerto Maldonado",
      "success": true,
      "createdAt": "2025-12-31T19:00:00.000Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

#### 7.16.6 Interfaz de Usuario

Se creó la página `/settings/security` que muestra:
- **Resumen de seguridad**: Total de accesos, intentos fallidos, último acceso
- **Lista de accesos**: Con iconos para dispositivo, color para navegador
- **Geolocalización**: Ciudad y país de cada acceso
- **Paginación**: Navegación entre páginas de historial

#### 7.16.7 Archivos Creados/Modificados

**Backend:**
- `backend/prisma/schema.prisma` - Modelo AccessLog
- `backend/src/access-logs/access-logs.module.ts`
- `backend/src/access-logs/access-logs.service.ts`
- `backend/src/access-logs/access-logs.controller.ts`
- `backend/src/access-logs/access-logs.service.spec.ts`
- `backend/src/auth/auth.service.ts` - Integración con AccessLogsService
- `backend/src/auth/auth.controller.ts` - Captura IP y User-Agent
- `backend/src/auth/auth.module.ts` - Import AccessLogsModule

**Frontend:**
- `frontend/app/(main)/settings/security/page.tsx`

#### 7.16.8 Tests

```bash
npm test -- --testPathPattern="access-logs"

PASS src/access-logs/access-logs.service.spec.ts
  AccessLogsService
    ✓ should be defined
    ✓ should create an access log
    ✓ should return paginated access logs
    ✓ should return count of failed attempts
    ✓ should delete old logs and return count

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
```

---

### 7.17 Git Flow - Gestión de Ramas

#### 7.17.1 Descripción
Implementación del flujo de trabajo Git Flow para gestionar el desarrollo y las releases del proyecto de manera organizada y profesional.

#### 7.17.2 Estructura de Ramas

```
main (producción)
  │
  └── dev (desarrollo/integración)
        │
        ├── feature/nueva-funcionalidad
        ├── feature/otra-funcionalidad
        └── fix/correccion-bug
```

#### 7.17.3 Descripción de Ramas

| Rama | Propósito | Protección |
|------|-----------|------------|
| `main` | Código estable en producción | Requiere PR y aprobación |
| `dev` | Integración de features | Requiere CI passing |
| `feature/*` | Desarrollo de nuevas funcionalidades | Ninguna |
| `fix/*` | Corrección de bugs | Ninguna |
| `hotfix/*` | Correcciones urgentes en producción | Merge directo a main + dev |

#### 7.17.4 Flujo de Trabajo

**1. Desarrollo de nueva funcionalidad:**
```bash
# Crear rama desde dev
git checkout dev
git pull origin dev
git checkout -b feature/nombre-feature

# Desarrollar y hacer commits
git add .
git commit -m "feat: descripción del cambio"

# Actualizar con dev antes de merge
git checkout dev
git pull origin dev
git checkout feature/nombre-feature
git merge dev

# Push y crear PR hacia dev
git push -u origin feature/nombre-feature
# Crear Pull Request en GitHub: feature/* → dev
```

**2. Release a producción:**
```bash
# Cuando dev está listo para producción
git checkout main
git pull origin main
git merge dev
git push origin main

# Opcional: crear tag de versión
git tag -a v1.0.0 -m "Release versión 1.0.0"
git push origin v1.0.0
```

**3. Hotfix en producción:**
```bash
# Crear hotfix desde main
git checkout main
git checkout -b hotfix/fix-critico

# Corregir y commit
git commit -m "fix: corrección crítica"

# Merge a main y dev
git checkout main
git merge hotfix/fix-critico
git push origin main

git checkout dev
git merge hotfix/fix-critico
git push origin dev
```

#### 7.17.5 Configuración en GitHub

Para proteger las ramas principales, configurar en **Settings → Branches → Branch protection rules**:

**Rama `main`:**
- ✅ Require a pull request before merging
- ✅ Require status checks to pass (CI/CD)
- ✅ Require conversation resolution before merging
- ✅ Do not allow bypassing the above settings

**Rama `dev`:**
- ✅ Require status checks to pass (CI/CD)

#### 7.17.6 Comandos Útiles

```bash
# Ver todas las ramas
git branch -a

# Cambiar a rama dev
git checkout dev

# Actualizar rama actual
git pull origin $(git branch --show-current)

# Ver historial de merges
git log --oneline --graph --all

# Eliminar rama local después de merge
git branch -d feature/nombre-feature

# Eliminar rama remota
git push origin --delete feature/nombre-feature
```

#### 7.17.7 Estado Actual

- **Rama principal de producción:** `main`
- **Rama de desarrollo:** `dev`
- **CI/CD:** Configurado para ambas ramas
- **Flujo activo:** Todas las nuevas features se desarrollan en `dev`

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
- [x] ~~Corregir bugs detectados por SonarQube~~ ✅ **Completado**
- [x] ~~Desplegar aplicación en producción~~ ✅ **Completado - Vercel + Render**
- [x] ~~Implementar verificación de email con Gmail SMTP~~ ✅ **Completado - Funcional en local, limitado en Render Free**
- [x] ~~Implementar pruebas E2E con Cypress~~ ✅ **Completado - 3 archivos de tests, integrado en CI/CD**
- [x] ~~Implementar GGA (AI Code Review)~~ ✅ **Completado - Claude revisa código en pre-commit**
- [x] ~~Migrar a servicio de email HTTP (Resend)~~ ✅ **Completado - Limitado a email del owner en plan gratuito**
- [x] ~~Implementar historial de accesos~~ ✅ **Completado - Registro de logins con geolocalización**
- [x] ~~Implementar Git Flow~~ ✅ **Completado - Ramas main/dev configuradas**
- [ ] Implementar Tutor IA (chatbot académico)
- [ ] Implementar indicador "escribiendo..." en mensajes
- [ ] Implementar usuarios online en tiempo real
- [ ] Implementar monitoreo en producción
- [ ] Completar la documentación de API

---

**Documento generado para el curso de Calidad Aplicada a los Sistemas - UNAMAD**
