# Configuración de Seguridad del Proyecto

Este documento describe todas las medidas de seguridad implementadas en el proyecto.

---

## 📋 Tabla de Contenidos

1. [Pre-commit Hooks con Husky](#pre-commit-hooks-con-husky)
2. [Dependabot](#dependabot)
3. [ESLint Security Rules](#eslint-security-rules)
4. [Docker Security Scanning](#docker-security-scanning)
5. [CI/CD Pipeline Security](#cicd-pipeline-security)

---

## 🎣 Pre-commit Hooks con Husky

### ¿Qué es?
**Husky** ejecuta scripts automáticamente antes de hacer commit, asegurando que el código cumple los estándares de calidad y seguridad.

### Configuración Actual

Los hooks se ejecutan automáticamente en:
- **Pre-commit**: Antes de crear un commit

### ¿Qué se ejecuta en Pre-commit?

```bash
# .husky/pre-commit
cd backend && npx lint-staged
```

**lint-staged** ejecuta comandos solo en archivos que están en staging:

```json
// backend/package.json
"lint-staged": {
  "*.ts": [
    "eslint --fix",        // Ejecuta linter con auto-fix
    "prettier --write"     // Formatea el código
  ],
  "*.{json,md}": [
    "prettier --write"     // Formatea JSON y Markdown
  ]
}
```

### Flujo de Trabajo

```
1. Haces cambios en archivos TypeScript
   ↓
2. Ejecutas: git add .
   ↓
3. Ejecutas: git commit -m "mensaje"
   ↓
4. Husky intercepta el commit
   ↓
5. Lint-staged ejecuta:
   - ESLint en archivos .ts (detecta errores de seguridad)
   - Prettier en todos los archivos (formatea código)
   ↓
6. Si hay errores:
   ❌ El commit se cancela
   ✅ Corriges los errores
   ✅ Intentas commit nuevamente

7. Si todo pasa:
   ✅ El commit se completa exitosamente
```

### Beneficios

✅ **Prevención automática** - No puedes hacer commit de código con problemas de seguridad
✅ **Feedback inmediato** - Los errores se detectan antes de push
✅ **Código consistente** - Todo el equipo sigue los mismos estándares
✅ **Menos code reviews** - Muchos problemas se resuelven automáticamente

### Comandos Útiles

```bash
# Saltarse los hooks (NO RECOMENDADO, solo en emergencias)
git commit --no-verify -m "mensaje"

# Ver qué hooks están instalados
ls -la .husky/

# Ejecutar lint-staged manualmente
cd backend && npx lint-staged
```

### Solución de Problemas

**Problema:** "Husky hooks no se ejecutan"
```bash
# Solución: Reconfigurar hooks
cd "E:\Unamad\CURSOS 9NO SEMESTRE\calidad aplicada a los sistemas\proyectoTiendaOmnilife"
git config core.hooksPath .husky
```

**Problema:** "lint-staged falla en archivos específicos"
```bash
# Solución: Corregir manualmente y volver a intentar
cd backend
npm run lint
npm run format
git add .
git commit -m "mensaje"
```

---

## 🤖 Dependabot

### ¿Qué es?
**Dependabot** es un bot de GitHub que automáticamente:
- Detecta dependencias desactualizadas
- Detecta vulnerabilidades de seguridad en dependencias
- Crea Pull Requests para actualizar dependencias

### Configuración Actual

Archivo: `.github/dependabot.yml`

#### 1. Dependencias de npm (backend)
```yaml
- Frecuencia: Semanal (lunes a las 9:00 AM)
- Límite: 10 PRs abiertos simultáneamente
- Agrupa actualizaciones menores/patches
- Revisa: dependencias de producción y desarrollo
```

#### 2. GitHub Actions
```yaml
- Frecuencia: Semanal (lunes a las 9:00 AM)
- Límite: 5 PRs abiertos simultáneamente
- Mantiene actualizadas las actions del CI/CD
```

#### 3. Docker
```yaml
- Frecuencia: Semanal (lunes a las 9:00 AM)
- Límite: 5 PRs abiertos simultáneamente
- Actualiza la imagen base en Dockerfile
```

### Tipos de PRs que Crea

#### 🔴 Alertas de Seguridad (Prioridad Alta)
```
Title: Bump axios from 0.21.1 to 0.21.2
Labels: dependencies, security

Bumps axios from 0.21.1 to 0.21.2.

Vulnerabilities fixed:
- CVE-2021-3749: Axios vulnerable to SSRF
```

#### 🟡 Actualizaciones Regulares
```
Title: Bump @nestjs/core from 10.0.0 to 10.1.0
Labels: dependencies, automated

Updates @nestjs/core from 10.0.0 to 10.1.0
```

### Flujo de Trabajo

```
Dependabot detecta actualización disponible
   ↓
Crea PR automáticamente
   ↓
CI/CD se ejecuta automáticamente en el PR
   ↓
Tú revisas:
   - ¿Pasan los tests? ✅
   - ¿Es breaking change? ❌
   - ¿Hay notas de release importantes? 📝
   ↓
Apruebas y haces merge
   ↓
Dependencia actualizada ✅
```

### Cómo Activar Dependabot

1. Ve a tu repositorio en GitHub
2. **Settings** → **Code security and analysis**
3. Activa:
   - ✅ **Dependabot alerts** (detecta vulnerabilidades)
   - ✅ **Dependabot security updates** (crea PRs para vulnerabilidades)
   - ✅ **Dependabot version updates** (crea PRs para actualizaciones)

### Comandos de Dependabot

Puedes controlar Dependabot desde comentarios en los PRs:

```bash
# Re-crear el PR
@dependabot recreate

# Hacer merge cuando los tests pasen
@dependabot merge

# Rebase el PR
@dependabot rebase

# Ignorar esta versión
@dependabot ignore this version

# Ignorar esta dependencia
@dependabot ignore this dependency
```

### Grupos de Dependencias

Para reducir el número de PRs, las dependencias se agrupan:

**Grupo 1: Development Dependencies (menores y patches)**
- eslint, prettier, jest, etc.
- Se actualizan juntas en un solo PR

**Grupo 2: Production Dependencies (solo patches)**
- @nestjs/*, express, etc.
- Solo actualizaciones de seguridad y bugs

**Major versions**: Siempre en PRs separados (pueden tener breaking changes)

---

## 🔒 ESLint Security Rules

Ver documentación completa en: [backend/SECURITY_ESLINT.md](backend/SECURITY_ESLINT.md)

### Resumen Rápido

- **12 reglas de seguridad** activas
- **2 plugins**: eslint-plugin-security, eslint-plugin-no-secrets
- **Detección automática** de: eval(), command injection, path traversal, ReDoS, secrets, etc.

---

## 🐳 Docker Security Scanning

### Herramienta: Trivy

Trivy escanea la imagen Docker en busca de:
- Vulnerabilidades en paquetes del sistema operativo
- Vulnerabilidades en dependencias de aplicación
- Misconfiguraciones de seguridad

### Configuración en CI/CD

```yaml
# .github/workflows/ci.yml
security-scan:
  - Run Trivy vulnerability scanner
  - Upload results to GitHub Security tab
```

### Ver Resultados

1. Ve a tu repositorio en GitHub
2. **Security** → **Code scanning**
3. Verás alertas categorizadas por severidad:
   - 🔴 Critical
   - 🟠 High
   - 🟡 Medium
   - ⚪ Low

---

## 🔐 CI/CD Pipeline Security

### Checks Automáticos en Cada Push/PR

1. **Lint Check** ✍️
   - ESLint con reglas de seguridad
   - Prettier format check

2. **Tests** 🧪
   - Unit tests
   - Coverage report

3. **Build** 🏗️
   - TypeScript compilation
   - Prisma generation

4. **Docker Build** 🐳 (solo en main/develop)
   - Construye imagen
   - Push a Docker Hub

5. **Security Scan** 🔒 (solo en main/develop)
   - Trivy vulnerability scan
   - Upload a GitHub Security

### Permisos del Pipeline

```yaml
permissions:
  contents: read         # Leer código
  security-events: write # Escribir resultados de seguridad
  actions: read         # Leer información de Actions
```

---

## 📊 Stack de Seguridad Completo

| Capa | Herramienta | Qué Detecta | Cuándo |
|------|-------------|-------------|--------|
| **Pre-commit** | Husky + lint-staged | Errores de lint y formato | Antes de commit |
| **SAST** | ESLint Security | Patrones de código inseguro | Pre-commit + CI/CD |
| **Secret Scanning** | eslint-plugin-no-secrets | API keys, tokens hardcodeados | Pre-commit + CI/CD |
| **Dependency Check** | Dependabot | Vulnerabilidades en deps | Semanal |
| **Container Scan** | Trivy | Vulnerabilidades en imagen Docker | CI/CD (push a main/develop) |
| **Code Quality** | Prettier + ESLint | Estilo y bugs comunes | Pre-commit + CI/CD |
| **Test Coverage** | Jest + Codecov | Cobertura de tests | CI/CD |

---

## 🎯 Próximos Pasos Recomendados

### Corto Plazo
- [ ] Implementar Helmet.js (headers de seguridad HTTP)
- [ ] Configurar rate limiting con @nestjs/throttler
- [ ] Agregar CORS configuración estricta
- [ ] Implementar input validation con class-validator

### Medio Plazo
- [ ] Agregar Snyk para análisis más profundo de dependencias
- [ ] Implementar SonarQube para análisis de código
- [ ] Configurar penetration testing automático con OWASP ZAP
- [ ] Implementar secret management con HashiCorp Vault

### Largo Plazo
- [ ] Certificación de seguridad (ISO 27001, SOC 2)
- [ ] Implementar WAF (Web Application Firewall)
- [ ] Bug bounty program
- [ ] Security training para el equipo

---

## 📚 Recursos Adicionales

- [OWASP Top 10](https://owasp.org/Top10/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [NestJS Security](https://docs.nestjs.com/security/authentication)
- [GitHub Security Features](https://github.com/features/security)
- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)

---

## 🆘 Soporte

Si encuentras algún problema o tienes preguntas:
1. Revisa este documento
2. Consulta la documentación específica:
   - [backend/SECURITY_ESLINT.md](backend/SECURITY_ESLINT.md)
3. Abre un issue en el repositorio
4. Contacta al equipo de seguridad

---

**Última actualización:** Diciembre 2025
**Mantenido por:** Equipo de Desarrollo
