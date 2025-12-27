# Pruebas de Rendimiento - JMeter

## Requisitos

- Java 8+ (ya instalado)
- Apache JMeter 5.6.3 (instalado en `E:\programas\apache-jmeter-5.6.3`)
- Backend corriendo en `localhost:3001`

## Estructura del Plan de Pruebas

El archivo `red-academica-load-test.jmx` contiene 3 escenarios:

| Escenario | Usuarios | Duración | Estado |
|-----------|----------|----------|--------|
| **Smoke Test** | 5 | 1 min | Habilitado |
| **Load Test** | 50 | 5 min | Deshabilitado |
| **Stress Test** | 100 | 10 min | Deshabilitado |

### Endpoints Probados

- `POST /auth/login` - Autenticación
- `GET /feed` - Feed personalizado
- `GET /posts` - Lista de publicaciones
- `GET /groups` - Lista de grupos
- `GET /events` - Lista de eventos
- `GET /notifications` - Notificaciones
- `GET /resources` - Recursos académicos

## Cómo Ejecutar

### 1. Iniciar el Backend

```bash
cd backend
npm run start:dev
```

### 2. Configurar Usuario de Prueba

Asegúrate de tener un usuario registrado con:
- Email: `test@unamad.edu.pe`
- Password: `Test123456!`

O modifica las variables en JMeter:
- `TEST_EMAIL`
- `TEST_PASSWORD`

### 3. Ejecutar JMeter (Modo GUI)

```bash
E:\programas\apache-jmeter-5.6.3\bin\jmeter.bat
```

Luego:
1. File > Open > Seleccionar `red-academica-load-test.jmx`
2. Click en el botón verde "Start" (▶)
3. Ver resultados en los Listeners (Summary Report, Aggregate Report, etc.)

### 4. Ejecutar JMeter (Línea de Comandos)

```bash
# Smoke Test con reporte HTML
E:\programas\apache-jmeter-5.6.3\bin\jmeter.bat -n -t red-academica-load-test.jmx -l results.jtl -e -o report-html

# Solo generar resultados
E:\programas\apache-jmeter-5.6.3\bin\jmeter.bat -n -t red-academica-load-test.jmx -l results.jtl
```

Parámetros:
- `-n` : Modo no-GUI (headless)
- `-t` : Archivo de prueba (.jmx)
- `-l` : Archivo de resultados (.jtl)
- `-e` : Generar reporte al finalizar
- `-o` : Carpeta de salida del reporte HTML

## Habilitar Otros Escenarios

En JMeter GUI:
1. Click derecho en "02 - Load Test (50 usuarios)"
2. Seleccionar "Enable"
3. Repetir para "03 - Stress Test" si deseas

**Importante:** Deshabilita el Smoke Test si habilitas otros para no ejecutar todos juntos.

## Métricas a Evaluar

| Métrica | Objetivo | Descripción |
|---------|----------|-------------|
| **Tiempo de Respuesta (Avg)** | < 200ms | Promedio de todas las peticiones |
| **Tiempo de Respuesta (p95)** | < 500ms | 95% de peticiones bajo este tiempo |
| **Throughput** | > 50 req/s | Peticiones por segundo |
| **Error Rate** | < 1% | Porcentaje de errores |

## Reportes

### Summary Report
Muestra estadísticas básicas por cada request:
- Samples (cantidad de peticiones)
- Average (tiempo promedio)
- Min/Max
- Error %
- Throughput

### Aggregate Report
Similar al Summary pero con percentiles (90%, 95%, 99%)

### Response Time Graph
Gráfico visual de tiempos de respuesta durante la prueba

### Reporte HTML
Se genera en la carpeta `report-html/` con gráficos interactivos

## Troubleshooting

### Error: Connection refused
- Verificar que el backend está corriendo en el puerto 3001

### Error: 401 Unauthorized
- Verificar credenciales de usuario de prueba
- El token JWT puede haber expirado (hacer login nuevamente)

### Error: Out of Memory
- Aumentar memoria de JMeter editando `jmeter.bat`:
  ```
  set HEAP=-Xms1g -Xmx2g
  ```
