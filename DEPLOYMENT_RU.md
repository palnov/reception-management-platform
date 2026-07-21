# Инструкция по деплою (Deployment Guide) - RU

Эта инструкция поможет вам правильно развернуть проект или обновить его.

## 1. Деплой на Vercel (Demo версия с базой Neon)

Важно:
- В Vercel обязательно должна быть переменная `DATABASE_URL` со строкой подключения Neon.
- В локальном `.env` для команды `npm run sync-neon` нужна переменная `NEON_DATABASE_URL` с той же Neon-строкой.
- `JWT_SECRET` должен быть одинаково задан в Vercel для всех окружений, где вы логинитесь: Production/Preview/Development, если используете preview-деплои.
- `NEXT_PUBLIC_REALTIME_URL`, `REALTIME_PUBLISH_URL`, `REALTIME_PUBLISH_SECRET` и `REALTIME_PORT` в Vercel оставьте пустыми: demo-версия будет автоматически использовать fallback-синхронизацию.
- `npm run sync-neon` обновляет структуру Neon и мигрирует старые plaintext-пароли в `scrypt$...`.

### Если это ПЕРВЫЙ деплой (Чистая установка):
1.  **Создайте проект на Vercel**, привяжите свой репозиторий.
2.  **Настройте переменные окружения** в панели Vercel:
    *   `DATABASE_URL` — ссылка из панели Neon. Именно эту переменную читает приложение на Vercel.
    *   `JWT_SECRET` — любая длинная случайная строка.
3.  **Синхронизируйте базу** со своего компьютера ОДИН РАЗ:
    *   Добавьте `NEON_DATABASE_URL="ваша-ссылка-neon"` в локальный файл `.env`.
    *   Запустите `npm run sync-neon`. Это создаст/обновит таблицы в Neon и мигрирует старые пароли в хэши.
4.  **Создайте первого пользователя**, если Neon-база пустая:
    *   Откройте `/setup` на Vercel-домене и создайте менеджера.
5.  **Готово!** Vercel сам соберет проект.

### Если вы ОБНОВЛЯЕТЕ проект (Внесли изменения):
1.  **Push в GitHub**: Просто отправьте изменения в ваш репозиторий. Vercel сам увидит их и начнет сборку.
2.  **Если менялась база данных или логика паролей**:
    *   После пуша в GitHub, запустите у себя локально:
        ```bash
        npm run sync-neon
        ```
    *   Это «протолкнет» новые таблицы/поля в Neon и обновит старые plaintext-пароли. Ваши старые данные при этом не удалятся.
3.  **Перезапустите деплой на Vercel**, если переменные окружения менялись:
    *   Vercel → Deployments → Redeploy.

### Если логин на Vercel дает 500
1.  Проверьте в Vercel → Project → Settings → Environment Variables:
    *   `DATABASE_URL` есть именно в Vercel и указывает на Neon.
    *   `JWT_SECRET` есть в том окружении, куда вы заходите.
2.  После изменения env-переменных обязательно сделайте Redeploy.
3.  Локально выполните:
    ```bash
    npm run sync-neon
    ```
4.  Откройте Vercel → Logs и найдите строку `AUTH_LOGIN_ERROR`. Самые частые причины:
    *   `DATABASE_URL` отсутствует или указан только как `NEON_DATABASE_URL`;
    *   таблица/колонка еще не создана в Neon;
    *   Neon-база пустая, и сначала нужно пройти `/setup`;
    *   строка подключения Neon не подходит для serverless/runtime.

---

## 2. Деплой на VPS (Production версия с базой SQLite)

### Если это ПЕРВЫЙ деплой (Чистая установка):
1.  **Склонируйте репозиторий** на сервер и установите зависимости: `npm install`.
2.  **Создайте файл `.env`** на сервере и пропишите:
    *   `DATABASE_URL="file:./dev.db"`
    *   `JWT_SECRET="ваша-секретная-строка"`
    *   `PORT=3005`
    *   `REALTIME_PORT=3006`
    *   `REALTIME_PUBLISH_URL="http://127.0.0.1:3006/publish"`
    *   `REALTIME_PUBLISH_SECRET="длинная-случайная-строка-для-публикации"`
    *   `NEXT_PUBLIC_REALTIME_URL="ws://ваш-домен-или-ip:3006/realtime"`

    WebSocket-адрес должен быть доступен с компьютеров пользователей. Если сайт работает по HTTPS, используйте `wss://` и настройте reverse proxy с поддержкой WebSocket Upgrade. `NEXT_PUBLIC_REALTIME_URL` задаётся до `npm run build`, потому что он попадает в клиентскую сборку.
3.  **Инициализируйте базу**:
    ```bash
    npx prisma db push
    npm run migrate:passwords
    ```
4.  **Соберите проект**:
    ```bash
    npm run build
    ```
5.  **Запустите через PM2**:
    ```bash
    pm2 start npm --name "staff-manager" -- start -- -p 3005 -H 0.0.0.0
    pm2 start npm --name "staff-manager-realtime" -- run start:realtime
    pm2 save
    ```
6.  **Настройте админа**: Откройте в браузере `http://ваш-ip:3000/setup` и создайте первого пользователя.

### Если вы ОБНОВЛЯЕТЕ проект (Внесли изменения):
1.  **Зайдите на сервер** и подтяните код:
    ```bash
    git pull
    npm install
    ```
2.  **Если меняли базу данных (schema.prisma)**:
    ```bash
    npx prisma db push
    npm run migrate:passwords
    ```
3.  **Соберите и перезапустите**:
    ```bash
    npm run build
    pm2 restart staff-manager
    pm2 restart staff-manager-realtime
    ```

---

## Шпаргалка по командам

| Команда | Что делает | Когда использовать |
| :--- | :--- | :--- |
| `npm run build` | Компилирует Next.js для работы | При каждом обновлении кода |
| `npm run sync-neon` | Обновляет структуру Neon и мигрирует plaintext-пароли | При изменениях в `schema.prisma` или auth/password логике (для Vercel) |
| `npx prisma db push` | Синхронизирует SQLite с кодом | При изменениях в `schema.prisma` (для VPS) |
| `npm run migrate:passwords` | Переводит старые plaintext-пароли в `scrypt$...` | После обновления VPS с существующей SQLite-базой |
| `pm2 restart [name]` | Перезапускает работающее приложение | После сборки (`build`) на VPS |
