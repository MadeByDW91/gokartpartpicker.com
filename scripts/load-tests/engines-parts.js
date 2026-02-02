/**
 * Load test: Engines & Parts pages
 * 200 VUs hitting /engines, /parts, /templates for 30 seconds
 *
 * Run: k6 run -e TARGET_URL=http://localhost:3001 scripts/load-tests/engines-parts.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

const TARGET = __ENV.TARGET_URL || 'http://localhost:3001';
const PAGES = ['/engines', '/parts', '/templates'];

export const options = {
  vus: 200,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const page = PAGES[Math.floor(Math.random() * PAGES.length)];
  const res = http.get(`${TARGET}${page}`);
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(0.3);
}
