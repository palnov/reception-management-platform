# Инструкция по деплою

Проект поддерживает два режима:

- Vercel + Neon — демонстрационная версия. Отдельный realtime-процесс не запускается, используется fallback-синхронизация.
- VPS + SQLite — рабочая версия. Помимо Next.js-приложения запускается отдельный WebSocket-процесс через PM2.

## 1. Деплой на Vercel

В Vercel задайте:

- `DATABASE_URL` — строка подключения к Neon.
- `JWT_SECRET` — длинный секрет авторизации. Он должен быть одинаковым во всех Vercel-окружениях, где используются логины.

Эти переменные для realtime в Vercel оставьте пустыми или не задавайте:

- `NEXT_PUBLIC_REALTIME_URL`
- `REALTIME_PUBLISH_URL`
- `REALTIME_PUBLISH_SECRET`
- `REALTIME_PORT`

В таком режиме демо-версия не пытается подключаться к WebSocket и автоматически использует fallback-обновление.

### Первый деплой

1. Создайте проект в Vercel и подключите GitHub-репозиторий.
2. Добавьте `DATABASE_URL` и `JWT_SECRET` в Project → Settings → Environment Variables.
3. Для первичной синхронизации Neon локально задайте `NEON_DATABASE_URL` и выполните:

   ```bash
   npm run sync-neon
   ```

4. Если база пустая, откройте `/setup` на Vercel-домене и создайте первого пользователя.

### Обновление проекта

1. Отправьте изменения в GitHub — Vercel запустит новую сборку.
2. Если менялась схема базы, после пуша выполните локально:

   ```bash
   npm run sync-neon
   ```

3. После изменения переменных окружения сделайте Redeploy в Vercel.

Не добавляйте секреты realtime в GitHub и не запускайте WebSocket-процесс на Vercel.

## 2. Деплой на VPS

Ниже предполагается каталог `/root/pdmc-rm`, приложение на порту `3005` и realtime-сервер на порту `3006`. Если каталог или порты у вас другие, замените их в командах.

Для текущей версии Next.js требуется Node.js `20.9+`.

### Установка зависимостей

```bash
cd /root/pdmc-rm
npm ci
```

`npm ci` устанавливает версии строго из `package-lock.json`. Не используйте на VPS `npm audit fix --force`: он может изменить lock-файл, обновить Next.js вне зафиксированной версии или откатить совместимость ExcelJS.

### Переменные окружения

Переменные хранятся в файле `.env` в корне проекта на VPS. Этот файл не нужно коммитить или отправлять в GitHub.

```bash
cd /root/pdmc-rm
cp .env .env.backup-$(date +%F-%H%M) 2>/dev/null || true
nano .env
```

Пример содержимого:

```env
DATABASE_URL="file:./dev.db"
PORT=3005

# Если JWT_SECRET уже есть в старом .env, оставьте его прежним.
JWT_SECRET="ваш-секрет-авторизации"

REALTIME_PORT=3006

# Внутренний адрес: Next.js публикует событие в realtime на том же VPS.
REALTIME_PUBLISH_URL="http://127.0.0.1:3006/publish"

# Придумайте отдельный длинный секрет. Он должен быть одинаковым
# у Next.js и realtime-процесса, но не должен попадать в браузер.
REALTIME_PUBLISH_SECRET="отдельный-длинный-секрет"

# Публичный адрес, по которому подключаются браузеры пользователей.
# 127.0.0.1 здесь использовать нельзя.
NEXT_PUBLIC_REALTIME_URL="ws://ваш-домен-или-ip:3006/realtime"
```

Для генерации нового секрета можно использовать:

```bash
openssl rand -hex 32
```

`JWT_SECRET` не нужно менять, если он уже используется приложением. Если создать новый `JWT_SECRET`, текущие сессии пользователей станут недействительными и им потребуется войти заново.

### Как выбрать `NEXT_PUBLIC_REALTIME_URL`

Если сайт доступен напрямую по HTTP, например `http://203.0.113.10:3005`, и порт `3006` открыт для пользователей:

