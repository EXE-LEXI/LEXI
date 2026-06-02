# LEXI Page Roadmap

Tài liệu này tổng hợp các trang còn thiếu hoặc chưa hoàn chỉnh của frontend LEXI, dựa trên routing hiện tại, page/component đã có và API backend đang tồn tại.

## Tổng Quan Hiện Trạng

Frontend hiện đã có các màn hình chính:

- Public: Landing, Login, Register.
- Người học: Dashboard, Modules, Lesson, Review, Settings, Profile, Resources, Shorts, Game.
- Admin: Admin dashboard dạng tab gồm Dashboard, Lessons, Quizzes, Users, Media, Logs, Settings.

Những khoảng trống chính:

- Có route hoặc menu nhưng chưa có page thật: Leaderboard, Learning History, Community.
- Backend đã có API nhưng frontend chưa nối đầy đủ: User profile/password, attempt detail, admin sources, admin AI drafts.
- Một số UI đang dùng mock data hoặc `alert`: Admin users, notification bell, upgrade Pro/Premium, lesson Q&A/notes, resources.

## Thứ Tự Ưu Tiên Đề Xuất

1. LeaderboardPage
2. LearningHistoryPage
3. AttemptDetailPage
4. AccountSettingsPage
5. AdminSourcesTab
6. AdminAiDraftsTab
7. NotificationCenterPage
8. CommunityPage
9. SubscriptionPage
10. Nâng cấp các tab mock thành dữ liệu thật

Lý do ưu tiên: các trang đầu đã có API backend sẵn hoặc route đã khai báo, nên triển khai ít rủi ro và tạo cảm giác sản phẩm hoàn chỉnh nhanh nhất.

---

## 1. LeaderboardPage

### Mục Tiêu

Tạo trang bảng xếp hạng tuần để người học xem vị trí của mình, top học viên và động lực cạnh tranh.

### Route

- Route đề xuất: `/leaderboard`
- `ROUTES.leaderboard` đã tồn tại trong `frontend/src/routes/paths.ts`
- Hiện `App.tsx` chưa render page này

### API Cần Dùng

- `GET /leaderboard/weekly`
- Frontend đã có hàm:
  - `getWeeklyLeaderboard(token)` trong `frontend/src/api/learning.ts`

### Dữ Liệu Chính

- `window.startAt`, `window.endAt`
- `items[]`
  - `rank`
  - `fullName`
  - `avatarUrl`
  - `xp`
  - `isCurrentUser`
- `currentUser`

### UI Chính

- Header:
  - Tên trang: "Bảng xếp hạng tuần"
  - Khoảng thời gian tuần hiện tại
  - Vị trí hiện tại của người dùng
- Top 3:
  - Hiển thị nổi bật 3 học viên dẫn đầu
  - Avatar, rank, tên, XP
- Bảng danh sách:
  - Rank
  - Học viên
  - XP tuần
  - Nhãn "Bạn" nếu là current user
- Empty state:
  - Chưa có dữ liệu xếp hạng
- Loading state:
  - Skeleton hoặc thông báo đang tải
- Error state:
  - Hiển thị lỗi từ API và nút thử lại

### Luồng Người Dùng

1. Người dùng mở `/leaderboard`.
2. App gọi `getWeeklyLeaderboard`.
3. Hiển thị top 3 và bảng đầy đủ.
4. Nếu current user không nằm trong top danh sách, hiển thị thêm một card "Vị trí của bạn".

### Việc Cần Làm

- Tạo `frontend/src/pages/LeaderboardPage.tsx`
- Thêm state `leaderboard` nếu muốn dùng dữ liệu đã load sẵn trong `App.tsx`
- Thêm nhánh render trong `frontend/src/app/App.tsx`
- Thêm link trong `AppLayout` hoặc sidebar các trang học viên
- Tái dùng type `WeeklyLeaderboard`
- Kiểm tra responsive desktop/mobile

### Tiêu Chí Hoàn Thành

- Truy cập `/leaderboard` không rơi vào `NotFoundPage`
- Hiển thị dữ liệu từ API thật
- Current user được highlight
- Có loading, error, empty state
- Link điều hướng hoạt động từ layout chính

---

## 2. LearningHistoryPage

### Mục Tiêu

Tạo trang lịch sử học tập để người dùng xem lại các lần học/làm quiz, điểm số và bài đã hoàn thành.

### Route

