# LEXI Deployment Readiness Checklist

Muc tieu: chuan bi moi truong staging/production cho closed beta.

## Environment

- `NODE_ENV=production` tren backend production.
- `PORT` duoc cau hinh ro.
- `MONGODB_URI` tro den database production/staging rieng, khong dung database local.
- `JWT_ACCESS_SECRET` va `JWT_REFRESH_SECRET` du manh, khac nhau giua staging/production.
- `CORS_ORIGINS` chi gom domain frontend hop le.
- `VITE_API_BASE_URL` tren frontend tro den backend dung moi truong.
- Email delivery provider duoc cau hinh truoc public beta neu dung password reset production.
- Khong deploy file `.env` local hoac secret demo len public repository.

## Database

- MongoDB replica set hoat dong.
- Da chay `npx prisma db push` cho moi truong moi.
- Sau thay doi feedback/reset password, database co collections `password_reset_tokens` va `feedback_reports`.
- Sau thay doi rewards, database co collections `reward_accounts`, `reward_ledger_entries` va `reward_rules`.
- Sau thay doi voucher, database co collections `voucher_campaigns` va `voucher_redemptions`.
- Seed beta data da kiem tra khong chua secret hoac noi dung placeholder nguy hiem.
- Co admin account van hanh rieng, doi password sau seed.
- Co backup schedule hang ngay.
- Co huong dan restore backup toi moi truong staging.

## Backend

- `npm run build` pass.
- `npm run test` pass.
- Swagger bi an tren production theo `NODE_ENV=production`.
- Security headers middleware hoat dong.
- Validation pipe bat `whitelist` va `forbidNonWhitelisted`.
- Auth refresh token rotation pass.
- Password reset token mot-lan pass va reset xong revoke refresh token cu.
- Admin routes bat JWT + role guard.
- Notification worker da cau hinh Firebase hoac bi vo hieu hoa ro rang neu chua dung push.

## Frontend

- `npm run build` pass.
- Bundle production duoc deploy tu `frontend/dist`.
- Public assets can thiet ton tai trong `frontend/public`.
- App tro dung API base URL.
- Khong con `alert(` trong `frontend/src`.
- Cac tinh nang beta chua live co notice ro rang.

## Legal/Product Safety

- Legal disclaimer hien tren landing va app sau dang nhap.
- Terms of service va privacy policy co noi dung toi thieu truoc public beta.
- Moi lesson published co:
  - `sourceTitle`
  - `sourceUrl` hoac nguon noi bo co the truy vet
  - `legalDocumentNo`
  - `effectiveDate`
  - `reviewedAt`
  - `reviewStatus=PUBLISHED`
- Admin khong publish lesson neu thieu metadata nguon.
- Co quy trinh sua/thu hoi noi dung sai.

## Operations

- Co staging URL va production URL rieng.
- Co runbook deploy:
  - build backend
  - deploy backend
  - run db push/migration step
  - build frontend
  - deploy frontend
  - smoke test
- Co rollback step cho frontend va backend.
- Co noi luu log backend.
- Co canh bao khi backend down hoac MongoDB khong ket noi.
- Co kenh tiep nhan bug report tu beta users.

## Smoke Test After Deploy

- GET backend health/root endpoint hoac Swagger dev endpoint tren staging.
- Register learner moi.
- Login learner.
- Request password reset tren staging va reset bang token thanh cong.
- Submit feedback report va admin list/update report status thanh cong.
- Load dashboard.
- Open module and lesson.
- Submit quiz.
- View history and attempt detail.
- Login admin.
- Admin list legal sources.
- Admin edit lesson metadata.
- Frontend refresh tren route nested khong 404 tai host.

## Go/No-Go

Go closed beta khi:

- Tat ca muc P0 trong `PRODUCT_LAUNCH_PLAN.md` done.
- Tat ca smoke test deploy pass.
- Backup da chay thu it nhat 1 lan.
- Co nguoi truc noi dung phap ly va nguoi truc ky thuat trong 48 gio dau.
