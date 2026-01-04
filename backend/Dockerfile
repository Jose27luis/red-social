# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Generar Prisma Client y compilar (sin migrate deploy)
RUN npm run build:ci

# Production stage
FROM node:20-alpine

# Instalar dependencias del sistema necesarias para Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Instalar dependencias de producción solo
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copiar Prisma schema, migraciones y node_modules generated client
COPY prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copiar código compilado desde builder
COPY --from=builder /app/dist ./dist

# Exponer puerto
EXPOSE 3001

# Comando para iniciar la aplicación
CMD ["npm", "run", "start:prod"]