```env
NEXT_PUBLIC_REALTIME_URL="ws://203.0.113.10:3006/realtime"
```

Если сайт работает через HTTPS и домен, рекомендуется проксировать WebSocket через тот же домен:

```env
NEXT_PUBLIC_REALTIME_URL="wss://hr.example.ru/realtime"
```

В этом случае в Nginx добавьте отдельный маршрут до `location /`:

```nginx
location /realtime {
    proxy_pass http://127.0.0.1:3006;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_read_timeout 86400;
}
```

После изменения конфигурации Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Если используется прямой `ws://...:3006`, откройте порт в firewall:

```bash
sudo ufw allow 3006/tcp
```

При варианте через Nginx порт `3006` наружу открывать не нужно.

Важно: `NEXT_PUBLIC_REALTIME_URL` встраивается в клиентскую сборку. Его нужно задать до `npm run build`.

### Инициализация базы и сборка

```bash
cd /root/pdmc-rm
npx prisma db push
npm run migrate:passwords
npm run build
```

`npx prisma db push` и `npm run migrate:passwords` нужны при первичной установке или соответствующих изменениях базы/auth. Саму сборку нужно выполнять после каждого обновления кода.

### Запуск через PM2

```bash
pm2 start npm --name "staff-manager" -- start -- -p 3005 -H 0.0.0.0
pm2 start npm --name "staff-manager-realtime" -- run start:realtime
pm2 startup
```

После `pm2 startup` выполните команду, которую PM2 выведет в терминале.

Затем сохраните список процессов:

```bash
pm2 save
```

### Обновление уже работающего VPS

```bash
cd /root/pdmc-rm
git pull --ff-only
npm ci

# Выполняйте только если менялась prisma/schema.prisma:
# npx prisma db push
# npm run migrate:passwords

npm run build
pm2 restart staff-manager --update-env
pm2 restart staff-manager-realtime --update-env
pm2 save
```

### Проверка realtime

Проверка процесса на самом VPS:

```bash
curl http://127.0.0.1:3006/health
pm2 status
pm2 logs staff-manager-realtime --lines 100 --nostream
```

Ожидаемый ответ health. Поле `configured` должно быть `true`:

```json
{"ok":true,"clients":0,"configured":true,"port":3006}
```

После открытия графика в браузере `clients` должен увеличиться. При изменении графика сервер должен вывести сообщение вида:

```text
Published schedule.changed for 2026-07 to 2 client(s)
```

В консоли браузера при рабочем подключении появится:

```text
[SCHEDULE_REALTIME] WebSocket connected.
```

### Если realtime не работает

- `WebSocket URL is not configured` — `NEXT_PUBLIC_REALTIME_URL` не попал в сборку. Проверьте `.env` и повторите `npm run build`.
- `clients: 0` при открытом графике — браузер не может подключиться: проверьте URL, firewall, Nginx и `ws`/`wss`.
- `REALTIME_PUBLISH_ERROR` — realtime-процесс недоступен или `REALTIME_PUBLISH_SECRET` отличается в настройках.
- `npm ls exceljs next --depth=0` должен показывать версии из lock-файла. После случайного `npm audit fix --force` выполните `npm ci`.

Если два компьютера используют одну учётную запись, изменения между ними всё равно синхронизируются. Но для системы это один и тот же редактор, поэтому значок «изменил другой сотрудник» на второй машине с той же учёткой не показывается.

## Шпаргалка

| Команда | Назначение |
| :--- | :--- |
| `npm ci` | Установить зависимости строго по `package-lock.json` |
| `npm run build` | Собрать production-версию; также встраивает `NEXT_PUBLIC_REALTIME_URL` |
| `npm run start:realtime` | Запустить WebSocket-сервер вручную |
| `curl http://127.0.0.1:3006/health` | Проверить realtime-процесс |
| `pm2 restart staff-manager --update-env` | Перезапустить Next.js после сборки |
| `pm2 restart staff-manager-realtime --update-env` | Перезапустить WebSocket-процесс |
| `npm run sync-neon` | Синхронизировать Neon для Vercel |
| `npx prisma db push` | Синхронизировать SQLite со схемой Prisma |
