import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

function read(relativePath) {
  return readFileSync(resolve(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const layout = read('app/layout.tsx');
const globals = read('app/globals.css');

assert(
  !/next\/font\/google/.test(layout),
  'Production build should not depend on fetching Google Fonts at build time.'
);

assert(
  /font-family:\s*var\(--font-sans\)/.test(globals),
  'Global CSS should provide the app font stack without next/font/google.'
);

console.log('no remote font build dependency contract ok');
