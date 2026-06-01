# LEXI Product Launch Plan

Muc tieu: dua LEXI tu trang thai beta candidate len ban co the mo cho nguoi dung that su dung co kiem soat.

## Launch Phases

### Phase 0 - Product Safety Gate

Trang thai mong muon: co the moi nhom nguoi dung nho vao dung thu ma khong tao rui ro phap ly/ky thuat qua lon.

- Sua toan bo build/test failure.
- Them disclaimer ro rang: LEXI la nen tang hoc tap phap luat pho thong, khong thay the tu van cua luat su.
- Dam bao bai hoc publish co nguon phap ly, so van ban, ngay hieu luc va trang thai review.
- Kiem tra cac flow chinh: register, login, dashboard, modules, lesson, quiz, history, review, resources, notifications.
- Loai bo hoac gan nhan ro cac flow chua that: payment, community, social login, forgot password.
- Chot seed/demo data cho beta va tai khoan admin van hanh.

Exit criteria:

- `frontend npm run build` pass.
- `backend npm run test` pass.
- Nguoi dung beta khong gap nut `alert` o luong hoc tap chinh.
- Moi noi dung phap ly public deu co dau vet nguon va disclaimer.

### Phase 1 - Closed Beta

Trang thai mong muon: 20-50 nguoi dung co the hoc, lam quiz, xem tien do, nhan thong bao va gui feedback.

- Tao checklist QA theo tung route.
- Them feedback/report issue trong UI.
- Luu community vao backend hoac tam thoi an community neu chua co moderation.
- Them reset password va email verification neu mo dang ky cong khai.
- Them monitoring loi frontend/backend.
- Sao luu MongoDB hang ngay.

Exit criteria:

- Co kenh tiep nhan feedback.
- Co log loi va backup.
- Co quy trinh rollback deploy.
- Co nguoi phu trach duyet noi dung truoc publish.

### Phase 2 - Public Beta

Trang thai mong muon: mo dang ky rong co gioi han, san sang sua loi nhanh.

- CI/CD tu dong build/test/deploy.
- Them rate limit/throttle cho auth va API nhay cam.
- Hoan thien privacy policy, terms of service, data deletion/export.
- Them analytics funnel: register, first lesson, first quiz, day-1/day-7 retention.
- Toi uu mobile responsive va performance.
- Chuan hoa email/notification template.

Exit criteria:

- Deployment production/staging tach biet.
- Co dashboard van hanh co ban.
- Co quy trinh cap nhat noi dung khi van ban phap luat thay doi.

### Phase 3 - Monetization

Trang thai mong muon: co the thu tien hop phap va cap quyen goi dung.

- Tich hop payment provider.
- Them subscription model, entitlement middleware va UI quan ly goi.
- Hoa don, huy goi, refund, lich su thanh toan.
- Gioi han feature theo goi Basic/Pro/Premium.
- Chinh sach gia, dieu khoan thanh toan, ho tro khach hang.

Exit criteria:

- Thanh toan test va webhook pass.
- Quyen loi goi duoc enforce o backend, khong chi an UI.
- Co luong ho tro khi thanh toan loi.

## Immediate Backlog

### P0

- Done: fix backend test failure o `ModulesMapper`.
- Done: them legal disclaimer vao public landing va authenticated layout.
- Done: thay dead-end `alert` trong login, lesson, shorts va admin bang notice inline hoac hanh vi that.
- Done: chay lai frontend build va backend test sau dot sua dau tien.
- Done: tao `BETA_QA_CHECKLIST.md` cho closed beta.
- Done: tao `DEPLOYMENT_READINESS_CHECKLIST.md` cho staging/production readiness.
- Done: gan nhan beta/waitlist cho Community va Subscription.
- Done: them forgot/reset password beta flow voi reset token mot-lan, het han va revoke refresh tokens cu.
- Done: them feedback/report content flow voi backend luu report va frontend `/feedback`.
- Done: them Admin Feedback tab de loc, xem va cap nhat trang thai feedback reports.
- Done: loai bo `alert(` con lai trong `frontend/src`, chuyen sang notice/error inline.
- Done: tao khung LEXI Rewards voi reward account, ledger, cong coin tu quiz/game va trang `/rewards`.
- Done: tao khung voucher campaign/redemption, API catalog/redeem va UI doi voucher dong theo backend.
- Done: them admin CMS tab `Vouchers` de tao/bat/tat campaign va fulfill/cancel redemption.
- Next: QA thu cong theo `BETA_QA_CHECKLIST.md`.
- Next: tich hop email delivery cho password reset truoc public beta/production.

### P1

- Backend cho community: posts, comments, vote/report, moderation.
- Email delivery cho forgot/reset password production.
- CI workflow build/test.
- Production env checklist.

### P2

- Payment/subscription backend.
- Voucher provider integration hoac quy trinh cap ma voucher tu doi tac.
- Frontend E2E smoke tests.
- Admin content audit trail.
- Legal content freshness job.
- User analytics.

## Release Checklist

- Security: CORS production, env secrets, rate limit, password policy, auth token rotation.
- Legal: disclaimer, terms, privacy, content review, source metadata, takedown/correction process.
- Data: backup, restore drill, seed production-safe data, no demo secret exposed.
- Operations: logs, monitoring, alerting, rollback, admin runbook.
- UX: no dead-end main CTAs, loading/error/empty states, mobile check.
- QA: build/test pass, smoke test pass, beta feedback loop ready.
