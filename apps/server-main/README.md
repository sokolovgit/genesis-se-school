# Running Guide for `server-main`

## 1. Clone the repository

```sh
git clone https://github.com/sokolovgit/genesis-se-school.git
cd genesis-se-school/apps/server-main
```

## 2. Install dependencies

```sh
pnpm install
```

## 3. Configure environment

- Copy `.env.example` to `.env` and fill in your secrets (DB, Redis, SMTP, etc):

```sh
cp .env.example .env
```

## 4. Start dependencies (PostgreSQL, Redis)

You can use Docker Compose from the root of the project:

```sh
docker-compose up
```

## 5. Run database migrations

Міграції виконуються автоматично при старті сервісу якщо відповідена змінна встановлена. Для ручного запуску:

```sh
pnpm run migration:run
```

## 6. Start the server

```sh
pnpm run dev
```

- Сервер буде доступний на `http://localhost:3000/api`
- Swagger: `http://localhost:3000/api/docs`
- Bullboard: `http://localhost:3000/api/queues`

---
