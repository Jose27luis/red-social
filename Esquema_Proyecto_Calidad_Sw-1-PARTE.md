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

### 7.2 Jobs Configurados en GitHub Actions

| Job | Descripción | Trigger |
|-----|-------------|---------|
| **Lint & Format** | Verifica ESLint y Prettier | Push/PR |
| **Unit Tests** | Ejecuta Jest con coverage | Push/PR |
| **Build** | Compila TypeScript | Push/PR |
| **Docker Build** | Construye imagen Docker | Push main |
| **Security Scan** | Análisis Trivy | Push main |

### 7.3 Registro de Defectos

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

### 7.4 Priorización de Correcciones

| Severidad | Tiempo Máximo de Corrección | Criterio |
|-----------|-----------------------------|----------|
| **Crítica** | Inmediato | Sistema no funcional, pérdida de datos |
| **Alta** | 24 horas | Funcionalidad principal afectada |
| **Media** | 72 horas | Funcionalidad secundaria afectada |
| **Baja** | Próximo sprint | Mejoras menores, UI |

### 7.5 Control de Versiones

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

- [ ] Implementar pruebas E2E con Cypress
- [ ] Configurar SonarQube Cloud
- [ ] Agregar pruebas de rendimiento con JMeter
- [ ] Implementar monitoreo en producción
- [ ] Completar la documentación de API

---

**Documento generado para el curso de Calidad Aplicada a los Sistemas - UNAMAD**
