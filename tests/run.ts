/**
 * HAG-RAP LAB — Test Runner
 * Execute: npx tsx tests/run.ts
 */

import { runAllTests } from '../src/tests/framework.ts';

// Import all tests (they register themselves)
import '../src/tests/all-tests.ts';
import '../src/tests/wp3-tests.ts';
import '../src/tests/wp4-tests.ts';

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  HAG-RAP LAB — Complete Test Suite T001-T260               ║');
  console.log('║  WP2 + WP3 + WP4 Scientific Research Demonstrator          ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  
  const suite = await runAllTests();
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  TEST RESULTS');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  
  for (const result of suite.results) {
    const icon = result.passed ? '✓' : '✗';
    const color = result.passed ? '' : '';
    console.log(`  ${icon} ${result.id} | ${result.name}`);
    console.log(`       Requirement: ${result.requirement}`);
    console.log(`       ${result.details.split('\n').join('\n       ')}`);
    console.log(`       Duration: ${result.duration}ms`);
    console.log('');
  }
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  TESTS_RUN:     ${suite.total}`);
  console.log(`  TESTS_PASSED:  ${suite.passed}`);
  console.log(`  TESTS_FAILED:  ${suite.failed}`);
  console.log(`  TESTS_SKIPPED: ${suite.skipped}`);
  console.log(`  DURATION:      ${suite.duration}ms`);
  console.log('');
  
  if (suite.failed === 0) {
    console.log('  STATUS: ALL TESTS PASSED ✓');
  } else {
    console.log(`  STATUS: ${suite.failed} TEST(S) FAILED ✗`);
    console.log('');
    console.log('  Failed tests:');
    for (const r of suite.results.filter(r => !r.passed)) {
      console.log(`    ${r.id}: ${r.name}`);
      console.log(`      ${r.details}`);
    }
  }
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  EXECUTION EVIDENCE');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  COMMAND:     npx tsx tests/run.ts`);
  console.log(`  EXIT_CODE:   ${suite.failed === 0 ? 0 : 1}`);
  console.log(`  TESTS_RUN:   ${suite.total}`);
  console.log(`  TESTS_PASSED: ${suite.passed}`);
  console.log(`  TESTS_FAILED: ${suite.failed}`);
  console.log(`  TESTS_SKIPPED: ${suite.skipped}`);
  console.log('');
  
  // Exit with appropriate code
  process.exit(suite.failed === 0 ? 0 : 1);
}

main().catch(err => {
  console.error('FATAL ERROR:', err);
  process.exit(1);
});
