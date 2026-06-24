# СпортПортал

Веб-платформа для управления спортивным клубом: секции, посещаемость, соревнования
и судейство — в одном месте. Для спортсменов, тренеров, судей и администраторов.

Полностью контейнеризирована: поднимается одной командой `docker compose up`.
Сайт вы можете посмотреть по этой ссылке: https://github.com/Mustardfx/Diploma-Front-Back-
---

## Содержание

- [Возможности](#возможности)
- [Роли](#роли)
- [Технологии](#технологии)
- [Быстрый старт (Docker)](#быстрый-старт-docker)
- [Переменные окружения](#переменные-окружения)
- [Первый вход и админ](#первый-вход-и-админ)
- [Структура проекта](#структура-проекта)
- [API](#api)
- [Темы оформления](#темы-оформления)
- [Почта и сброс пароля](#почта-и-сброс-пароля)
- [Локальная разработка без Docker](#локальная-разработка-без-docker)
- [Частые проблемы](#частые-проблемы)

---

## Возможности

- **Секции** — каталог с расписанием, ценой, лимитом мест и онлайн-записью.
- **Записи и посещаемость** — тренеры отмечают присутствие, начисляют баллы за занятия.
- **Статистика посещаемости** — сводка за период (месяц/3 мес/полгода/год или произвольный
  диапазон) с графиком по месяцам; для админа — по всем секциям, для тренера — по своим.
- **Соревнования** — создание турниров с категориями, регистрация участников,
  модерация заявок.
- **Судейство** — ввод мест и баллов, формирование итоговых результатов.
- **Рейтинг** — лидерборд по баллам за занятия.
- **Пользователи и роли** — создание, удаление, смена ролей (для админа).
- **Аутентификация** — JWT, регистрация, вход, сброс пароля по email.
- **Темы оформления** — тёмная, светлая и космическая (с анимированными частицами).

## Роли

| Роль | Возможности |
|------|-------------|
| **Спортсмен** (`athlete`) | Запись на секции, заявки на соревнования, личная статистика |
| **Тренер** (`coach`) | Управление своими секциями, отметка посещаемости, баллы за занятия |
| **Судья** (`judge`) | Судейская панель, ввод результатов соревнований |
| **Администратор** (`admin`) | Полный доступ: пользователи, все секции и турниры, общая аналитика |

## Технологии

**Бэкенд**
- [NestJS 11](https://nestjs.com/) + TypeScript
- [TypeORM 0.3](https://typeorm.io/) + PostgreSQL 16
- JWT-аутентификация, валидация через `class-validator`
- Nodemailer (письма для сброса пароля)

**Фронтенд**
- [React 19](https://react.dev/) + TypeScript + [Vite 6](https://vite.dev/)
- [React Router 7](https://reactrouter.com/), Axios
- [Tailwind CSS 3](https://tailwindcss.com/)

**Инфраструктура**
- Docker / Docker Compose (3 сервиса: БД, бэкенд, фронтенд)

---

## Быстрый старт (Docker)

Требуется только **Docker Desktop** (или Docker Engine + Compose).

```bash
# 1. Клонировать репозиторий
git clone https://github.com/Mustardfx/Diploma-Front-Back-.git
cd Diploma-Front-Back-

# 2. Создать .env из примера (дефолты уже рабочие для локального запуска)
cp .env.example .env            # Windows PowerShell: copy .env.example .env

# 3. Поднять всё
docker compose up --build
```

После старта:

| Сервис | URL |
|--------|-----|
| Фронтенд | http://localhost:5173 |
| Бэкенд (API) | http://localhost:8080 |
| PostgreSQL | localhost:5432 |

Бэкенд при старте автоматически выполняет миграции и сид (`migration:run && seed`).
Первый запуск дольше — Docker качает образы и собирает; последующие — быстро.

Остановить: `docker compose down` (данные БД сохраняются в volume `sportportal-db_data`).

---

## Переменные окружения

Все переменные — в корневом `.env` (см. `.env.example`). Для локального запуска
менять обязательно ничего не нужно, кроме почты (опционально).

| Переменная | Назначение |
|------------|-----------|
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` | Подключение к PostgreSQL |
| `JWT_SECRET` | Секрет для подписи JWT (смените на проде) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | SMTP для писем сброса пароля (опционально) |
| `APP_URL` | Базовый URL фронтенда для ссылок в письмах |

> ⚠️ `.env` в `.gitignore` — реальные секреты (пароли, SMTP App Password) в репозиторий не попадают.

---

## Первый вход и админ

Сид создаёт демо-секции, **но не создаёт пользователей**. Первый зарегистрированный
пользователь получает роль `athlete`. Чтобы получить доступ к админке, повысьте роль
в БД:

```bash
docker compose exec sportportal-db \
  psql -U postgres -d sportportal \
  -c "UPDATE users SET role='admin' WHERE email='ваш@email';"
```

После смены роли **выйдите и войдите заново** — роль зашивается в JWT при входе.

---

## Структура проекта

```
.
├── docker-compose.yml          # БД + бэкенд + фронтенд
├── .env.example                # шаблон переменных окружения
├── sportportal-backend/        # NestJS API
│   └── src/
│       ├── auth/               # регистрация, вход, сброс пароля (JWT)
│       ├── users/              # пользователи и роли
│       ├── sections/           # секции
│       ├── enrollments/        # записи на секции
│       ├── attendance/         # посещаемость + статистика
│       ├── competitions/       # соревнования
│       ├── registrations/      # заявки на соревнования
│       ├── results/            # результаты, баллы, рейтинг
│       ├── stats/              # публичная статистика (лендинг)
│       ├── mail/               # отправка писем
│       ├── common/             # гарды, декораторы, enum'ы
│       └── db/                 # data-source, миграции, сидеры
└── frontend/                   # React + Vite SPA
    └── src/
        ├── pages/              # страницы (по ролям и разделам)
        ├── components/         # переиспользуемые компоненты, layout
        ├── context/            # Auth и Theme контексты
        ├── services/           # API-клиенты (axios)
        └── types/              # общие типы
```

---

## API

База: `http://localhost:8080`. Все маршруты, кроме `/auth/*` и `/stats/public`,
требуют заголовок `Authorization: Bearer <token>`.

<details>
<summary><b>Аутентификация</b></summary>

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/auth/register` | Регистрация (роль `athlete`) |
| POST | `/auth/login` | Вход, возвращает JWT |
| POST | `/auth/forgot-password` | Письмо со ссылкой сброса |
| POST | `/auth/reset-password` | Сброс по токену из письма |
| POST | `/auth/change-password` | Смена пароля авторизованным |
</details>

<details>
<summary><b>Пользователи</b> (admin)</summary>

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/users` | Список (admin) |
| POST | `/users` | Создать (admin) |
| GET | `/users/me` | Текущий пользователь |
| PATCH | `/users/:id` | Обновить профиль |
| PATCH | `/users/:id/role` | Сменить роль (admin) |
| DELETE | `/users/:id` | Удалить (admin) |
</details>

<details>
<summary><b>Секции и записи</b></summary>

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/sections` · `/sections/my` · `/sections/:id` | Список / свои / по id |
| POST · PATCH · DELETE | `/sections` · `/sections/:id` | CRUD (coach/admin) |
| GET | `/enrollments` · `/enrollments/my` · `/enrollments/section/:id` | Записи |
| POST | `/enrollments` | Записаться (athlete) |
| PATCH | `/enrollments/:id/cancel` | Отменить запись |
</details>

<details>
<summary><b>Посещаемость</b></summary>

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/attendance?sectionId=&date=` | Отметки секции на дату |
| GET | `/attendance/overview?from=&to=&sectionId=` | Сводная статистика за период |
| GET | `/attendance/stats/:userId/:sectionId` | Статистика участника |
| POST | `/attendance/mark` | Сохранить отметки |
</details>

<details>
<summary><b>Соревнования, заявки, результаты</b></summary>

| Метод | Путь | Описание |
|-------|------|----------|
| GET · POST · PATCH · DELETE | `/competitions` · `/competitions/:id` | CRUD соревнований |
| GET | `/registrations` · `/registrations/my` · `/registrations/competition/:id` | Заявки |
| POST | `/registrations` | Подать заявку |
| PATCH | `/registrations/:id/withdraw` · `/:id/status` | Отозвать / модерация |
| GET | `/results/competition/:id` · `/results/user/:id` | Результаты |
| POST · DELETE | `/results` · `/results/:id` | Ввод / удаление результата |
| POST | `/results/lesson` | Баллы за занятие |
| GET | `/results/leaderboard` · `/results/leaderboard/section/:id` | Рейтинг |
</details>

<details>
<summary><b>Публичная статистика</b></summary>

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/stats/public` | Счётчики для лендинга (без авторизации) |
</details>

---

## Темы оформления

В личном профиле можно переключать тему: **Тёмная**, **Светлая** и **Космос**
(анимированный звёздный фон на canvas + светящиеся элементы). Выбор сохраняется
в `localStorage` и применяется ко всему приложению.

## Почта и сброс пароля

Сброс пароля работает через SMTP. Если SMTP не настроен (`SMTP_HOST`/`SMTP_USER`
пустые), запрос всё равно отвечает успехом, а ссылка для сброса **пишется в логи
бэкенда** (`docker compose logs sportportal-backend`) — удобно для локальной отладки.

Для Gmail: включите 2FA и создайте [App Password](https://myaccount.google.com/apppasswords),
впишите его в `SMTP_PASS`.

---

## Локальная разработка без Docker

<details>
<summary>Показать</summary>

Нужны Node.js 18+ и запущенный PostgreSQL.

```bash
# Бэкенд
cd sportportal-backend
npm install
npm run migration:run
npm run seed
npm run start:dev          # http://localhost:8080

# Фронтенд (в отдельном терминале)
cd frontend
npm install
npm run dev                # http://localhost:5173
```

> При работе в Docker меняйте код как обычно — фронт перезагружается сам;
> бэкенд внутри контейнера иногда не видит изменения файлов на Windows-volume,
> тогда помогает `docker compose restart sportportal-backend`.
</details>

---

## Частые проблемы

**`Cannot find module '../mail/mail.module'` при старте бэкенда**
Устаревший кэш сборки. Удалите его и пересоберите:
```bash
rm -rf sportportal-backend/dist sportportal-backend/tsconfig.tsbuildinfo
docker compose up --build --force-recreate
```

**«Доступ запрещён» у админа на admin-функции**
Роль в JWT устарела (повышена в БД уже после входа). **Выйдите и войдите заново.**

**`failed to connect to the docker API`**
Не запущен Docker Desktop — запустите его и повторите команду.

**Простыня ошибок про порты (5173 / 8080 / 5432 заняты)**
Остановите процессы на этих портах или измените порты в `docker-compose.yml`.
