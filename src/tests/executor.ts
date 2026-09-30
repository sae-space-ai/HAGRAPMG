/**
 * HAG-RAP LAB — Test Executor
 * Runs all tests on application initialization and provides results
 */

import { runAllTests, type TestSuite } from './framework.ts';
import './all-tests.ts';
import './wp3-tests.ts';

export type { TestSuite };

let cachedResults: TestSuite | null = null;

export async function executeAllTests(): Promise<TestSuite> {
  if (cachedResults) return cachedResults;
  cachedResults = await runAllTests();
  return cachedResults;
}

export function getTestResults(): TestSuite | null {
  return cachedResults;
}

export function generateTestReport(suite: TestSuite): string {
  const lines: string[] = [];
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('  HAG-RAP LAB — TEST EXECUTION REPORT');
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('');
  lines.push(`  EXECUTION_TIME: ${new Date().toISOString()}`);
  lines.push(`  DURATION: ${suite.duration}ms`);
  lines.push('');
  lines.push('  RESULTS:');
  lines.push(`    TESTS_RUN:     ${suite.total}`);
  lines.push(`    TESTS_PASSED:  ${suite.passed}`);
  lines.push(`    TESTS_FAILED:  ${suite.failed}`);
  lines.push(`    TESTS_SKIPPED: ${suite.skipped}`);
  lines.push('');
  lines.push('  DETAILED RESULTS:');
  lines.push('');
  
  for (const result of suite.results) {
    const icon = result.passed ? '✓' : '✗';
    lines.push(`  ${icon} ${result.id} | ${result.name}`);
    lines.push(`     Requirement: ${result.requirement}`);
    lines.push(`     Result: ${result.details.split('\n')[0]}`);
    lines.push(`     Duration: ${result.duration}ms`);
    lines.push('');
  }
  
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('  EXECUTION EVIDENCE');
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push(`  COMMAND:     Application initialization (test executor)`);
  lines.push(`  EXIT_CODE:   ${suite.failed === 0 ? 0 : 1}`);
  lines.push(`  TESTS_RUN:   ${suite.total}`);
  lines.push(`  TESTS_PASSED: ${suite.passed}`);
  lines.push(`  TESTS_FAILED: ${suite.failed}`);
  lines.push(`  TESTS_SKIPPED: ${suite.skipped}`);
  lines.push('');
  
  if (suite.failed === 0) {
    lines.push('  STATUS: ALL TESTS PASSED ✓');
  } else {
    lines.push(`  STATUS: ${suite.failed} TEST(S) FAILED ✗`);
  }
  
  return lines.join('\n');
}
