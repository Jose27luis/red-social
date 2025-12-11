# Reglas de Seguridad de ESLint

Este documento explica las reglas de seguridad configuradas en ESLint para detectar vulnerabilidades comunes en el código.

## Plugins Instalados

- **eslint-plugin-security**: Detecta patrones de código inseguro
- **eslint-plugin-no-secrets**: Detecta secretos hardcodeados en el código

## Reglas Configuradas

### 1. `no-eval` (ERROR)

**¿Qué detecta?** Uso de `eval()` que puede ejecutar código arbitrario.

**Ejemplo inseguro:**

```typescript
// ❌ INSEGURO
const userInput = req.body.code;
eval(userInput); // Puede ejecutar código malicioso
```

**Solución segura:**

```typescript
// ✅ SEGURO
// No usar eval(). Buscar alternativas como JSON.parse() para datos
const data = JSON.parse(userInput);
```

---

### 2. `no-implied-eval` (ERROR)

**¿Qué detecta?** Inyección de código en `setTimeout()`, `setInterval()`, etc.

**Ejemplo inseguro:**

```typescript
// ❌ INSEGURO
const userInput = req.body.delay;
setTimeout(`alert("${userInput}")`, 1000);
```

**Solución segura:**

```typescript
// ✅ SEGURO
setTimeout(() => {
  console.log(userInput);
}, 1000);
```

---

### 3. `security/detect-unsafe-regex` (ERROR)

**¿Qué detecta?** Expresiones regulares que pueden causar ReDoS (Regular Expression Denial of Service).

**Ejemplo inseguro:**

```typescript
// ❌ INSEGURO - Puede causar bloqueo del servidor
const regex = /^(a+)+$/;
const malicious = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaa!';
regex.test(malicious); // Tarda mucho tiempo
```

**Solución segura:**

```typescript
// ✅ SEGURO
const regex = /^a+$/;
```

