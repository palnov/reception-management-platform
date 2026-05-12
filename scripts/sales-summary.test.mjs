import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import Module from 'node:module';
import { dirname, resolve } from 'node:path';
import ts from 'typescript';

function loadTsModule(filePath) {
  if (!existsSync(filePath)) {
    throw new Error(`Missing module: ${filePath}`);
  }

  const source = readFileSync(filePath, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText;

  const mod = new Module(filePath);
  mod.filename = filePath;
  mod.paths = Module._nodeModulePaths(dirname(filePath));
  mod._compile(output, filePath);
  return mod.exports;
}

const summaryModule = loadTsModule(resolve('lib/sales-summary.ts'));

const result = summaryModule.summarizePromotionSales([
  { productName: ' Акция X ' },
  { productName: 'акция x' },
  { productName: 'АКЦИЯ   X' },
  { productName: 'Двойная забота' },
  { productName: 'двойная   забота ' },
  { productName: '' },
]);

assert.equal(result.total, 6);
assert.deepEqual(result.items, [
  { name: 'Акция X', count: 3 },
  { name: 'Двойная забота', count: 2 },
  { name: 'Без названия', count: 1 },
]);

console.log('sales-summary grouping ok');
