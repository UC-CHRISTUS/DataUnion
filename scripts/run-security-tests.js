#!/usr/bin/env node

/**
 * SECURITY TEST RUNNER
 * Ejecuta los 40 tests críticos de seguridad
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║          🔐 DATAUNION SECURITY TEST SUITE 🔐                 ║
║                                                               ║
║          Testing 40 Critical Security Vulnerabilities        ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);

console.log('⏰ Starting security tests...\n');

const testCategories = [
  {
    name: 'Authentication',
    file: 'auth.security.test.ts',
    tests: 5,
    icon: '🔑'
  },
  {
    name: 'Authorization - Encoder',
    file: 'authz-encoder.security.test.ts',
    tests: 4,
    icon: '👤'
  },
  {
    name: 'Authorization - Finance & Admin',
    file: 'authz-finance-admin.security.test.ts',
    tests: 3,
    icon: '👥'
  },
  {
    name: 'Input Validation',
    file: 'validation.security.test.ts',
    tests: 2,
    icon: '🛡️'
  },
  {
    name: 'Workflow & State',
    file: 'workflow.security.test.ts',
    tests: 3,
    icon: '🔄'
  },
  {
    name: 'API Security',
    file: 'api.security.test.ts',
    tests: 5,
    icon: '🌐'
  },
  {
    name: 'File Upload',
    file: 'upload.security.test.ts',
    tests: 3,
    icon: '📤'
  },
  {
    name: 'Export',
    file: 'export.security.test.ts',
    tests: 3,
    icon: '📥'
  }
];

let totalPassed = 0;
let totalFailed = 0;
let totalTests = 0;

console.log('📋 Test Categories:\n');
testCategories.forEach((cat, idx) => {
  console.log(`   ${idx + 1}. ${cat.icon} ${cat.name} (${cat.tests} tests)`);
  totalTests += cat.tests;
});

console.log(`\n📊 Total: ${totalTests} critical security tests\n`);
console.log('═'.repeat(60) + '\n');

// Verificar que el servidor esté corriendo
console.log('🔍 Checking if dev server is running...');
try {
  execSync('curl -s http://localhost:3000 > /dev/null', { stdio: 'ignore' });
  console.log('✅ Dev server is running\n');
} catch (error) {
  console.log('❌ Dev server is NOT running');
  console.log('   Please start it with: npm run dev');
  console.log('   Then run this script again.\n');
  process.exit(1);
}

// Ejecutar tests por categoría
for (const category of testCategories) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${category.icon}  Running: ${category.name}`);
  console.log('='.repeat(60) + '\n');

  try {
    execSync(
      `npx jest src/__tests__/security/${category.file} --verbose --detectOpenHandles`,
      { 
        stdio: 'inherit',
        cwd: process.cwd()
      }
    );
  } catch (error) {
    console.log(`\n⚠️  Some tests in ${category.name} failed\n`);
  }
}

// Resumen final
console.log('\n' + '═'.repeat(60));
console.log('📊 FINAL SECURITY TEST REPORT');
console.log('═'.repeat(60));

try {
  const output = execSync(
    'npx jest src/__tests__/security --json',
    { encoding: 'utf8', cwd: process.cwd() }
  );
  
  const results = JSON.parse(output);
  
  console.log(`\n✅ Passed: ${results.numPassedTests}`);
  console.log(`❌ Failed: ${results.numFailedTests}`);
  console.log(`⏭️  Skipped: ${results.numPendingTests}`);
  console.log(`📊 Total: ${results.numTotalTests}`);
  console.log(`\n🎯 Success Rate: ${((results.numPassedTests / results.numTotalTests) * 100).toFixed(2)}%`);
  
  if (results.numFailedTests > 0) {
    console.log('\n🔴 CRITICAL VULNERABILITIES FOUND!');
    console.log('   Please review the failed tests above.');
  } else {
    console.log('\n✅ ALL SECURITY TESTS PASSED!');
  }
} catch (error) {
  console.log('\n⚠️  Could not generate summary report');
}

console.log('\n' + '═'.repeat(60));
console.log('\n💾 Full report saved to: jest-results.json');
console.log('📄 Documentation: docs/EVIL-USER-TESTING.md\n');