**Recursos:** [OWASP ReDoS](https://owasp.org/www-community/attacks/Regular_expression_Denial_of_Service_-_ReDoS)

---

### 4. `security/detect-buffer-noassert` (ERROR)

**¿Qué detecta?** Uso de `Buffer()` constructor (deprecado).

**Ejemplo inseguro:**

```typescript
// ❌ INSEGURO - Deprecado y puede tener problemas de seguridad
const buf = new Buffer(10);
```

**Solución segura:**

```typescript
// ✅ SEGURO
const buf = Buffer.alloc(10);
// o
const buf = Buffer.from([1, 2, 3]);
```

---

### 5. `security/detect-child-process` (WARNING)

**¿Qué detecta?** Uso de `child_process` que ejecuta comandos del sistema.

**Ejemplo potencialmente inseguro:**

```typescript
// ⚠️ REVISAR CUIDADOSAMENTE
import { exec } from 'child_process';

const userInput = req.body.filename;
exec(`cat ${userInput}`); // ¡Command Injection!
```

**Solución segura:**

```typescript
// ✅ SEGURO - Sanitizar input y usar spawn con argumentos separados
import { spawn } from 'child_process';

const sanitizedFilename = path.basename(userInput); // Sanitizar
const cat = spawn('cat', [sanitizedFilename]); // Argumentos separados
```

---

### 6. `security/detect-eval-with-expression` (ERROR)

**¿Qué detecta?** Variantes de `eval()` como `Function()` constructor.

**Ejemplo inseguro:**

```typescript
// ❌ INSEGURO
const fn = new Function('x', 'return x * 2');
```

**Solución segura:**

```typescript
// ✅ SEGURO
const fn = (x: number) => x * 2;
```

---

### 7. `security/detect-non-literal-fs-filename` (WARNING)

**¿Qué detecta?** Operaciones de archivos con rutas no literales (potencial path traversal).

**Ejemplo potencialmente inseguro:**

```typescript
// ⚠️ REVISAR - Path Traversal posible
import * as fs from 'fs';

const userPath = req.query.file;
fs.readFile(userPath, 'utf8', callback); // Puede leer ../../../etc/passwd
```

**Solución segura:**

```typescript
// ✅ SEGURO - Validar y sanitizar rutas
import * as path from 'path';
import * as fs from 'fs';

const basePath = '/safe/uploads/directory';
const safePath = path.join(basePath, path.basename(userPath));

// Verificar que la ruta final esté dentro del directorio permitido
if (!safePath.startsWith(basePath)) {
  throw new Error('Invalid path');
}

fs.readFile(safePath, 'utf8', callback);
```

---

### 8. `security/detect-non-literal-require` (WARNING)

**¿Qué detecta?** `require()` con variables (potencial inyección de código).

**Ejemplo potencialmente inseguro:**

```typescript
// ⚠️ REVISAR
const moduleName = req.body.module;
const mod = require(moduleName); // Puede cargar módulos maliciosos
```

**Solución segura:**

```typescript
// ✅ SEGURO - Usar whitelist
const allowedModules = {
  module1: require('./module1'),
  module2: require('./module2'),
};

const mod = allowedModules[moduleName];
if (!mod) {
  throw new Error('Module not allowed');
}
```

---

### 9. `security/detect-non-literal-regexp` (WARNING)

**¿Qué detecta?** RegExp construidos con strings dinámicos (potencial ReDoS).

**Ejemplo potencialmente inseguro:**

```typescript
// ⚠️ REVISAR
const pattern = req.body.pattern;
const regex = new RegExp(pattern); // Puede ser malicioso
```

**Solución segura:**

```typescript
// ✅ SEGURO - Usar patrones predefinidos
const allowedPatterns = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^\d{3}-\d{3}-\d{4}$/,
};

const regex = allowedPatterns[patternType];
```

---

### 10. `security/detect-pseudoRandomBytes` (ERROR)

**¿Qué detecta?** Uso de `crypto.pseudoRandomBytes()` (no criptográficamente seguro).

**Ejemplo inseguro:**

```typescript
// ❌ INSEGURO - No usar para seguridad
import * as crypto from 'crypto';

const token = crypto.pseudoRandomBytes(16).toString('hex');
```

**Solución segura:**

```typescript
// ✅ SEGURO - Usar randomBytes para tokens/contraseñas
import * as crypto from 'crypto';

const token = crypto.randomBytes(32).toString('hex');
```

---

### 11. `security/detect-object-injection` (WARNING)

**¿Qué detecta?** Acceso dinámico a propiedades de objetos (potencial prototype pollution).

**Ejemplo potencialmente inseguro:**

```typescript
// ⚠️ REVISAR
const key = req.body.key;
const value = config[key]; // Puede acceder a __proto__
```

**Solución segura:**

```typescript
// ✅ SEGURO - Validar keys o usar Map
const allowedKeys = ['setting1', 'setting2', 'setting3'];

if (!allowedKeys.includes(key)) {
  throw new Error('Invalid key');
}

const value = config[key];

// O mejor aún, usar Map
const config = new Map([
  ['setting1', 'value1'],
  ['setting2', 'value2'],
]);

const value = config.get(key);
```

**Recursos:** [Prototype Pollution](https://portswigger.net/web-security/prototype-pollution)

---

### 12. `no-secrets/no-secrets` (ERROR)

**¿Qué detecta?** Secretos hardcodeados (API keys, tokens, contraseñas).

**Configuración:**

```javascript
'no-secrets/no-secrets': ['error', {
  'tolerance': 5.0,
  'ignoreContent': ['^http://', '^https://'],
  'ignoreIdentifiers': ['JWT_SECRET', 'DATABASE_URL', 'POSTGRES_']
}]
```

**Ejemplo inseguro:**

```typescript
// ❌ INSEGURO - NUNCA hardcodear secretos
const apiKey = 'your-api-key-here-12345'; // ❌ NO hacer esto
const dbPassword = 'super-secret-password-123'; // ❌ NO hacer esto
```

**Solución segura:**

```typescript
// ✅ SEGURO - Usar variables de entorno
const apiKey = process.env.STRIPE_API_KEY;
const dbPassword = process.env.DATABASE_PASSWORD;
```

---

## Cómo Ejecutar el Linter

```bash
# Ejecutar linter
npm run lint

# Ejecutar linter y auto-fix
npm run lint -- --fix
```

## Interpretación de Resultados

- **ERROR** (🔴): Debe corregirse obligatoriamente
- **WARNING** (🟡): Revisar manualmente, puede ser un falso positivo

## Integración con CI/CD

El linter se ejecuta automáticamente en el pipeline de CI/CD:

- ✅ En cada push a `main` o `develop`
- ✅ En cada Pull Request
- ✅ Antes de hacer merge

## Recursos Adicionales

- [OWASP Top 10](https://owasp.org/Top10/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [NestJS Security](https://docs.nestjs.com/security/authentication)
- [eslint-plugin-security](https://github.com/eslint-community/eslint-plugin-security)

## Falsos Positivos

Si una regla genera un falso positivo, puedes deshabilitarla para esa línea específica:

```typescript
// eslint-disable-next-line security/detect-object-injection
const value = obj[dynamicKey];
```

**IMPORTANTE:** Solo deshabilitar cuando estés 100% seguro de que el código es seguro. Siempre agregar un comentario explicando por qué.

```typescript
// Este acceso es seguro porque dynamicKey viene de allowedKeys validado previamente
// eslint-disable-next-line security/detect-object-injection
const value = obj[dynamicKey];
```
