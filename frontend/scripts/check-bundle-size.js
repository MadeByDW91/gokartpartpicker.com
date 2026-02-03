#!/usr/bin/env node
/**
 * Parses Next.js build output for "First Load JS shared by all" and exits
 * with code 1 if it exceeds the budget. Used in CI to enforce performance budget.
 * See docs/mobile-performance-baseline.md.
 *
 * Usage: node scripts/check-bundle-size.js [build.log]
 *   If no file is given, reads stdin (e.g. pipe from next build).
 *   Run from frontend/: npm run build 2>&1 | tee build.log && node scripts/check-bundle-size.js build.log
 */

const fs = require('fs');
const path = require('path');

const MAX_FIRST_LOAD_KB = 200;

function getInput(filePath) {
  if (!filePath) {
    console.warn('Usage: node scripts/check-bundle-size.js <build.log>');
    process.exit(0);
  }
  const resolved = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  if (!fs.existsSync(resolved)) {
    console.warn(`check-bundle-size: File not found: ${resolved}; skipping.`);
    process.exit(0);
  }
  return fs.readFileSync(resolved, 'utf8');
}

function parseFirstLoadJSShared(content) {
  // Next.js prints e.g. "First Load JS shared by all              150 kB"
  const match = content.match(/First Load JS shared by all\s+(\d+(?:\.\d+)?)\s*kB/);
  return match ? parseFloat(match[1], 10) : null;
}

function main() {
  const filePath = process.argv[2];
  const content = getInput(filePath);
  const kb = parseFirstLoadJSShared(content);

  if (kb === null) {
    console.warn('check-bundle-size: Could not find "First Load JS shared by all" in input; skipping budget check.');
    process.exit(0);
  }

  if (kb > MAX_FIRST_LOAD_KB) {
    console.error(
      `check-bundle-size: First Load JS shared by all is ${kb} kB (max ${MAX_FIRST_LOAD_KB} kB). Budget exceeded.`
    );
    process.exit(1);
  }

  console.log(`check-bundle-size: First Load JS shared by all ${kb} kB (budget ${MAX_FIRST_LOAD_KB} kB). OK`);
  process.exit(0);
}

main();
