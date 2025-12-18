# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache libc6-compat

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Variables de entorno para el build
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ARG NEXT_PUBLIC_WS_URL=ws://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL

# Deshabilitar telemetría de Next.js
ENV NEXT_TELEMETRY_DISABLED=1

# Compilar el proyecto
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Instalar dependencias del sistema
RUN apk add --no-cache libc6-compat

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Deshabilitar telemetría de Next.js
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Copiar archivos públicos
COPY --from=builder /app/public ./public

# Configurar permisos para prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copiar standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Cambiar a usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 3002

# Variables de entorno en runtime
ENV PORT=3002
ENV HOSTNAME="0.0.0.0"

# Comando para iniciar la aplicación
CMD ["node", "server.js"]