- Route đề xuất: `/history`
- Cần thêm vào `ROUTES`
- Hiện nhiều sidebar có mục "Lịch sử học" nhưng đang dùng `href="#history"`

### API Cần Dùng

- `GET /progress/me/history?page=1&limit=10`
- Frontend đã có:
  - `getLearningHistory(token, page, limit)` trong `frontend/src/api/learning.ts`

### Dữ Liệu Chính

- `id`
- `lessonId`
- `lessonTitle`
- `module.title`
- `category.title`
- `score`
- `correctAnswers`
- `wrongAnswers`
- `totalQuestions`
- `startedAt`
- `finishedAt`

### UI Chính

- Header:
  - "Lịch sử học tập"
  - Tổng quan số lượt học gần đây
- Filter:
  - Tìm theo tên bài học
  - Lọc theo danh mục
  - Lọc theo khoảng điểm: dưới 50, 50-80, trên 80
- Danh sách attempt:
  - Tên bài học
  - Module/category
  - Điểm
  - Số câu đúng/sai
  - Thời gian hoàn thành
  - Nút "Xem chi tiết"
- Pagination:
  - Trang trước/sau
  - Hiển thị tổng số bản ghi nếu API trả meta

### Luồng Người Dùng

1. Người dùng mở `/history`.
2. Trang tải lịch sử học trang đầu.
3. Người dùng lọc/tìm kiếm trong danh sách.
4. Bấm một attempt để vào trang chi tiết attempt.

### Việc Cần Làm

- Thêm `history: "/history"` vào `ROUTES`
- Tạo `frontend/src/pages/LearningHistoryPage.tsx`
- Thay các link `#history` trong sidebar thành `ROUTES.history`
- Thêm state history/pagination vào `App.tsx`, hoặc để page tự fetch nếu chuyển dần sang page-owned data
- Bổ sung API helper nếu cần lấy theo page/filter
- Thêm route render trong `App.tsx`

### Tiêu Chí Hoàn Thành

- Sidebar điều hướng được tới `/history`
- Trang hiển thị dữ liệu thật từ `/progress/me/history`
- Có phân trang
- Bấm attempt chuyển được sang trang chi tiết

---

## 3. AttemptDetailPage

### Mục Tiêu

Cho người dùng xem chi tiết một lần làm quiz: câu nào đúng/sai, đáp án đã chọn, đáp án đúng, giải thích và bài học liên quan.

### Route

- Route đề xuất: `/history/:attemptId`
- Cần thêm route parser trong `App.tsx`

### API Cần Dùng

- `GET /progress/me/history/:attemptId`
- Hiện frontend chưa có helper riêng

### Dữ Liệu Chính

Dữ liệu cụ thể phụ thuộc DTO backend, nhưng page nên chuẩn bị cho các nhóm:

- Attempt metadata:
  - attempt id
  - lesson title
  - module/category
  - score
  - startedAt/finishedAt
- Question results:
  - question text
  - selected option
  - correct option
  - isCorrect
  - explanation

### UI Chính

- Header:
  - Tên bài học
  - Điểm số
  - Thời gian hoàn thành
- Summary cards:
  - Tổng câu
  - Đúng
  - Sai
  - XP nếu có
- Danh sách câu hỏi:
  - Câu hỏi
  - Đáp án người dùng chọn
  - Đáp án đúng
  - Giải thích
  - Badge đúng/sai
- Actions:
  - "Ôn lại bài học"
  - "Làm lại quiz" nếu lesson page hỗ trợ
  - "Quay lại lịch sử"

### Việc Cần Làm

- Thêm type `AttemptDetail` trong `frontend/src/types/progress.ts`
- Thêm API helper `getLearningAttemptDetail(token, attemptId)`
- Tạo `frontend/src/pages/AttemptDetailPage.tsx`
- Thêm parser `attemptId` trong `App.tsx`
- Từ `LearningHistoryPage`, navigate tới `/history/${attempt.id}`

### Tiêu Chí Hoàn Thành

- Truy cập URL chi tiết bằng attempt id hoạt động
- Dữ liệu đúng/sai hiển thị rõ
- Có fallback nếu attempt không tồn tại hoặc không thuộc user

---

## 4. AccountSettingsPage

### Mục Tiêu

Tách phần cài đặt tài khoản khỏi cài đặt thông báo, cho phép người dùng cập nhật hồ sơ và đổi mật khẩu bằng API thật.

### Route

