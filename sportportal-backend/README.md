# СпортПортал — Backend

REST API на **NestJS + TypeORM + PostgreSQL + JWT**.

## Стек
- NestJS 11
- TypeScript 5.7
- TypeORM 0.3 + PostgreSQL
- JWT аутентификация + bcrypt
- class-validator / class-transformer

## Быстрый старт

```bash
# 1. Установить зависимости
npm install

# 2. Создать .env из примера
cp .env.example .env
# Заполнить DB_HOST, DB_PASSWORD, JWT_SECRET и т.д.

# 3. Создать БД в PostgreSQL
createdb sportportal

# 4. Применить миграции
npm run migration:run

# 5. Запустить в режиме разработки
npm run start:dev
```

Сервер запускается на http://localhost:3000

## Структура модулей

| Модуль | Маршруты | Описание |
|--------|----------|----------|
| Auth | POST /auth/login, /auth/register, GET /auth/me | JWT аутентификация |
| Users | GET/PATCH/DELETE /users | Управление пользователями |
| Sections | GET/POST/PATCH/DELETE /sections | Спортивные секции |
| Enrollments | GET/POST/PATCH /enrollments | Запись на секции |
| Attendance | GET/POST /attendance | Посещаемость |
| Competitions | GET/POST/PATCH/DELETE /competitions | Соревнования |
| Registrations | GET/POST/PATCH /registrations | Регистрации на соревнования |
| Results | GET/POST/DELETE /results | Результаты соревнований |

## Роли

| Роль | Код |
|------|-----|
| Администратор | admin |
| Тренер | coach |
| Спортсмен | athlete |
| Судья | judge |

## Переменные окружения

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=sportportal
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
PORT=3000
```

## Миграции

```bash
npm run migration:generate -- src/db/migrations/MigrationName
npm run migration:run
npm run migration:revert
```

## Команды

```bash
npm run start:dev   # разработка (watch)
npm run start:prod  # production
npm run build       # сборка в dist/
npm run test        # unit тесты
npm run test:cov    # тесты с покрытием
```
