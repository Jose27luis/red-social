# Helmet.js - Headers de Seguridad HTTP

Este documento explica la implementación de Helmet.js en la aplicación y qué hace cada header de seguridad.

---

## 📋 ¿Qué es Helmet.js?

**Helmet.js** es un middleware de Express/NestJS que ayuda a proteger tu aplicación estableciendo varios **headers HTTP de seguridad**.

### ¿Por qué es importante?

Los headers HTTP pueden:
- ✅ Prevenir ataques comunes (XSS, clickjacking, MIME sniffing)
- ✅ Controlar qué recursos puede cargar el navegador
- ✅ Forzar conexiones HTTPS
- ✅ Ocultar información del servidor

---

## 🛡️ Headers de Seguridad Implementados

### 1. **Content-Security-Policy (CSP)**

**¿Qué hace?** Controla qué recursos puede cargar el navegador (scripts, estilos, imágenes, etc.)

**Configuración actual:**
```javascript
contentSecurityPolicy:
  process.env.NODE_ENV === 'production'
    ? {
        directives: {
          defaultSrc: ["'self'"],              // Por defecto, solo cargar del mismo origen
          styleSrc: ["'self'", "'unsafe-inline'"], // Estilos: mismo origen + inline
          scriptSrc: ["'self'"],               // Scripts: solo del mismo origen
          imgSrc: ["'self'", 'data:', 'https:'], // Imágenes: mismo origen + data URLs + HTTPS
          connectSrc: ["'self'"],              // APIs: solo mismo origen
          fontSrc: ["'self'"],                 // Fuentes: solo mismo origen
          objectSrc: ["'none'"],               // No permitir <object>, <embed>
          mediaSrc: ["'self'"],                // Media: solo mismo origen
          frameSrc: ["'none'"],                // No permitir iframes
        },
      }
    : false, // Deshabilitado en desarrollo para Swagger
```

**Protege contra:**
- ✅ **XSS (Cross-Site Scripting)** - Limita qué scripts pueden ejecutarse
- ✅ **Data injection** - Controla recursos externos
- ✅ **Clickjacking** - Previene iframes maliciosos

**Ejemplo de ataque bloqueado:**
```html
<!-- Intento de ataque XSS -->
<script src="https://evil.com/malicious.js"></script>
<!-- ❌ Bloqueado por CSP: script no del mismo origen -->
```

**Header generado:**
```
Content-Security-Policy: default-src 'self'; script-src 'self'; ...
```

**Recursos:**
- [MDN CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)

---

### 2. **Cross-Origin-Embedder-Policy (COEP)**

**¿Qué hace?** Controla cómo el documento puede cargar recursos cross-origin.

**Configuración actual:**
```javascript
crossOriginEmbedderPolicy: false  // Relajado para APIs
```

**Por qué está deshabilitado:**
Para APIs REST, generalmente no necesitamos este nivel de aislamiento. Se habilita para aplicaciones que usan `SharedArrayBuffer` o APIs avanzadas.

---

### 3. **Cross-Origin-Opener-Policy (COOP)**

**¿Qué hace?** Asegura que un documento esté aislado de otros documentos que lo abrieron.

**Configuración actual:**
```javascript
crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' }
```

**Protege contra:**
- ✅ Ataques de timing cross-origin
- ✅ Acceso no autorizado entre ventanas

**Header generado:**
```
Cross-Origin-Opener-Policy: same-origin-allow-popups
```

---

### 4. **Cross-Origin-Resource-Policy (CORP)**

**¿Qué hace?** Controla qué orígenes pueden cargar recursos de tu servidor.

**Configuración actual:**
```javascript
crossOriginResourcePolicy: { policy: 'cross-origin' }
```

**Por qué `cross-origin`:**
Las APIs necesitan ser accesibles desde el frontend en diferentes orígenes.

**Header generado:**
```
Cross-Origin-Resource-Policy: cross-origin
```

---

### 5. **DNS Prefetch Control**

**¿Qué hace?** Controla el DNS prefetching del navegador.

**Configuración actual:**
```javascript
dnsPrefetchControl: { allow: false }
```

**Protege contra:**
- ✅ Fuga de información sobre qué dominios visita el usuario
- ✅ Previene que el navegador resuelva DNS de dominios en links

**Header generado:**
```
X-DNS-Prefetch-Control: off
```

---

### 6. **Frameguard (X-Frame-Options)**

**¿Qué hace?** Previene que tu sitio sea embebido en iframes.

**Configuración actual:**
```javascript
frameguard: { action: 'deny' }
```

**Protege contra:**
- ✅ **Clickjacking** - Ataque donde tu sitio se carga en un iframe invisible

