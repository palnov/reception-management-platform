# HR Platform (Staff Manager / ДМЦ)

Управление персоналом: график смен, KPI, продажи, оформление, расчёт зарплаты. UI и данные на русском.

## Стек
- Next.js 16 (App Router), React 19, Tailwind 4, dnd-kit, recharts, lucide-react
- Prisma 5 + **SQLite** (`DATABASE_URL="file:./dev.db"`), без Postgres
- Auth: JWT (`jose`, `jsonwebtoken`); защита маршрутов в `proxy.ts` (публичен только `/login`; `/employees`, `/data` — только менеджеры)
- Realtime: отдельный WebSocket-процесс `scripts/realtime-server.mjs` (`ws`), публикация из API через `lib/realtime-publisher.ts`, клиент — `lib/useScheduleRealtime.ts`
- Деплой: вручную на VPS (PM2: `pdmc-rm` + `staff-manager-realtime`, Nginx). Vercel/Neon не используются. Инструкция: `DEPLOYMENT_RU.md` / `DEPLOYMENT_EN.md`.

## Структура
- `app/<section>/page.tsx` — страницы: schedule, kpi, sales, registration, checklist, employees, data, login
- `app/api/<section>/` — API-роуты (audit-logs, auth, backup, checklist, employees, kpi, months, norms, registration, reports, sales, schedule, shifts)
- `lib/` — бизнес-логика и утилиты: `auth.ts`, `api-auth.ts`, `current-user.ts`, `employee-roles.ts`, `acting-lead-policy.ts`, `monthStatus.ts` / `useMonthStatus.ts` / `useSharedMonth.ts`, `report-*.ts` (Excel-отчёты, exceljs), `sales-summary.ts`, `overview-data.ts`, `audit.ts`
- `components/` — общие React-компоненты
- `prisma/schema.prisma` — модели: Employee, EmployeeRoleHistory, EmployeeSalaryHistory, Shift, KpiRecord, MonthlyNorm, MonthlyChecklist, PromotionSale, RegistrationKpi, DailyChecklist, AuditLog, ClosedMonth
- `scripts/*.test.mjs` — контрактные тесты (запускаются через `node`, без фреймворка); `smoke-check.js` проверяет таблицы/колонки БД
- `docs/superpowers/{specs,plans}` — дизайн-спеки и планы фич

## Команды
- `npm run dev` — dev-сервер; `npm run build` = `prisma generate && next build`
- `npm run check` — lint + typecheck + coefficient-тест + smoke
- Все тесты: `for f in scripts/*.test.mjs; do node $f || break; done`
- Схема БД меняется через `npx prisma db push` (миграции в `prisma/migrations` — история, на VPS используется `db push`)

## Правила
- Не запускать `npm audit fix --force`; версии на VPS ставятся через `npm ci` по `package-lock.json`.
- `JWT_SECRET` обязателен в production; `.env` в git не коммитить.
- Даты хранятся строками (`YYYY-MM-DD`, месяц — `YYYY-MM`).
- Закрытые месяцы (`ClosedMonth`) учитываются при записи смен (`app/api/shifts/batch`) — проверять при изменениях API.
- Изменения графика публикуются в realtime (`schedule.changed`); без realtime работает fallback-опрос раз в 30 с.

## Навигация по коду для агентов
- `graphify-out/` (если есть) — граф знаний проекта: сначала `graphify query "..."`, потом чтение файлов.
- CodeGraph (MCP) — индекс символов, если подключён.
