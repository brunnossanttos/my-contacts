# My Contacts — REST API (NestJS + TypeORM + MySQL)

A fully RESTful API for managing a contact list, built with **NestJS 11**, **TypeORM**, and **MySQL**.
Designed with clean architecture principles, including layered modules, input validation, and automated testing.

---

## Table of Contents

* [Prerequisites](#prerequisites)
* [Installation](#installation)
* [Environment Setup](#environment-setup)
* [Running the App](#running-the-app)
* [Database Setup (MySQL)](#database-setup-mysql)
* [Available npm Scripts](#available-npm-scripts)
* [API Overview](#api-overview)
* [Testing](#testing)
* [Linting & Formatting](#linting--formatting)
* [Troubleshooting](#troubleshooting)
* [Migrations (Optional for Prod)](#migrations-optional-for-prod)
* [Documentation](#documentation)

---

## Prerequisites

* **Node.js**: v18+ (recommended v20 LTS)
* **npm**: v9+ (bundled with Node)
* **MySQL**: 5.7+ (recommended 8.0+) running locally
* **Git** (optional)

---

## Installation

```bash
git clone https://github.com/brunnossanttos/my-contacts.git
cd my-contacts
npm install
```

---

## Environment Setup

Copy the example environment file and adjust values for your local MySQL:

```bash
cp env.example .env
```

`.env` fields:

```ini
DATABASE_TYPE=mysql
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USERNAME=user
DATABASE_PASSWORD=password
DATABASE_NAME=db_name
DATABASE_SYNCHRONIZE=true
```

> **Notes**
>
> * `DATABASE_SYNCHRONIZE=true` lets TypeORM auto-create/update tables in development.
>   In production, **set this to `false`** and use migrations instead.
> * Create the database before starting the app:
>
>   ```sql
>   CREATE DATABASE db_name CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
>   ```

---

## Running the App

### Development (watch mode)

```bash
npm run start:dev
```

> The server will start on the port configured in your Nest bootstrap (usually `http://localhost:3000`).

### Production build

```bash
npm run build
npm run start:prod
```

---

## Database Setup (MySQL)

Ensure your local MySQL is running and the credentials in `.env` are valid. If needed:

```sql
CREATE USER 'user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON db_name.* TO 'user'@'localhost';
FLUSH PRIVILEGES;
```

### Common MySQL Gotchas

* **“Invalid default value for 'createdAt'”**
  Use TypeORM’s date columns without custom defaults:

  ```ts
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
  ```

  On older MySQL/strict modes, manually setting `DEFAULT CURRENT_TIMESTAMP` on these columns can cause errors.

* **Timezone**
  If timestamps look off, consider setting the server/session time zone:

  ```sql
  SET time_zone = '+00:00';
  ```

---

## Available npm Scripts

From `package.json`:

* `npm run start` — start Nest
* `npm run start:dev` — start with watch (dev)
* `npm run start:debug` — start with debug + watch
* `npm run start:prod` — run compiled app (`dist`)
* `npm run build` — compile TypeScript
* `npm run lint` — ESLint (with `--fix`)
* `npm run format` — Prettier
* `npm test` — unit tests
* `npm run test:watch` — watch mode tests
* `npm run test:cov` — test coverage
* `npm run test:debug` — run Jest in debug mode
* `npm run test:e2e` — e2e tests (if configured)

---

## API Overview

Base path (typical): `http://localhost:3000/contacts`

### Create

```
POST /contacts
Content-Type: application/json

{
  "name": "Bruno Santos",
  "cellphone": "11999999999"
}
```

### Read One

```
GET /contacts/:id
```

### Read Many (filters + pagination)

```
GET /contacts?name=bru&cellphone=1199&page=1&limit=30
```

### Update

```
PATCH /contacts/:id
Content-Type: application/json

{
  "name": "New Name",
  "cellphone": "11998887777"
}
```

### Delete

```
DELETE /contacts/:id
```

> Recommended to return **204 No Content** (no response body).

> The `cellphone` field is **unique**. Creating/updating to a duplicate will fail at the DB layer.

---

## Testing

### Unit Tests

```bash
npm test
# or
npm run test:watch
```

### Coverage

```bash
npm run test:cov
```

> Uses **Jest** + **ts-jest**. Unit tests live under `src/**/*.spec.ts`.

---

## Linting & Formatting

```bash
npm run lint
npm run format
```

* ESLint 9 + TypeScript ESLint 8
* Prettier 3

---

## Troubleshooting

* **Unable to connect to DB / ECONNREFUSED**

  * Verify MySQL is running at `DATABASE_HOST:PORT`.
  * Check username/password and that the DB exists.

* **`Invalid default value for 'createdAt'`**

  * Remove manual `default` and `type` overrides from `@CreateDateColumn` / `@UpdateDateColumn` (see [Database Setup](#database-setup-mysql)).

* **Unique constraint on `cellphone`**

  * MySQL error `ER_DUP_ENTRY`. Map to HTTP 409 (Conflict) in the service layer if desired.

* **`synchronize` altering tables unexpectedly**

  * Disable `DATABASE_SYNCHRONIZE` and switch to migrations in non-dev environments.

---

## Migrations (Optional for Prod)

If you disable `synchronize`, add migration scripts and generate/apply them:

```bash
# example commands (adjust paths to your DataSource)
npx typeorm migration:generate -d src/database/data-source.ts src/migrations/Init
npx typeorm migration:run -d src/database/data-source.ts
```

> Ensure your `DataSource` reads `.env` and matches the settings above.

---

## Documentation

* Documentation can be accessed at:
```bash
http://localhost:3000/docs

```

## 🔍 Tech Highlights

- **NestJS 11** — Modular, strongly-typed backend framework
- **TypeORM** — Repository pattern and entity mapping to MySQL
- **ValidationPipe** — Input validation using `class-validator` and `class-transformer`
- **Swagger (OpenAPI)** — Interactive API docs at `/docs`
- **Exception Filters** — Consistent error handling (HTTPException)
- **Jest + Supertest** — Unit and E2E tests
- **ESLint + Prettier** — Clean, standardized code style