- Có thể dùng:
  - `/account`
  - hoặc mở rộng `/settings` thành nhiều tab
- Đề xuất: giữ `/settings` cho notification, thêm `/account` cho thông tin cá nhân và bảo mật

### API Cần Dùng

- `GET /users/me`
- `PATCH /users/me`
- `PATCH /users/me/password`

### Frontend Cần Thêm

- `frontend/src/api/users.ts`
  - `getMe(token)`
  - `updateMe(token, payload)`
  - `changePassword(token, payload)`
- Type request/response tương ứng

### UI Chính

- Tab hoặc section "Hồ sơ":
  - Họ tên
  - Avatar URL nếu backend hỗ trợ
  - Email readonly
  - Ngày tham gia
  - Nút lưu
- Section "Bảo mật":
  - Mật khẩu hiện tại
  - Mật khẩu mới
  - Xác nhận mật khẩu mới
  - Validation client-side
- Section "Tài khoản":
  - Vai trò
  - Trạng thái tài khoản nếu có
  - Nút đăng xuất

### Luồng Người Dùng

1. Người dùng mở `/account`.
2. Trang gọi `GET /users/me`.
3. Người dùng sửa họ tên và lưu.
4. Nếu lưu thành công, cập nhật session/local storage để tên mới hiện ở topbar/profile.
5. Người dùng đổi mật khẩu, hiển thị thành công hoặc lỗi validation.

### Việc Cần Làm

- Tạo `frontend/src/pages/AccountSettingsPage.tsx`
- Tạo `frontend/src/api/users.ts`
- Thêm `ROUTES.account`
- Cập nhật avatar/profile button hoặc settings link nếu cần
- Sửa `ProfilePage` để nút chỉnh sửa hồ sơ navigate tới `/account`, hoặc nối trực tiếp API nếu muốn giữ inline edit

### Tiêu Chí Hoàn Thành

- Cập nhật hồ sơ lưu thật vào backend
- Đổi mật khẩu gọi API thật
- Session hiển thị tên mới sau khi cập nhật
- Không còn chỉnh tên chỉ bằng state local trong profile

---

## 5. AdminSourcesTab

### Mục Tiêu

Cho admin quản lý nguồn pháp lý: tạo, sửa, xóa, xem trạng thái crawl/xử lý nguồn.

### Vị Trí UI

- Admin tab mới trong `AdminPage`
- Tên tab đề xuất: "Nguồn pháp lý"
- Có thể nằm giữa "Khóa học" và "Tài liệu & Media"

### API Cần Dùng

- `GET /admin/sources`
- `POST /admin/sources`
- `GET /admin/sources/:sourceId`
- `PATCH /admin/sources/:sourceId`
- `DELETE /admin/sources/:sourceId`

### Frontend Hiện Có

- `getAdminSources(token)` đã có trong `frontend/src/api/admin.ts`
- `AdminPage` đã nhận `sources`
- Nhưng chưa có tab riêng để quản lý `sources`

### UI Chính

- Header:
  - "Nguồn pháp lý"
  - Nút "Thêm nguồn"
- Filter:
  - Tìm theo title/documentNo
  - Lọc theo crawlStatus
- Table/list:
  - Title
  - Document No
  - Crawl status
  - Updated at
  - Actions: xem/sửa/xóa
- Drawer form:
  - Title
  - Document number
  - Source URL
  - Content/raw text nếu DTO hỗ trợ
  - Status
- Delete confirm modal

### Việc Cần Làm

- Mở rộng type `activeTab` trong `AdminPage`
- Thêm item vào `AdminSidebar`
- Tạo `frontend/src/components/admin/SourcesTab.tsx`
- Tạo `SourceDrawer.tsx` nếu form phức tạp
- Thêm API helper còn thiếu:
  - `createAdminSource`
  - `getAdminSource`
  - `updateAdminSource`
  - `deleteAdminSource`
- Đồng bộ local state sau create/update/delete

### Tiêu Chí Hoàn Thành

- Admin xem danh sách nguồn pháp lý thật
- Tạo/sửa/xóa nguồn hoạt động
- UI phản ánh trạng thái sau thao tác mà không cần reload page

---

## 6. AdminAiDraftsTab

### Mục Tiêu

Hoàn thiện workflow AI tạo bài học: chọn nguồn pháp lý, generate draft, review draft, chỉnh sửa, duyệt và tạo lesson/quiz thật.

