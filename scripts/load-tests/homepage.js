/**
 * Load test: Homepage
 * Simulates 100 VUs hitting / for 30 seconds
 *
 * Run: k6 run -e TARGET_URL=http://localhost:3001 scripts/load-tests/homepage.js
 * Or:  docker run --rm -v $(pwd):/scripts grafana/k6 run -e TARGET_URL=http://host.docker.internal:3001 /scripts/scripts/load-tests/homepage.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

const TARGET = __ENV.TARGET_URL || 'http://localhost:3001';

export const options = {
  vus: 100,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<3000'], // p95 < 3s
    http_req_failed: ['rate<0.01'],    // error rate < 1%
  },
};

export default function () {
  const res = http.get(`${TARGET}/`);
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(0.5);
}
