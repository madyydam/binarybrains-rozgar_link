import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@rozgarlink/shared-types': path.resolve(__dirname, 'packages/shared-types/src/index.ts'),
      '@rozgarlink/eligibility-engine': path.resolve(__dirname, 'packages/eligibility-engine/src/index.ts'),
      '@rozgarlink/ranking-engine': path.resolve(__dirname, 'packages/ranking-engine/src/index.ts'),
      '@rozgarlink/explainer': path.resolve(__dirname, 'packages/explainer/src/index.ts'),
      '@rozgarlink/pathway': path.resolve(__dirname, 'packages/pathway/src/index.ts'),
      '@rozgarlink/skill-core': path.resolve(__dirname, 'packages/skill-core/src/index.ts'),
      '@rozgarlink/ui': path.resolve(__dirname, 'packages/ui/src/index.ts')
    }
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/**/*.test.ts', 'tests/**/*.test.ts', 'apps/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**', 'e2e/**']
  }
});
