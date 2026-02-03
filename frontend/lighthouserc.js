/**
 * Lighthouse CI config for mobile performance.
 * Run after starting the app: npm run build && npm run start (in another terminal), then npx lhci autorun.
 * See docs/mobile-performance-baseline.md and .github/workflows/lighthouse.yml.
 */
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/builder',
        'http://localhost:3000/parts',
        'http://localhost:3000/engines',
      ],
      numberOfRuns: 1,
      settings: {
        preset: 'mobile',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
