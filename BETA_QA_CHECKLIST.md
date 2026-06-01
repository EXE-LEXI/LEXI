# LEXI Closed Beta QA Checklist

Muc tieu: xac nhan ban beta co the cho nhom nguoi dung nho su dung ma khong vo cac luong chinh.

## Test Setup

- Backend dang chay voi database beta/staging.
- Frontend tro dung `VITE_API_BASE_URL` cua backend beta/staging.
- Co it nhat 1 tai khoan learner va 1 tai khoan admin.
- Database co noi dung da seed: categories, modules, lessons, questions, legal sources, badges, challenges.
- Trinh duyet test: Chrome desktop, mobile viewport 390px, tablet viewport 768px.

## Public/Auth

- Landing page render dung va co legal disclaimer.
- Register thanh cong voi email moi.
- Register duplicate email tra loi loi ro rang.
- Login thanh cong voi learner.
- Login sai mat khau tra loi loi ro rang.
- Forgot password mo reset panel, request reset token thanh cong tren beta/staging.
- Reset password bang token thanh cong, mat khau cu khong dang nhap duoc nua.
- Reset token da dung khong dung lai duoc.
- Social login hien beta notice, khong popup.
- Logout xoa session va ve login.
- Refresh page khi da login van khoi phuc session hoac bat login lai neu token het han.

## Learner Core Flow

- Dashboard load summary, current lesson, challenge, badges, leaderboard preview.
- Modules page load categories/modules.
- Filter category khong lam mat danh sach ngoai y muon.
- Mo lesson tu module thanh cong.
- Lesson co legal disclaimer chung va metadata nguon neu backend co du lieu.
- Video/source button mo URL that neu co, hien beta notice neu chua co.
- Them note trong lesson thanh cong va note ton tai sau reload.
- Export notes tao file `.txt` khi co note.
- Dang cau hoi Q&A trong lesson thanh cong va ton tai sau reload.
- Lam quiz du cau hoi.
- Submit quiz thanh cong, co score va giai thich.
- History hien attempt moi.
- Attempt detail hien dung/sai, dap an da chon, dap an dung va explanation.
- Review page load mistakes/recommendations.
- Leaderboard load weekly data va highlight current user.

## Resources/Notifications

- Resources load legal sources tu backend.
- Search resources co ket qua hoac empty state ro rang.
- Mo chi tiet/legal source khong crash.
- Notifications inbox load du lieu.
- Mark notification read thanh cong.
- Mark all read thanh cong.
- Dismiss notification thanh cong neu route backend ho tro.

## Rewards/Coins

- Hoan thanh quiz lan dau dat tu 60 diem duoc cong Legal Coins.
- Lam lai cung bai hoc khong farm duoc coin qua nguong da nhan.
- Quiz dat 100 diem co bonus coin neu truoc do chua tung dat 100.
- Game hoan thanh goi claim reward va cap nhat so du backend.
- Game reward bi gioi han daily cap, vuot cap hien notice ro rang.
- Trang `/rewards` hien so du, lifetime earned/spent, ledger va rule tich diem.
- Voucher section hien trang thai sap ra mat, khong cho doi voucher that trong beta.
- Khi co `VoucherCampaign` ACTIVE, `/rewards` hien voucher tu backend.
- Doi voucher tru coin qua ledger `REDEMPTION`, tao `VoucherRedemption` va giam stock neu co.
- Khong doi duoc voucher neu thieu coin, het stock hoac da doi campaign do.
- Admin tab Vouchers tao campaign DRAFT thanh cong.
- Admin tab Vouchers chuyen campaign sang ACTIVE va user thay tren `/rewards`.
- Admin tab Vouchers fulfill redemption PENDING bang ma voucher va status thanh FULFILLED.
- Admin tab Vouchers cancel redemption PENDING khi can ho tro thu cong.

## Feedback/Report Content

- Legal disclaimer trong app co nut Report content.
- Bam Report content tu lesson/resources se mo `/feedback` va dien san related page.
- Gui report category `LEGAL_CORRECTION` thanh cong.
- Report subject/message validate min/max va hien loi ro rang khi thieu du lieu.
- Sau khi submit co reference ID.
- Admin API `GET /admin/feedback-reports` tra ve report moi.
- Admin API `PATCH /admin/feedback-reports/:reportId/status` update status thanh cong.
- Admin Feedback tab hien report moi, loc duoc theo category/status.
- Admin Feedback tab cap nhat status `OPEN`, `REVIEWING`, `RESOLVED`, `DISMISSED` thanh cong va khong dung popup.

## Community Beta

- Community page co beta notice noi ro du lieu chi luu trong phien hien tai.
- Tao post moi hien tren feed.
- Like/comment/toggle solved khong crash.
- Reload page: post local co the mat, notice beta da giai thich ro.
- Khong co noi dung nao khang dinh day la tu van phap ly chinh thuc.

## Subscription Beta

- Subscription page co beta notice noi ro checkout chua live.
- Basic CTA dieu huong den modules.
- Pro/Premium CTA mo waitlist modal.
- Submit waitlist email hien success state.
- Khong co noi nao thu tien that khi chua co payment backend.

## Admin

- Learner khong vao duoc `/admin`.
- Admin vao duoc admin dashboard.
- Sources: list/create/update/delete source thanh cong.
- AI Drafts: generate/review/update/create lesson tu draft thanh cong.
- Lessons: list va edit lesson metadata thanh cong.
- Quiz questions: list/create/update/delete question thanh cong.
- Delete question hien notice inline, khong popup.
- Admin users load data that.
- Media tab list/create/attach video asset neu backend ho tro.
- Logs tab load delivery logs.
- Admin thao tac sources/media/quiz/settings hien notice/error inline, khong dung browser alert.
- Vouchers tab load campaign/redemption va tao campaign moi thanh cong.

## Responsive/UX

- Mobile: top nav khong overlap content.
- Mobile: lesson quiz option text khong tran khoi nut.
- Mobile: community composer va subscription cards khong bi ngang trang.
- Desktop: admin layout khong bi che boi sidebar/header.
- Tat ca page co loading/error/empty state chap nhan duoc.

## Release Decision

Closed beta chi pass khi:

- Frontend build pass.
- Backend test pass.
- Khong con `alert(` trong `frontend/src`.
- Khong co route chinh nao render trang trang hoac crash.
- Cac tinh nang chua that deu co notice beta ro rang.
- Noi dung phap ly beta da duoc review boi nguoi phu trach noi dung.
