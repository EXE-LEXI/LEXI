# LEXI Backend

Backend API cho LEXI, ung dung hoc phap luat theo huong gamification. Backend hien dung NestJS, Prisma, MongoDB va JWT authentication.

## 1. Tech Stack

- Framework: NestJS
- Language: TypeScript
- Database: MongoDB
- ORM: Prisma
- Auth: JWT access token + refresh token
- Validation: class-validator, class-transformer
- Password hashing: bcrypt
- API docs: Swagger

## 2. Cai Dat Va Chay Local

```bash
cd backend
npm install
```

Tao file `.env` tu `.env.example`, sau do cap nhat cac bien chinh:

```env
MONGODB_URI="mongodb+srv://USER:PASSWORD@HOST/Lexi"
PORT=3000
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
JWT_SECRET=change_me
JWT_REFRESH_SECRET=change_me
```

Firebase Admin credential co the cau hinh bang secret/env. Thu tu uu tien backend dang dung:

```env
FIREBASE_SERVICE_ACCOUNT_JSON='{"project_id":"...","client_email":"...","private_key":"-----BEGIN PRIVATE KEY-----\\n..."}'
# hoac
FCM_PROJECT_ID=...
FCM_CLIENT_EMAIL=...
FCM_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n..."
# hoac
FIREBASE_SERVICE_ACCOUNT_PATH=/run/secrets/firebase-service-account.json
```

Neu khong co env nao, local dev se fallback sang `backend/firebase-service-account.json`. File nay khong nen commit len repo.

Chay migration va generate Prisma Client:

```bash
npx prisma db push
npx prisma generate
```

Seed data mau:

```bash
npx prisma db seed
```

Chay server dev:

```bash
npm run start:dev
```

Build va chay production:

```bash
npm run build
npm run start:prod
```

Chay test:

```bash
npm test
```

Swagger local:

```text
http://localhost:3000/api
```

## 3. Cau Truc Thu Muc

```text
backend/
|-- prisma/
|   |-- schema.prisma
|   `-- migrations/
|-- src/
|   |-- main.ts
|   |-- app.module.ts
|   |-- common/
|   |   |-- decorators/
|   |   |-- filters/
|   |   |-- guards/
|   |   |-- interceptors/
|   |   `-- middleware/
|   |-- config/
|   |   `-- env.validation.ts
|   |-- core/
|   |   |-- prisma.module.ts
|   |   `-- prisma.service.ts
|   `-- modules/
|       |-- auth/
|       |-- users/
|       `-- learning/
|           |-- categories/
|           |-- modules/
|           |-- lessons/
|           |-- progress/
|           `-- review/
|-- test/
|-- .env
|-- package.json
`-- tsconfig.json
```

## 4. Module Convention

Backend da duoc refactor theo feature module + layered structure. Moi feature nen giu cung mot format:

```text
feature/
|-- constants/       # hang so nghiep vu, default limit, token expiry
|-- controllers/     # nhan HTTP request, giu mong
|-- dto/
|   |-- request/     # DTO validate input bang class-validator
|   `-- response/    # DTO mo ta response contract
|-- entities/        # domain/read model neu can, khong phai TypeORM entity
|-- enums/           # enum rieng cua feature neu co
|-- interfaces/      # contract/type dung noi bo
|-- mappers/         # map Prisma/domain data sang response DTO
|-- repositories/    # Prisma query va persistence
|-- services/        # business logic/use-case orchestration
|-- validators/      # custom validators neu can
`-- feature.module.ts
```

Vi du `progress`:

```text
src/modules/learning/progress/
|-- constants/progress.constants.ts
|-- controllers/progress.controller.ts
|-- dto/
|   |-- request/get-learning-history-query.dto.ts
|   `-- response/
|       |-- attempt-detail-response.dto.ts
|       |-- learning-history-response.dto.ts
|       `-- progress-summary-response.dto.ts
|-- entities/
|-- enums/
|-- interfaces/
|-- mappers/progress.mapper.ts
|-- repositories/progress.repository.ts
|-- services/progress.service.ts
|-- validators/
`-- progress.module.ts
```

## 5. Refactor Notes

- Prisma `schema.prisma` la source of truth cho database model.
- Khong dung TypeORM entity. Folder `entities/` chi de domain/read model neu can.
- Controller chi nhan request, lay current user, validate DTO va goi service.
- Service chua business logic/use-case orchestration.
- Repository chiu trach nhiem Prisma query va persistence.
- Mapper chiu trach nhiem chuyen data sang response DTO.
- Request DTO nam trong `dto/request`.
- Response DTO nam trong `dto/response`.
- Cac file cu nhu `progress/progress.controller.ts`, `progress/progress.service.ts`, `progress/progress.repository.ts` da duoc chuyen vao `controllers/`, `services/`, `repositories/`.

## 6. Backend Hardening

- `ConfigModule` dung `validateEnv` de bat buoc cac bien `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET` va validate `PORT`.
- Production yeu cau `JWT_SECRET` va `JWT_REFRESH_SECRET` toi thieu 32 ky tu.
- `main.ts` cau hinh CORS tu `CORS_ORIGINS`; neu production khong khai bao origin thi CORS se bi tat.
- Swagger chi bat khi `NODE_ENV` khac `production`.
- `securityHeadersMiddleware` them cac security headers co ban.
- `HttpExceptionFilter` chuan hoa error response voi `success: false`, `statusCode`, `error`, `message`, `path`, `timestamp`.
- `ResponseTransformInterceptor` chuan hoa success response voi `success: true`, `data`, `message`.
- `RequestLoggingInterceptor` log method, URL va thoi gian xu ly request.
- `RateLimitGuard` + `@RateLimit()` bao ve cac endpoint nhay cam trong auth: register, login, refresh.
- Express `trust proxy` duoc bat de doc IP dung hon khi deploy sau reverse proxy.

## 7. Pagination Contract

List API chinh tra ve format:

```json
{
  "items": [],
  "meta": {
    "total": 0,
    "page": 1,
    "limit": 20,
    "totalPages": 0,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

Dang ap dung cho:

- `GET /modules`
- `GET /progress/me/history`
- `GET /review/mistakes`

## 8. API Chinh

Tat ca API learning, progress va review ben duoi can Bearer JWT.

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

### Users

- `GET /users/me`
- `PATCH /users/me`
- `PATCH /users/me/password`

### Learning

- `GET /categories` - JWT required
- `GET /modules?categoryId=...&page=1&limit=20` - JWT required
- `GET /lessons/:id` - JWT required
- `POST /lessons/:id/submit` - JWT required

### Progress

- `GET /progress/me/summary` - JWT required
- `GET /progress/me/current` - JWT required
- `GET /progress/me/history?page=1&limit=30` - JWT required
- `GET /progress/me/history/:attemptId` - JWT required

### Review

- `GET /review/mistakes?page=1&limit=20` - JWT required

## 9. Verification Sau Refactor

Sau khi cap nhat cau truc backend va them hardening layer, da kiem tra:

```bash
npm run build
npm test
```

Ket qua hien tai: build pass va 20/20 backend tests pass.
