/**
 * Load test: Auth page (login form)
 * 20 VUs hitting /auth/login
 * Does NOT submit credentials - only loads the page.
 *
 * For full auth flow (sign-in), use a dedicated test with real test accounts.
 * This script only validates the login page loads under load.
 *
 * Run: k6 run -e TARGET_URL=http://localhost:3001 scripts/load-tests/auth.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

const TARGET = __ENV.TARGET_URL || 'http://localhost:3001';

export const options = {
  vus: 20,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res = http.get(`${TARGET}/auth/login`);
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(1);
}
