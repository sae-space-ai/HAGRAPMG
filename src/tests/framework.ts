/**
 * HAG-RAP LAB — Test Framework
 * Minimal test runner for T001-T060
 */

export interface TestResult {
  id: string;
  name: string;
  requirement: string;
  passed: boolean;
  details: string;
  duration: number;
}

export interface TestSuite {
  results: TestResult[];
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
}

type TestFn = () => { passed: boolean; details: string } | Promise<{ passed: boolean; details: string }>;

interface TestDef {
  id: string;
  name: string;
  requirement: string;
  fn: TestFn;
}

const tests: TestDef[] = [];

export function test(id: string, name: string, requirement: string, fn: TestFn): void {
  tests.push({ id, name, requirement, fn });
}

export async function runAllTests(): Promise<TestSuite> {
  const results: TestResult[] = [];
  const startTime = Date.now();

  for (const t of tests) {
    const testStart = Date.now();
    try {
      const result = await t.fn();
      results.push({
        id: t.id,
        name: t.name,
        requirement: t.requirement,
        passed: result.passed,
        details: result.details,
        duration: Date.now() - testStart,
      });
    } catch (err) {
      results.push({
        id: t.id,
        name: t.name,
        requirement: t.requirement,
        passed: false,
        details: `EXCEPTION: ${err instanceof Error ? err.message : String(err)}`,
        duration: Date.now() - testStart,
      });
    }
  }

  return {
    results,
    total: results.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    skipped: results.filter(r => r.details === 'SKIPPED').length,
    duration: Date.now() - startTime,
  };
}

export function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`ASSERTION FAILED: ${message}`);
}

export function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`ASSERTION FAILED: ${message} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

export function assertIncludes(arr: unknown[], item: unknown, message: string): void {
  if (!arr.includes(item)) {
    throw new Error(`ASSERTION FAILED: ${message} — ${JSON.stringify(item)} not in array`);
  }
}

export function assertGreaterThan(actual: number, threshold: number, message: string): void {
  if (actual <= threshold) {
    throw new Error(`ASSERTION FAILED: ${message} — ${actual} not > ${threshold}`);
  }
}
