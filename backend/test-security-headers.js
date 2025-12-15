/**
 * Script para probar los headers de seguridad implementados con Helmet.js
 *
 * Uso:
 * 1. Inicia el servidor: npm run start:dev
 * 2. En otra terminal: node test-security-headers.js
 */

const http = require('http');

const SERVER_URL = 'http://localhost:3001';
const ENDPOINTS_TO_TEST = [
  '/',
  '/api/health',
  '/api/docs',
];

// Headers de seguridad esperados
const EXPECTED_HEADERS = {
  'x-dns-prefetch-control': 'off',
  'x-frame-options': 'DENY',
  'strict-transport-security': 'max-age=31536000; includeSubDomains; preload',
  'x-download-options': 'noopen',
  'x-content-type-options': 'nosniff',
  'origin-agent-cluster': '?1',
  'x-permitted-cross-domain-policies': 'none',
  'referrer-policy': 'no-referrer',
  'x-xss-protection': '1; mode=block',
  'cross-origin-opener-policy': 'same-origin-allow-popups',
  'cross-origin-resource-policy': 'cross-origin',
};

// Headers que NO deben estar presentes
const FORBIDDEN_HEADERS = [
  'x-powered-by', // Debe ser ocultado por Helmet
];

console.log('🔒 Test de Headers de Seguridad con Helmet.js\n');
console.log(`Servidor: ${SERVER_URL}\n`);

function testEndpoint(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${SERVER_URL}${endpoint}`;

    http.get(url, (res) => {
      const headers = res.headers;
      const results = {
        endpoint,
        passed: 0,
        failed: 0,
        warnings: [],
        errors: [],
      };

      console.log(`\n📍 Endpoint: ${endpoint}`);
      console.log('─'.repeat(60));

      // Verificar headers esperados
      Object.entries(EXPECTED_HEADERS).forEach(([header, expectedValue]) => {
        const actualValue = headers[header];

        if (actualValue) {
          if (actualValue === expectedValue ||
              (expectedValue && actualValue.includes(expectedValue.split(';')[0]))) {
            console.log(`✅ ${header}: ${actualValue}`);
            results.passed++;
          } else {
            console.log(`⚠️  ${header}: ${actualValue} (esperado: ${expectedValue})`);
            results.warnings.push(`${header} tiene valor inesperado`);
            results.passed++;
          }
        } else {
          console.log(`❌ ${header}: FALTANTE`);
          results.errors.push(`Header ${header} no encontrado`);
          results.failed++;
        }
      });

      // Verificar headers prohibidos
      FORBIDDEN_HEADERS.forEach((header) => {
        if (headers[header]) {
          console.log(`❌ ${header}: ${headers[header]} (NO DEBE ESTAR PRESENTE)`);
          results.errors.push(`Header ${header} no debe estar presente`);
          results.failed++;
        } else {
          console.log(`✅ ${header}: CORRECTAMENTE OCULTO`);
          results.passed++;
        }
      });

      resolve(results);
    }).on('error', (error) => {
      console.log(`\n❌ Error conectando a ${endpoint}:`);
      console.log(`   ${error.message}`);
      console.log(`\n💡 Asegúrate de que el servidor esté corriendo:`);
      console.log(`   cd backend && npm run start:dev`);
      reject(error);
    });
  });
}

async function runTests() {
  const allResults = [];

  for (const endpoint of ENDPOINTS_TO_TEST) {
    try {
      const result = await testEndpoint(endpoint);
      allResults.push(result);
    } catch (error) {
      return;
    }
  }

  // Resumen
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE RESULTADOS');
  console.log('='.repeat(60));

  let totalPassed = 0;
  let totalFailed = 0;
  let totalWarnings = 0;

  allResults.forEach((result) => {
    totalPassed += result.passed;
    totalFailed += result.failed;
    totalWarnings += result.warnings.length;
  });

  const totalTests = totalPassed + totalFailed;
  const successRate = ((totalPassed / totalTests) * 100).toFixed(1);

  console.log(`\n✅ Tests pasados: ${totalPassed}/${totalTests} (${successRate}%)`);
  console.log(`❌ Tests fallidos: ${totalFailed}/${totalTests}`);
  console.log(`⚠️  Warnings: ${totalWarnings}`);

  if (totalFailed === 0 && totalWarnings === 0) {
    console.log('\n🎉 ¡EXCELENTE! Todos los headers de seguridad están configurados correctamente.');
    console.log('   Tu aplicación tiene protección contra:');
    console.log('   - XSS (Cross-Site Scripting)');
    console.log('   - Clickjacking');
    console.log('   - MIME sniffing attacks');
    console.log('   - Man-in-the-Middle attacks');
    console.log('   - Y más...');
  } else if (totalFailed > 0) {
    console.log('\n⚠️  ATENCIÓN: Algunos headers de seguridad están faltantes.');
    console.log('   Revisa la configuración de Helmet en src/main.ts');
  } else if (totalWarnings > 0) {
    console.log('\n⚠️  Algunos headers tienen valores diferentes a los esperados.');
    console.log('   Esto puede ser normal dependiendo de tu configuración.');
  }

  console.log('\n📚 Para más información:');
  console.log('   - Documentación: backend/HELMET_SECURITY.md');
  console.log('   - OWASP: https://owasp.org/www-project-secure-headers/');
  console.log('');
}

// Ejecutar tests
runTests().catch((error) => {
  console.error('Error ejecutando tests:', error);
  process.exit(1);
});
