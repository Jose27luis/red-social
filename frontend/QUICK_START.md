# 🚀 Quick Start - Seguridad Frontend

Guía rápida para empezar a usar las funcionalidades de seguridad implementadas.

---

## ⚡ Instalación

```bash
# Instalar dependencias
cd frontend
npm install

# Verificar instalación
npm run lint
npm run type-check
```

---

## 🎯 Uso Básico

### 1. Renderizar Contenido de Usuario (XSS Protection)

❌ **NUNCA hacer esto:**
```tsx
<div dangerouslySetInnerHTML={{ __html: post.content }} />
```

✅ **SIEMPRE hacer esto:**
```tsx
import { SafeHTML } from '@/components/SafeHTML';

<SafeHTML content={post.content} level="rich" />
```

**Niveles de sanitización:**
- `strict` - Remueve TODO el HTML (solo texto)
- `basic` - Permite `<b>`, `<i>`, `<em>`, `<strong>`, `<p>`, `<br>`
- `rich` - Permite headings, listas, links, code blocks

### 2. Validar Formularios

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPostSchema } from '@/lib/validators/common-schemas';

function CreatePostForm() {
  const form = useForm({
    resolver: zodResolver(createPostSchema),
  });

  // El schema valida automáticamente contra XSS, SQL injection, etc.
}
```

### 3. Validar Input Manualmente

```tsx
import { zIsNotXSS, zIsNotSqlInjection } from '@/lib/validators/security-validators';
import { z } from 'zod';

const searchSchema = z.object({
  query: z.string()
    .pipe(zIsNotSqlInjection())
    .pipe(zIsNotXSS())
});

const result = searchSchema.safeParse({ query: userInput });
if (!result.success) {
  console.error('Invalid input:', result.error);
}
```

### 4. Validar Archivos

```tsx
import { validateFile } from '@/lib/validators/file-upload';

async function handleFileUpload(file: File) {
  const result = await validateFile(file, {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png'],
    verifySignature: true
  });

  if (!result.isValid) {
    alert(result.errors.join('\n'));
    return;
  }

  // Usar nombre sanitizado
  uploadFile(result.sanitizedFilename, file);
}
```

### 5. Sanitizar URLs

```tsx
import { sanitizeUrl } from '@/lib/security/sanitizer';

const safeUrl = sanitizeUrl(user.website);
// javascript:alert(1) → ''
// https://example.com → 'https://example.com'

<a href={safeUrl} target="_blank" rel="noopener noreferrer">
  {user.name}
</a>
```

---

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm run test

# Tests con cobertura
npm run test:coverage

# Tests en modo watch
npm run test:watch

# Verificar headers de seguridad (servidor debe estar corriendo)
npm run dev
# En otra terminal:
npm run test:security-headers
```

---

## 🔍 Linting

```bash
# Ver errores
npm run lint

# Corregir automáticamente
npm run lint:fix

# Type check
npm run type-check
```

---

## 📦 Schemas Pre-construidos Disponibles

```typescript
import {
  registerSchema,      // Registro de usuarios
  loginSchema,         // Login
  createPostSchema,    // Crear posts
  createCommentSchema, // Comentarios
  searchSchema,        // Búsquedas
  uploadResourceSchema,// Subir archivos
  updateProfileSchema, // Actualizar perfil
  sendMessageSchema,   // Enviar mensajes
  createEventSchema,   // Crear eventos
  createGroupSchema,   // Crear grupos
} from '@/lib/validators/common-schemas';
```

---

## 🛠️ Validadores Disponibles

```typescript
import {
  zIsNotSqlInjection,       // Bloquea SQL injection
  zIsNotXSS,                // Bloquea XSS
  zIsNotPathTraversal,      // Bloquea ../../../
  zIsNotCommandInjection,   // Bloquea ; | & etc.
  zIsStrongPassword,        // Requiere password fuerte
  zIsSafeFilename,          // Valida nombres de archivo
  zIsNotPrototypePollution, // Bloquea __proto__, constructor
  zIsSanitizedText,         // Combina XSS + SQL + CMD
  zIsUniversityEmail,       // Email @unamad.edu.pe
  zIsSafeUrl,               // URL segura (http/https)
} from '@/lib/validators/security-validators';
```