### Vị Trí UI

- Admin tab mới: "AI Drafts"
- Có thể đặt sau "Nguồn pháp lý" hoặc trước "Bài kiểm tra"

### API Cần Dùng

- `POST /admin/ai/lesson-drafts/generate`
- `GET /admin/ai/lesson-drafts`
- `GET /admin/ai/lesson-drafts/:draftId`
- `PATCH /admin/ai/lesson-drafts/:draftId`
- `POST /admin/ai/lesson-drafts/:draftId/create-lesson`

### Frontend Hiện Có

- `getAdminLessonDrafts(token)` đã có
- `AdminPage` đã nhận `drafts`
- Chưa có UI review/generate draft hoàn chỉnh

### UI Chính

- Draft list:
  - Title
  - Source title
  - Status
  - Updated at
  - Actions: xem, sửa, tạo bài học
- Generate panel:
  - Chọn legal source
  - Chọn module/category nếu DTO yêu cầu
  - Prompt/instruction nếu backend hỗ trợ
  - Nút generate
- Draft detail drawer:
  - Title
  - Content
  - Reviewer note
  - Quiz questions generated
  - Status update
- Create lesson modal:
  - Chọn module/category
  - Confirm tạo lesson

### Luồng Admin

1. Admin vào tab AI Drafts.
2. Chọn nguồn pháp lý.
3. Bấm generate draft.
4. Draft xuất hiện trong list với trạng thái mới.
5. Admin mở draft, chỉnh nội dung và review note.
6. Admin bấm "Tạo bài học".
7. Hệ thống tạo lesson và quiz, sau đó admin được điều hướng sang tab Lessons hoặc Quizzes.

### Việc Cần Làm

- Thêm tab `aiDrafts` vào `AdminPage`
- Tạo `frontend/src/components/admin/AiDraftsTab.tsx`
- Tạo `AiDraftDrawer.tsx`
- Bổ sung API helper trong `admin.ts`
  - `generateAdminLessonDraft`
  - `getAdminLessonDraft`
  - `updateAdminLessonDraft`
  - `createLessonFromDraft`
- Dùng `sources` làm options khi generate
- Cập nhật local drafts sau generate/update/create

### Tiêu Chí Hoàn Thành

- Generate draft từ nguồn pháp lý thật
- Review/edit draft hoạt động
- Tạo lesson từ draft thành công
- Lesson mới xuất hiện trong Lessons tab

---

## 7. NotificationCenterPage

### Mục Tiêu

Thay icon chuông đang `alert` bằng trung tâm thông báo thật hoặc bán thật, giúp người dùng xem nhắc học, streak, review và system messages.

### Route

- Route đề xuất: `/notifications`

### Backend Hiện Tại

- Có notification preferences và device tokens.
- Có admin delivery logs.
- Chưa thấy API user notification inbox trong backend hiện tại.

### Cách Triển Khai Đề Xuất

Giai đoạn 1:

- Tạo UI notification center dùng dữ liệu local/derived:
  - Daily challenge chưa claim
  - Review recommendations
  - Streak reminder status
  - System messages tĩnh

Giai đoạn 2:

- Bổ sung backend inbox:
  - `GET /notifications`
  - `PATCH /notifications/:id/read`
  - `PATCH /notifications/read-all`

### UI Chính

- Header:
  - "Thông báo"
  - Nút "Đánh dấu đã đọc"
- Tabs:
  - Tất cả
  - Học tập
  - Ôn tập
  - Hệ thống
- Notification item:
  - Icon theo type
  - Title
  - Body
  - Time
  - Read/unread state
  - CTA nếu có: vào bài học, vào review, claim challenge

### Việc Cần Làm

- Thêm `ROUTES.notifications`
- Tạo `NotificationCenterPage.tsx`
- Đổi click icon Bell trong `AppLayout` từ `alert` sang navigate
- Nếu chưa làm backend, dùng dữ liệu có sẵn từ dashboard/review/challenges

### Tiêu Chí Hoàn Thành

- Icon chuông mở trang thông báo
- Có ít nhất 3 loại thông báo hữu ích
- Không còn `alert("Bạn chưa có thông báo mới.")`

---

## 8. CommunityPage

### Mục Tiêu

Thay menu "Cộng đồng" đang `alert` bằng trang cộng đồng để người học thảo luận, hỏi đáp và chia sẻ tình huống pháp lý.

### Route

- Route đề xuất: `/community`

