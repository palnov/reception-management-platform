const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Директория проекта (там где package.json и prisma/)
const projectRoot = path.join(__dirname, '..');
const schemaPath = path.join(projectRoot, 'prisma', 'schema.prisma');
const originalSchema = fs.readFileSync(schemaPath, 'utf8');

try {
  console.log('--- Начинаем синхронизацию с Neon ---');

  // 1. Переключаем провайдер на postgresql
  console.log('1. Переключаем Prisma на postgresql...');
  const pgSchema = originalSchema.replace(/provider = "sqlite"/, 'provider = "postgresql"');
  fs.writeFileSync(schemaPath, pgSchema);

  // 2. Генерируем клиент
  console.log('2. Генерируем Prisma Client...');
  execSync('npx --yes prisma generate', { stdio: 'inherit', cwd: projectRoot });

  // 3. Пушим схему в Neon
  console.log('3. Синхронизируем структуру базы (db push)...');
  execSync('npx --yes prisma db push', { stdio: 'inherit', cwd: projectRoot });

  // 4. Загружаем начальные данные
  console.log('4. Загружаем стартовые данные (seed)...');
  // Используем node напрямую для сида, так как путь должен быть относительно projectRoot
  execSync('node prisma/seed_norms.js', { stdio: 'inherit', cwd: projectRoot });

  console.log('--- Синхронизация успешно завершена! ---');
} catch (error) {
  console.error('Ошибка при синхронизации:', error.message);
} finally {
  // 5. Возвращаем всё как было
  console.log('5. Возвращаем Prisma на sqlite для локальной работы...');
  fs.writeFileSync(schemaPath, originalSchema);
  execSync('npx --yes prisma generate', { stdio: 'inherit', cwd: projectRoot });
}