---

## 📝 Ejemplos Completos

### Formulario de Registro

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '@/lib/validators/common-schemas';

function RegisterForm() {
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormData) => {
    // Datos ya validados contra XSS, SQL injection, etc.
    api.register(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('email')} />
      <input type="password" {...form.register('password')} />
      <input {...form.register('firstName')} />
      <input {...form.register('lastName')} />
      <button type="submit">Register</button>
    </form>
  );
}
```

### Mostrar Post con Contenido Seguro

```tsx
import { SafeHTML } from '@/components/SafeHTML';

function PostCard({ post }: { post: Post }) {
  return (
    <div className="post-card">
      <h2>{post.title}</h2>
      <SafeHTML
        content={post.content}
        level="rich"
        className="post-content"
      />
    </div>
  );
}
```

### Búsqueda Segura

```tsx
import { searchSchema } from '@/lib/validators/common-schemas';
import { useState } from 'react';

function SearchBar() {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const handleSearch = () => {
    const result = searchSchema.safeParse({ query });

    if (!result.success) {
      setError('Invalid search query');
      return;
    }

    // Búsqueda segura
    api.search(result.data.query);
  };

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

---

## 🔒 Checklist Pre-Commit

Antes de hacer commit, verifica:

- [ ] ✅ ESLint sin errores: `npm run lint`
- [ ] ✅ Type check pasando: `npm run type-check`
- [ ] ✅ Tests pasando: `npm run test`
- [ ] ✅ No `dangerouslySetInnerHTML` sin sanitizar
- [ ] ✅ Todos los formularios usan schemas de validación
- [ ] ✅ File uploads validados
- [ ] ✅ URLs sanitizadas antes de usar

**Nota:** Husky ejecuta automáticamente ESLint y tests en pre-commit.

---

## 🚨 Errores Comunes y Soluciones

### Error: "Input contains potential XSS attack patterns"

❌ **Causa:**
```tsx
const data = { content: '<script>alert(1)</script>' };
```

✅ **Solución:**
El contenido del usuario debe ser sanitizado antes de enviarlo o al mostrarlo:
```tsx
import { SafeHTML } from '@/components/SafeHTML';
<SafeHTML content={data.content} />
```

### Error: "Filename contains invalid characters"

❌ **Causa:**
```tsx
const filename = '../../../etc/passwd';
```

✅ **Solución:**
```tsx
import { sanitizeFilename } from '@/lib/security/sanitizer';
const safe = sanitizeFilename(filename); // 'etc_passwd'
```

### Error: ESLint "no-secrets/no-secrets"

❌ **Causa:**
```tsx
const apiKey = 'sk_live_12345678901234567890'; // Hardcoded secret
```

✅ **Solución:**
```tsx
const apiKey = process.env.NEXT_PUBLIC_API_KEY; // Use env vars
```

---

## 📚 Documentación Completa

- **Seguridad completa:** `SECURITY_README.md`
- **Ejemplos de tests:** `__tests__/lib/validators/`
- **Componentes:** `components/SafeHTML.tsx`
- **Validadores:** `lib/validators/security-validators.ts`

---

## 🆘 Ayuda

**¿Dudas sobre seguridad?**
1. Lee `SECURITY_README.md`
2. Revisa los tests en `__tests__/`
3. Consulta al equipo de seguridad

**¿Encontraste una vulnerabilidad?**
- 🚫 NO la publiques públicamente
- 📧 Reporta en privado al equipo

---

## ⚡ Comandos Rápidos

```bash
# Desarrollo
npm run dev                    # Iniciar servidor

# Testing
npm run test                   # Tests
npm run test:coverage          # Con cobertura
npm run test:security-headers  # Verificar headers

# Linting
npm run lint                   # Ver errores
npm run lint:fix               # Corregir auto

# Build
npm run build                  # Build producción
npm run start                  # Iniciar producción
```

---

**Última actualización:** Diciembre 2025
**Versión:** 1.0.0