### Backend Hiện Tại

- Chưa thấy module community riêng.
- Lesson Q&A hiện đang mock local trong `LessonPage`.

### Cách Triển Khai Đề Xuất

Giai đoạn 1:

- Tạo static/interactive frontend mock có state local:
  - Feed câu hỏi
  - Tag pháp luật
  - Search
  - Post composer

Giai đoạn 2:

- Bổ sung backend:
  - `GET /community/posts`
  - `POST /community/posts`
  - `GET /community/posts/:id`
  - `POST /community/posts/:id/comments`
  - Vote/bookmark/report

### UI Chính

- Feed:
  - Câu hỏi/tình huống
  - Tag: dân sự, hình sự, thương mại, lừa đảo
  - Số bình luận
  - Trạng thái đã giải quyết
- Sidebar:
  - Chủ đề phổ biến
  - Top contributor
  - Quy tắc cộng đồng
- Composer:
  - Tiêu đề
  - Nội dung
  - Tag
  - Nút đăng

### Việc Cần Làm

- Thêm `ROUTES.community`
- Tạo `CommunityPage.tsx`
- Đổi link "Cộng đồng" trong `AppLayout` sang route thật
- Đồng bộ sidebar các page học viên nếu có

### Tiêu Chí Hoàn Thành

- Click "Cộng đồng" mở page thật
- Có feed và composer cơ bản
- Có trạng thái empty/loading nếu sau này nối API

---

## 9. SubscriptionPage

### Mục Tiêu

Thay các nút "Nâng cấp Pro/Premium" đang `alert` bằng trang giới thiệu gói học hoặc quản lý subscription.

### Route

- Route đề xuất:
  - `/subscription`
  - hoặc `/pricing` nếu public

### Backend Hiện Tại

- Chưa thấy module payment/subscription.

### UI Chính

- Current plan:
  - Free/Pro/Premium
- Plan cards:
  - Free
  - Pro
  - Premium
- So sánh quyền lợi:
  - Số bài học
  - AI Q&A
  - Shorts/game reward
  - Tài liệu tải xuống
  - Community badge
- CTA:
  - "Nâng cấp"
  - Nếu chưa có payment thật, hiển thị waitlist hoặc "Sắp ra mắt"

### Việc Cần Làm

- Thêm `ROUTES.subscription`
- Tạo `SubscriptionPage.tsx`
- Đổi các nút upgrade trong layout/sidebar/profile/game/shorts sang navigate
- Nếu chưa có backend, giữ page dưới dạng coming soon có cấu trúc rõ ràng

### Tiêu Chí Hoàn Thành

- Không còn upgrade button dạng `alert`
- Người dùng hiểu các gói khác nhau
- Có đường nâng cấp thật hoặc trạng thái sắp ra mắt rõ ràng

---

## 10. Nâng Cấp AdminUsersTab Thành Dữ Liệu Thật

### Hiện Trạng

- `UsersTab` đang dùng mock data.
- Backend hiện có user self-service API, nhưng chưa thấy admin user management API.

### Cần Bổ Sung Backend

- `GET /admin/users`
- `GET /admin/users/:userId`
- `PATCH /admin/users/:userId`
- `PATCH /admin/users/:userId/status`
- Optional:
  - reset password
  - grant/revoke role
  - adjust XP/coins nếu sản phẩm cần

### UI Chính

- Table user thật:
  - Name/email
  - Role
  - Level/XP/streak
  - Last active
  - Status
- User detail drawer:
  - Profile
  - Recent attempts
  - Badges
  - Admin actions

### Tiêu Chí Hoàn Thành

- Không còn mock users trong `UsersTab`
- Search/filter gọi dữ liệu thật hoặc lọc trên dữ liệu thật
- Action admin không còn chỉ `alert`

---

## 11. Nâng Cấp ResourcesPage Thành Dữ Liệu Thật

### Hiện Trạng

- `ResourcesPage` đang hard-code tài liệu và điều luật.
- Admin đã có source/media API, nhưng user-facing resources chưa nối dữ liệu backend.

### Hướng Triển Khai

- Giai đoạn 1: tái dùng public hoặc authenticated endpoint mới cho legal sources/media.
- Giai đoạn 2: thêm search full-text theo điều luật, nguồn, tag.

### API Đề Xuất

- `GET /resources/sources`
- `GET /resources/sources/:id`
- `GET /resources/media-assets`

