/**
 * Load test: Builder page
 * 50 VUs hitting /builder (heavy client page with React Query fetches)
 *
 * Run: k6 run -e TARGET_URL=http://localhost:3001 scripts/load-tests/builder.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

const TARGET = __ENV.TARGET_URL || 'http://localhost:3001';

export const options = {
  vus: 50,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res = http.get(`${TARGET}/builder`);
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(1);
}
