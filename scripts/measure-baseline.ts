#!/usr/bin/env tsx
/**
 * Scalability Baseline Measurement Script
 *
 * Measures response times for key pages and endpoints.
 * Run against local dev server or production.
 *
 * Usage:
 *   npx tsx scripts/measure-baseline.ts
 *   npx tsx scripts/measure-baseline.ts --url https://gokartpartpicker.com
 *
 * Prerequisites:
 *   - Dev server running: npm run dev (from frontend/) — or use --url for production
 */

const BASE_URL = process.argv.includes('--url')
  ? process.argv[process.argv.indexOf('--url') + 1] || 'http://localhost:3001'
  : 'http://localhost:3001';

const ITERATIONS = 5;
const PAUSE_MS = 500;

interface Result {
  path: string;
  times: number[];
  p50: number;
  p95: number;
  avg: number;
  errors: number;
}

async function measure(path: string): Promise<Result> {
  const times: number[] = [];
  let errors = 0;

  for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now();
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        headers: { 'Cache-Control': 'no-store' },
      });
      const elapsed = performance.now() - start;
      if (res.ok) {
        times.push(elapsed);
      } else {
        errors++;
      }
    } catch {
      errors++;
    }
    await new Promise((r) => setTimeout(r, PAUSE_MS));
  }

  times.sort((a, b) => a - b);
  const p50 = times[Math.floor(times.length * 0.5)] ?? 0;
  const p95 = times[Math.floor(times.length * 0.95)] ?? times[times.length - 1] ?? 0;
  const avg = times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0;

  return { path, times, p50, p95, avg, errors };
}

async function measureHealth(): Promise<{ db: number; status: string } | null> {
  try {
    const start = performance.now();
    const res = await fetch(`${BASE_URL}/api/health/database`);
    const elapsed = performance.now() - start;
    const json = await res.json();
    return { db: elapsed, status: json.status || 'unknown' };
  } catch {
    return null;
  }
}

const PATHS = [
  '/',
  '/engines',
  '/parts',
  '/templates',
  '/builder',
  '/engines/predator-212-hemi',
  '/parts/maxtorque-clutch-3-4',
  '/forums',
];

async function main() {
  console.log('📊 Scalability Baseline Measurement\n');
  console.log(`Target: ${BASE_URL}`);
  console.log(`Iterations per path: ${ITERATIONS}`);
  console.log('='.repeat(60));

  const results: Result[] = [];
  for (const path of PATHS) {
    process.stdout.write(`  ${path.padEnd(35)} `);
    const r = await measure(path);
    results.push(r);
    const errStr = r.errors > 0 ? ` (${r.errors} err)` : '';
    console.log(`p95: ${r.p95.toFixed(0)}ms  avg: ${r.avg.toFixed(0)}ms${errStr}`);
  }

  console.log('\n📡 Health endpoint:');
  const health = await measureHealth();
  if (health) {
    console.log(`  /api/health/database  ${health.db.toFixed(0)}ms  status: ${health.status}`);
  } else {
    console.log('  (unavailable)');
  }

  console.log('\n' + '='.repeat(60));
  console.log('Copy the output above into docs/SCALABILITY-BASELINE.md');
  console.log('Re-run after Phase 1–3 to compare.\n');

  // Summary for docs
  const timestamp = new Date().toISOString();
  const summary = results
    .map((r) => `| ${r.path} | ${r.p95.toFixed(0)} | ${r.avg.toFixed(0)} | ${r.errors} |`)
    .join('\n');

  console.log('--- Markdown table ---');
  console.log(`| Path | p95 (ms) | avg (ms) | errors |`);
  console.log(`|------|----------|----------|--------|`);
  console.log(summary);
  console.log(`\n_Recorded: ${timestamp}_`);
}

main().catch(console.error);