### UI Chính

- Document cards từ backend
- Legal provision explorer từ legal sources thật
- Search/filter theo loại văn bản
- Download/link asset thật

### Tiêu Chí Hoàn Thành

- Không còn dữ liệu hard-code trong `ResourcesPage`
- Admin thêm nguồn/tài liệu thì user có thể thấy ở resources nếu được public

---

## 12. Nâng Cấp Lesson Notes Và Q&A Thành Dữ Liệu Thật

### Hiện Trạng

- `LessonPage` có notes và Q&A bằng local state.
- Reload page sẽ mất dữ liệu.

### API Đề Xuất

- Notes:
  - `GET /lessons/:lessonId/notes`
  - `POST /lessons/:lessonId/notes`
  - `PATCH /notes/:noteId`
  - `DELETE /notes/:noteId`
- Q&A:
  - `GET /lessons/:lessonId/questions-discussion`
  - `POST /lessons/:lessonId/questions-discussion`
  - `POST /discussion/:threadId/replies`

### UI Chính

- Notes:
  - Add/edit/delete
  - Timestamp
  - Export notes
- Q&A:
  - Thread list
  - Ask question
  - Replies
  - Solved badge

### Tiêu Chí Hoàn Thành

- Notes/Q&A lưu được sau reload
- User chỉ sửa/xóa note của mình
- Lesson Q&A có loading/error/empty state

---

## Routing Checklist

Các route nên bổ sung vào `frontend/src/routes/paths.ts`:

```ts
export const ROUTES = {
  // existing routes...
  leaderboard: "/leaderboard",
  history: "/history",
  account: "/account",
  notifications: "/notifications",
  community: "/community",
  subscription: "/subscription",
} as const;
```

Route động cần parse trong `App.tsx`:

- `/lessons/:lessonId` đã có
- `/history/:attemptId` cần thêm

## API Helper Checklist

Nên bổ sung hoặc hoàn thiện:

- `frontend/src/api/users.ts`
  - `getMe`
  - `updateMe`
  - `changePassword`
- `frontend/src/api/learning.ts`
  - `getLearningAttemptDetail`
- `frontend/src/api/admin.ts`
  - `createAdminSource`
  - `getAdminSource`
  - `updateAdminSource`
  - `deleteAdminSource`
  - `generateAdminLessonDraft`
  - `getAdminLessonDraft`
  - `updateAdminLessonDraft`
  - `createLessonFromDraft`

## Navigation Checklist

Các vị trí cần đổi từ `alert` hoặc `#` sang route thật:

- `AppLayout`
  - Community link
  - Bell notification icon
  - Upgrade Pro button
- `ModulesPage`
  - History link
  - Premium button
- `ProfilePage`
  - History link
  - Premium button
  - Edit profile/account settings
- `ShortsPage`
  - History link
  - Premium button
- `GamePage`
  - History link
  - Premium button
- `LessonPage`
  - Help center hoặc syllabus nếu cần route riêng sau này

## Gợi Ý Chia Sprint

### Sprint 1: Hoàn thiện route người học có API sẵn

- LeaderboardPage
- LearningHistoryPage
- AttemptDetailPage
- Cập nhật navigation

### Sprint 2: Tài khoản và setting thật

- AccountSettingsPage
- API users frontend
- Profile edit dùng API thật
- Change password

### Sprint 3: Admin content workflow

- AdminSourcesTab
- AdminAiDraftsTab
- API admin helper còn thiếu
- Điều hướng từ AI draft sang lesson/quizzes

### Sprint 4: Trải nghiệm sản phẩm

- NotificationCenterPage
- SubscriptionPage
- CommunityPage bản frontend trước

### Sprint 5: Loại bỏ mock lớn

- AdminUsersTab dữ liệu thật
- ResourcesPage dữ liệu thật
- Lesson notes/Q&A dữ liệu thật

## Nguyên Tắc Triển Khai

- Ưu tiên dùng API đã có trước khi tạo backend mới.
- Mỗi page cần đủ loading, error, empty state.
- Không để menu chính trỏ tới `alert` nếu đó là tính năng có thể thành page.
- Với admin, ưu tiên drawer/modal cho create/edit để giữ nhịp làm việc trong CMS.
- Với người học, ưu tiên điều hướng rõ: Dashboard -> Modules -> Lesson -> Review/History.
- Sau mỗi page, chạy build frontend để bắt lỗi TypeScript.

