# Configuración de CI/CD con GitHub Actions

Esta guía te ayudará a configurar el pipeline de CI/CD para el proyecto Red Académica.

## 📋 Requisitos Previos

1. Repositorio en GitHub
2. Cuenta de Docker Hub (para publicar imágenes Docker)
3. Cuenta de Codecov (opcional, para reportes de cobertura)

## 🔧 Pasos de Configuración

### 1. Configurar Secretos de GitHub

Los secretos son necesarios para que el pipeline pueda autenticarse con servicios externos.

#### Navegar a Configuración de Secretos

1. Ve a tu repositorio en GitHub
2. Click en **Settings** (Configuración)
3. En el menú lateral, click en **Secrets and variables** → **Actions**
4. Click en **New repository secret**

#### Secretos Requeridos

##### a) Docker Hub (Obligatorio para Docker build)

**DOCKER_USERNAME**
- Descripción: Tu nombre de usuario de Docker Hub
- Valor: `tu-usuario-dockerhub`
- Ejemplo: `johndoe`

**DOCKER_PASSWORD**
- Descripción: Token de acceso de Docker Hub (NO uses tu contraseña)
- Cómo obtenerlo:
  1. Inicia sesión en [Docker Hub](https://hub.docker.com/)
  2. Ve a **Account Settings** → **Security** → **New Access Token**
  3. Crea un token con nombre descriptivo (ej: "GitHub Actions")
  4. Copia el token generado
  5. Úsalo como valor del secreto

##### b) Codecov (Opcional - para reportes de cobertura)

**CODECOV_TOKEN**
- Descripción: Token de Codecov para subir reportes de cobertura
- Cómo obtenerlo:
  1. Visita [Codecov](https://codecov.io/)
  2. Inicia sesión con tu cuenta de GitHub
  3. Agrega tu repositorio
  4. Copia el token de upload
  5. Úsalo como valor del secreto

### 2. Actualizar URLs en los Badges

Los badges en el README necesitan ser actualizados con tu información:

#### En `README.md` (root):

Reemplaza `USUARIO/REPO` con tu información:

```markdown
# Antes
[![CI/CD Pipeline](https://github.com/USUARIO/REPO/actions/workflows/ci.yml/badge.svg)]...

# Después (ejemplo)
[![CI/CD Pipeline](https://github.com/johndoe/red-academica/actions/workflows/ci.yml/badge.svg)]...
```

Hacer lo mismo para:
- URL de codecov
- URL de Docker Hub
- Cualquier otro badge que tenga `USUARIO/REPO`

#### En `backend/README.md`:

Realizar los mismos cambios.

### 3. Configurar Docker Hub Repository

1. Inicia sesión en [Docker Hub](https://hub.docker.com/)
2. Click en **Create Repository**
3. Nombre del repositorio: `red-academica-backend`
4. Visibilidad: **Public** o **Private** (según tu preferencia)
5. Click en **Create**

### 4. Verificar la Configuración del Workflow

El archivo `.github/workflows/ci.yml` está configurado para ejecutarse en:

- **Push** a las ramas `main` y `develop`
- **Pull requests** hacia las ramas `main` y `develop`
- **Manualmente** desde la pestaña Actions

#### Trigger Manual

Si quieres ejecutar el pipeline manualmente:

1. Ve a la pestaña **Actions** en GitHub
2. Selecciona el workflow **CI/CD Pipeline**
3. Click en **Run workflow**
4. Selecciona la rama
5. Click en **Run workflow**

### 5. Personalizar el Pipeline (Opcional)

#### Cambiar Versiones de Node.js

En `.github/workflows/ci.yml`, modifica la matriz de versiones:

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x]  # Agrega o quita versiones aquí
```

#### Desactivar Jobs Opcionales

Si no quieres usar Docker o el escaneo de seguridad:

```yaml
# Comenta o elimina estos jobs
docker:
  # ...

security-scan:
  # ...
```

#### Modificar Ramas de Trigger

Para cambiar en qué ramas se ejecuta el pipeline:

```yaml
on:
  push:
    branches: [ main, develop, staging ]  # Agrega tus ramas
  pull_request:
    branches: [ main, develop ]
```

## 🚀 Primera Ejecución

### Hacer Push del Código

```bash
git add .
git commit -m "feat: add CI/CD pipeline"
git push origin main
```

### Verificar la Ejecución

1. Ve a la pestaña **Actions** en GitHub
2. Deberías ver el workflow ejecutándose
3. Click en el workflow para ver detalles

### Entender los Jobs

El pipeline ejecuta los siguientes jobs en orden:

1. **lint** (paralelo): Verifica el código con ESLint y Prettier
   - Ejecuta en Node 18 y 20
   - Falla si hay errores de linting

2. **test** (paralelo): Ejecuta tests unitarios
   - Ejecuta en Node 18 y 20
   - Usa PostgreSQL service para tests de integración
   - Genera reportes de cobertura
   - Sube cobertura a Codecov

3. **build** (después de lint y test): Compila la aplicación
   - Ejecuta en Node 18 y 20
   - Sube artifacts (solo Node 20)

4. **docker** (después de build, solo en push a main/develop): Construye y publica imagen Docker
   - Crea tags basados en rama/commit
   - Publica en Docker Hub
   - Soporta multi-arquitectura (amd64/arm64)

5. **security-scan** (después de docker): Escanea vulnerabilidades
   - Usa Trivy
   - Sube resultados al Security tab de GitHub

6. **notify** (después de todos): Verifica estado general
   - Falla si algún job crítico falló

## 🐛 Troubleshooting

### Error: "Resource not accessible by integration"

**Solución**: Asegúrate de que GitHub Actions tenga permisos de escritura:

1. Settings → Actions → General
2. Workflow permissions → **Read and write permissions**
3. Guardar

### Error: "Error: Docker login failed"

**Solución**: Verifica tus secretos de Docker:

1. Confirma que `DOCKER_USERNAME` y `DOCKER_PASSWORD` estén configurados
2. Verifica que el token de Docker Hub sea válido
3. Asegúrate de usar un token, no tu contraseña

### Error: "Database connection failed" en Tests

**Solución**: El servicio de PostgreSQL puede tardar en estar listo:

- El workflow ya incluye health checks
- Si persiste, aumenta el `health-interval` en el servicio de PostgreSQL

### Tests Fallan Localmente pero Pasan en CI

**Solución**: Diferencias de entorno:

```bash
# Asegúrate de usar las mismas versiones
node --version  # Debe ser 18.x o 20.x
npm --version

# Limpia y reinstala
rm -rf node_modules package-lock.json
npm install
```

### Warning: "Node.js 16 actions are deprecated"

**Solución**: El workflow ya usa acciones actualizadas (v4):

- `actions/checkout@v4`
- `actions/setup-node@v4`
- `actions/upload-artifact@v4`

Si ves este warning, actualiza las versiones en el workflow.

## 📊 Monitoreo del Pipeline

### Ver Estado de Builds

Badge en el README muestra el estado actual:

- ✅ Verde: Build exitoso
- ❌ Rojo: Build fallido
- 🟡 Amarillo: Build en progreso

### Notificaciones

GitHub enviará notificaciones por email si:

- Un workflow falla
- Un workflow tiene éxito después de fallar

Configura notificaciones en:
**Settings** → **Notifications** → **Actions**

### Code Coverage

Si configuraste Codecov:

1. Visita `https://codecov.io/gh/USUARIO/REPO`
2. Verás reportes de cobertura por commit
3. El badge muestra el porcentaje de cobertura

### Security Scanning

Resultados de Trivy están en:

**Security** tab → **Code scanning alerts**

## 🔒 Mejores Prácticas

### Protección de Ramas

Configura branch protection para `main`:

1. Settings → Branches → Add rule
2. Branch name pattern: `main`
3. Opciones recomendadas:
   - ✅ Require pull request before merging
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - Selecciona los checks: `lint`, `test`, `build`
   - ✅ Do not allow bypassing the above settings

### Secrets Seguros

- ❌ NUNCA hagas commit de secretos en el código
- ✅ Usa GitHub Secrets para datos sensibles
- ✅ Rota tokens periódicamente
- ✅ Usa tokens con permisos mínimos necesarios

### Optimización de Cache

El workflow ya incluye cache de npm. Para mejor rendimiento:

```yaml
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

## 📚 Recursos Adicionales

- [Documentación de GitHub Actions](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [Codecov GitHub Action](https://github.com/codecov/codecov-action)
- [Trivy Action](https://github.com/aquasecurity/trivy-action)

## ✅ Checklist de Configuración

- [ ] Crear repositorio en GitHub
- [ ] Configurar secretos de Docker Hub
- [ ] Configurar Codecov (opcional)
- [ ] Actualizar badges con usuario/repo correcto
- [ ] Crear repositorio en Docker Hub
- [ ] Hacer push del código
- [ ] Verificar que el workflow se ejecute exitosamente
- [ ] Configurar branch protection
- [ ] Revisar security scan results
- [ ] Verificar que la imagen Docker se publique

---

¡Listo! Tu pipeline de CI/CD está configurado y funcionando. 🎉
