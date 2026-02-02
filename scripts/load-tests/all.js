/**
 * Combined load test: Homepage + Engines + Parts + Builder
 * Simulates mixed traffic: 100 VUs over 60 seconds
 *
 * Run: k6 run -e TARGET_URL=http://localhost:3001 scripts/load-tests/all.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

const TARGET = __ENV.TARGET_URL || 'http://localhost:3001';
const PAGES = ['/', '/engines', '/parts', '/templates', '/builder', '/forums'];

export const options = {
  vus: 100,
  duration: '60s',
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const page = PAGES[Math.floor(Math.random() * PAGES.length)];
  const res = http.get(`${TARGET}${page}`);
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(0.5 + Math.random() * 1);
}
