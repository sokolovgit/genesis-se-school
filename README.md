# Weather Forecast Subscription Service

## Опис

Цей сервіс дозволяє користувачам підписуватися на регулярні оновлення прогнозу погоди для обраного міста. Підтримується вибір частоти оновлень (щогодини або щодня). Сервіс реалізовано на базі NestJS (моноліт, DDD), з використанням сучасних технологій для черг, кешування, email-розсилки та деплою.

- **Демо HTML-сторінка**: [GitHub Pages](https://sokolovgit.github.io/genesis-se-school/)
- **API**: [https://weather-app-se5.fly.dev/api](https://weather-app-se5.fly.dev/api)
- **Swagger-документація**: [https://weather-app-se5.fly.dev/api/docs](https://weather-app-se5.fly.dev/api/docs)

## Архітектура

- **NestJS** (Monolith, Domain-Driven Design)
- **Domains**:
  - **emails** — розсилка email через BullMQ та SMTP (Mailersend)
  - **weather** — отримання погоди з [weatherapi.com](https://www.weatherapi.com/), кешування через Redis
  - **subscriptions** — підписки, токени підтвердження, черги оновлень

## Технології

- **PostgreSQL** (Supabase) — основна БД, міграції через TypeORM
- **Redis** (redis.io) — кешування погоди, черги BullMQ
- **BullMQ** — черги для email-розсилки та оновлень підписок
- **Mailersend** — SMTP для email
- **Fly.io** — деплой бекенду
- **GitHub Pages** — деплой фронтенду (HTML-форма підписки)
- **Docker/Docker Compose** — для локального запуску

## Основна логіка

- **Підписка**: Користувач надсилає email, місто та частоту. Якщо вже є активна підписка на це місто — повертається 409. Якщо підписка не підтверджена — можна повторно надіслати запит (отримати новий email з токеном).
- **Підтвердження**: Підтвердити підписку можна лише останнім токеном (захист від повторного використання старих посилань).
- **Оновлення погоди**: Для кожної частоти (hourly/daily) створюється repeatable job (BullMQ). Підписки обробляються чанками, для кожного користувача формуються email з погодою по всіх його містах. Jobs на додавання імейлів додаються Bulk add'ом.
- **Кешування**: Погода кешується в Redis для зменшення навантаження на зовнішній API.
- **Відписка**: За токеном з email можна відписатися від оновлень.

## API

Відповідає swagger-специфікації (див. [swagger.yaml](https://github.com/mykhailo-hrynko/se-school-5/blob/task-description/swagger.yaml)). Основні ендпоінти:

- `GET /api/weather?city=Kyiv` — поточна погода для міста
- `POST /api/subscribe` — підписка (email, city, frequency)
- `GET /api/confirm/:token` — підтвердження підписки
- `GET /api/unsubscribe/:token` — відписка

## Деплой

- **Frontend**: [https://sokolovgit.github.io/genesis-se-school/](https://sokolovgit.github.io/genesis-se-school/)
- **Backend**: [https://weather-app-se5.fly.dev/api](https://weather-app-se5.fly.dev/api)
- **PostgreSQL**: Supabase
- **Redis**: redis.io
- **SMTP**: Mailersend

## Запуск локально

```sh
docker-compose up

cd apps/server-main

pnpm install
pnpm run dev
```

## Особливості реалізації

- Користувач може мати декілька підписок на різні міста, але не може підписатися на одне місто двічі (незалежно від частоти).
- Можна повторно надіслати запит на підписку, якщо попередній email не отримано (буде новий токен).
- Для підтвердження підписки використовується лише останній токен.
- Вся логіка відповідає swagger-контракту.
- Міграції БД виконуються автоматично при старті сервісу.
- Кешування погоди зменшує кількість запитів до зовнішнього API.

## Додатково

- Код структуровано за DDD.
- Легко розширити email-розсилку (наприклад, додати шаблони).
- Використовується Bull Board для моніторингу черг.

---

**Автор:** [sokolovgit](https://github.com/sokolovgit)
