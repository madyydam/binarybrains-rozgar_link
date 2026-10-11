import fs from 'node:fs';
import path from 'node:path';

const FORBIDDEN_MODULES = [
  'ranking-engine',
  'skill-core',
  'explainer',
  'pathway',
  '@rozgarlink/ranking-engine',
  '@rozgarlink/skill-core',
  '@rozgarlink/explainer',
  '@rozgarlink/pathway',
  'apps',
  'anthropic',
  '@anthropic-ai/sdk',
  'openai',
  'pg',
  'postgres',
  'redis',
  'ioredis',
  'axios',
  'node-fetch',
  'fetch',
  'bullmq',
];

const ELIGIBILITY_SRC_DIR = path.resolve(__dirname, '../packages/eligibility-engine/src');

function checkFile(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const violations: string[] = [];

  // Match import statements: import ... from '...' or import('...')
  const importRegex = /(?:import\s+(?:[\s\S]*?from\s+)?['"]([^'"]+)['"]|require\(['"]([^'"]+)['"]\))/g;
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    const importedPkg = match[1] || match[2];
    for (const forbidden of FORBIDDEN_MODULES) {
      if (
        importedPkg === forbidden ||
        importedPkg.startsWith(forbidden + '/') ||
        importedPkg.includes(`/${forbidden}`) ||
        importedPkg.includes(forbidden)
      ) {
        violations.push(`Forbidden import "${importedPkg}" in ${path.relative(process.cwd(), filePath)}`);
      }
    }
  }

  // Also check for global network calls
  const forbiddenPatterns = [/\bfetch\(/, /\bXMLHttpRequest\b/, /\bhttp\.request\b/];
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(content)) {
      violations.push(`Forbidden network call pattern ${pattern} found in ${path.relative(process.cwd(), filePath)}`);
    }
  }

  return violations;
}

function scanDir(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let violations: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      violations = violations.concat(scanDir(fullPath));
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
      violations = violations.concat(checkFile(fullPath));
    }
  }

  return violations;
}

console.log('Running eligibility-engine import purity check...');
const allViolations = scanDir(ELIGIBILITY_SRC_DIR);

if (allViolations.length > 0) {
  console.error('\n❌ VIOLATIONS FOUND IN eligibility-engine:');
  for (const v of allViolations) {
    console.error(`  - ${v}`);
  }
  console.error('\nRule Engine purity law broken: eligibility-engine must NEVER import AI, DB, network or ranking modules.\n');
  process.exit(1);
} else {
  console.log('✅ PASS: packages/eligibility-engine is completely pure. Zero forbidden imports found.');
  process.exit(0);
}
