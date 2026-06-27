const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');
const testFilePattern = /\.(test|spec)\.[jt]sx?$/;
const focusedTestPattern = /\b(?:describe|it|test)(?:\.concurrent)?\.only\s*\(|\b(?:fdescribe|fit)\s*\(/;
const ignoredDirs = new Set(['.git', 'node_modules', 'openspec']);
const matches = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (!entry.isFile() || !testFilePattern.test(entry.name)) continue;

    const content = fs.readFileSync(fullPath, 'utf8');
    if (focusedTestPattern.test(content)) {
      matches.push(path.relative(rootDir, fullPath));
    }
  }
}

walk(rootDir);

if (matches.length > 0) {
  console.error('Focused Jest tests are not allowed:');
  for (const file of matches) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}