**Ejemplo de ataque prevenido:**
```html
<!-- Sitio malicioso intenta cargar tu API en iframe -->
<iframe src="https://tu-api.com/admin"></iframe>
<!-- ❌ Bloqueado por X-Frame-Options -->
```

**Header generado:**
```
X-Frame-Options: DENY
```

**Recursos:**
- [OWASP Clickjacking](https://owasp.org/www-community/attacks/Clickjacking)

---

### 7. **Hide Powered By**

**¿Qué hace?** Oculta el header `X-Powered-By` que revela que usas Express.

**Configuración actual:**
```javascript
hidePoweredBy: true
```

**Por qué es importante:**
Revelar la tecnología que usas facilita los ataques dirigidos.

**Antes:**
```
X-Powered-By: Express
```

**Después:**
```
(Header eliminado)
```

---

### 8. **HTTP Strict Transport Security (HSTS)**

**¿Qué hace?** Fuerza al navegador a usar HTTPS siempre.

**Configuración actual:**
```javascript
hsts: {
  maxAge: 31536000,        // 1 año en segundos
  includeSubDomains: true, // Incluir subdominios
  preload: true,           // Permitir inclusión en listas de preload
}
```

**Protege contra:**
- ✅ **Man-in-the-Middle (MITM)** - Fuerza HTTPS incluso si el usuario escribe http://
- ✅ **Protocol downgrade attacks** - Previene downgrades a HTTP

**Flujo:**
```
1. Usuario visita: http://tu-api.com
   ↓
2. Navegador recuerda el header HSTS
   ↓
3. Usuario intenta: http://tu-api.com
   ↓
4. Navegador automáticamente redirige a: https://tu-api.com
```

**Header generado:**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**⚠️ IMPORTANTE:**
Solo funciona con HTTPS. En desarrollo (HTTP), el navegador ignora este header.

**Recursos:**
- [HSTS Preload List](https://hstspreload.org/)

---

### 9. **IE No Open**

**¿Qué hace?** Previene que Internet Explorer ejecute descargas en el contexto de tu sitio.

**Configuración actual:**
```javascript
ieNoOpen: true
```

**Protege contra:**
- ✅ Ejecución de HTML descargado en el contexto de tu sitio (IE legacy)

**Header generado:**
```
X-Download-Options: noopen
```

---

### 10. **No Sniff (X-Content-Type-Options)**

**¿Qué hace?** Previene que el navegador "adivine" el tipo MIME de un archivo.

**Configuración actual:**
```javascript
noSniff: true
```

**Protege contra:**
- ✅ **MIME confusion attacks** - El navegador interpreta un archivo como script cuando no lo es

**Ejemplo de ataque prevenido:**
```
1. Atacante sube imagen "maliciosa.jpg"
2. Archivo contiene JavaScript malicioso
3. Sin noSniff: Navegador podría ejecutarlo como script
4. Con noSniff: ❌ Bloqueado, solo se trata como imagen
```

**Header generado:**
```
X-Content-Type-Options: nosniff
```

---

### 11. **Origin Agent Cluster**

**¿Qué hace?** Mejora el aislamiento entre diferentes orígenes.

**Configuración actual:**
```javascript
originAgentCluster: true
```

**Protege contra:**
- ✅ Ataques de timing cross-origin
- ✅ Side-channel attacks

**Header generado:**
```
Origin-Agent-Cluster: ?1
```

---

### 12. **Permitted Cross-Domain Policies**

**¿Qué hace?** Controla políticas cross-domain de Flash y PDF.

**Configuración actual:**
```javascript
permittedCrossDomainPolicies: { permittedPolicies: 'none' }
```

**Header generado:**
```
X-Permitted-Cross-Domain-Policies: none
```

---

### 13. **Referrer Policy**

**¿Qué hace?** Controla cuánta información del referrer se envía en las peticiones.

**Configuración actual:**
```javascript
referrerPolicy: { policy: 'no-referrer' }
```

**Protege contra:**
- ✅ **Fuga de información** - URLs con tokens sensibles en el referrer

**Ejemplo:**
```
Sin Referrer Policy:
  Usuario en: https://app.com/admin?token=secret123
  Click en link externo
  ↓
  Link externo recibe: Referer: https://app.com/admin?token=secret123
  ❌ Token expuesto

Con no-referrer:
  ↓
  Link externo NO recibe header Referer
  ✅ Token protegido
```

**Header generado:**
```
Referrer-Policy: no-referrer
```

**Recursos:**
- [MDN Referrer Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy)

---

### 14. **X-XSS-Protection**

**¿Qué hace?** Activa el filtro XSS del navegador (legacy).

**Configuración actual:**
```javascript
xssFilter: true
```

**Nota:** Este header es legacy. Los navegadores modernos dependen de CSP. Se mantiene para compatibilidad con navegadores antiguos.

**Header generado:**
```
X-XSS-Protection: 1; mode=block
```

---

## 🧪 Cómo Probar los Headers

### Opción 1: Con curl (desde terminal)

```bash
# Iniciar el servidor
cd backend
npm run start:dev

# En otra terminal, probar headers
curl -I http://localhost:3001/api/health
```

**Output esperado:**
```http
HTTP/1.1 200 OK
X-DNS-Prefetch-Control: off
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Download-Options: noopen
X-Content-Type-Options: nosniff
Origin-Agent-Cluster: ?1
X-Permitted-Cross-Domain-Policies: none
Referrer-Policy: no-referrer
X-XSS-Protection: 1; mode=block
Cross-Origin-Opener-Policy: same-origin-allow-popups
Cross-Origin-Resource-Policy: cross-origin
```

### Opción 2: Con el navegador

1. Abre Chrome DevTools (F12)
2. Ve a la pestaña **Network**
3. Recarga la página
4. Click en cualquier request
5. Ve a la pestaña **Headers**
6. Busca los headers de seguridad en "Response Headers"

### Opción 3: Con herramientas online

- [Security Headers](https://securityheaders.com/)
- [Mozilla Observatory](https://observatory.mozilla.org/)

---

## 🔧 Configuración por Entorno

### Desarrollo (NODE_ENV !== 'production')
- ✅ CSP: **Deshabilitado** (para que Swagger funcione)
- ✅ Resto de headers: **Activos**

### Producción (NODE_ENV === 'production')
- ✅ CSP: **Habilitado con políticas estrictas**
- ✅ Resto de headers: **Activos**

### Variables de entorno recomendadas

```env
# .env.production
NODE_ENV=production
FRONTEND_URL=https://tu-frontend.com
```

---

## ⚙️ Personalización

### Permitir recursos de un CDN específico

```typescript
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "https://cdn.ejemplo.com"],
    styleSrc: ["'self'", "https://cdn.ejemplo.com"],
    imgSrc: ["'self'", "https://cdn.ejemplo.com", "data:"],
  },
}
```

### Permitir inline scripts (NO RECOMENDADO)

```typescript
contentSecurityPolicy: {
  directives: {
    scriptSrc: ["'self'", "'unsafe-inline'"], // ⚠️ Menos seguro
  },
}
```

### Habilitar COEP para APIs avanzadas

```typescript
crossOriginEmbedderPolicy: { policy: 'require-corp' }
```

---

## 🚨 Troubleshooting

### Problema: Swagger no funciona en producción

**Solución:** Ajustar CSP para permitir recursos de Swagger

```typescript
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
    scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
    imgSrc: ["'self'", "data:", "https:"],
  },
}
```

### Problema: El frontend no puede hacer requests

**Causa:** CORS mal configurado, no es problema de Helmet.

**Solución:** Verificar configuración de CORS en `main.ts`

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
});
```

### Problema: HSTS no funciona en desarrollo

**Causa:** HSTS solo funciona con HTTPS.

**Solución:** Es normal. En desarrollo (HTTP), el navegador ignora HSTS.

---

## 📊 Mejoras de Seguridad

### Antes de Helmet
```
Score de seguridad: F
Headers de seguridad: 0/14
```

### Después de Helmet
```
Score de seguridad: A
Headers de seguridad: 14/14 ✅
```

---

## 🎯 Próximos Pasos

### Implementados ✅
- [x] Helmet.js con todos los headers
- [x] CSP configurado por entorno
- [x] HSTS con preload
- [x] Protección contra clickjacking
- [x] Prevención de MIME sniffing

### Recomendaciones Adicionales
- [ ] Implementar rate limiting (ya tienes @nestjs/throttler)
- [ ] Configurar input validation estricta
- [ ] Implementar CSRF protection para formularios
- [ ] Configurar secure session cookies
- [ ] Implementar API key authentication para servicios externos

---

## 📚 Recursos Adicionales

- [Helmet.js Documentation](https://helmetjs.github.io/)
- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [MDN HTTP Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers)
- [Security Headers Best Practices](https://securityheaders.com/)
- [Content Security Policy Guide](https://content-security-policy.com/)

---

## 🆘 Soporte

Si tienes preguntas sobre la configuración de Helmet:
1. Consulta este documento
2. Revisa la [documentación oficial de Helmet](https://helmetjs.github.io/)
3. Abre un issue en el repositorio

---

**Última actualización:** Diciembre 2025
**Mantenido por:** Equipo de Desarrollo
