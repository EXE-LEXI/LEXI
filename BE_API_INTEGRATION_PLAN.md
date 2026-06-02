# LEXI Backend API Integration Plan

Tai lieu nay lap ke hoach BE de FE co the bo du lieu cung o cac man hinh con lai:

- ResourcesPage
- ShortsPage
- CommunityPage
- SubscriptionPage
- GamePage va cac mini game
- LessonPage notes / Q&A / tai lieu
- Admin UsersTab
- Media upload that
- Notification inbox that

Backend hien tai: NestJS + Prisma + MongoDB. Da co cac module: auth, users, learning, gamification, leaderboard, notification, admin-content.

## Nguyen Tac Trien Khai

- Uu tien mo rong model/API da co truoc khi tao module moi.
- Moi endpoint can co DTO request/response, service, repository, controller, test.
- Endpoint user-facing dung `JwtAuthGuard`.
- Endpoint admin dung `JwtAuthGuard + RolesGuard + ADMIN`.
- Tra response theo pagination chung neu la list.
- Khong de FE phai suy dien trang thai tu string hard-code neu BE co the tra field ro rang.
- Moi phase nen build/test backend va build frontend sau khi FE noi API.

## Thu Tu Uu Tien

1. Public Resources API
2. Lesson Notes / Lesson Discussion API
3. Notification Inbox API
4. Admin Users API
5. Shorts API
6. Game Content API
7. Subscription / Waitlist API
8. Media Upload API
9. Community API

Ly do: phases 1-4 gan voi schema hien co va FE dang can bo mock nhieu nhat; phases sau can them model moi hoac luong nghiep vu lon hon.

---

## Phase 1: Public Resources API

### FE Can

`ResourcesPage` dang hard-code:

- `SYLLABUS_DOCS`
- `LEGAL_ARTICLES`
- download state ao

### Backend Hien Co

Da co model:

- `LegalSourceDocument`
- `MediaAsset`

Admin da co CRUD:

- `/admin/sources`
- `/admin/media-assets`

### Schema De Xuat

Can mo rong `MediaAssetType` de ho tro PDF:

```prisma
enum MediaAssetType {
  VIDEO
  PDF
  DOCUMENT
}
```

Can them visibility cho resource public/user:

```prisma
model LegalSourceDocument {
  // existing fields...
  isPublic Boolean @default(false)
  tags     String[]
}

model MediaAsset {
  // existing fields...
  isPublic Boolean @default(false)
  downloadCount Int @default(0)
}
```

Neu Prisma MongoDB khong hop voi `String[]` trong cau truc hien tai, co the dung `metadata Json?` truoc de tranh migration lon.

### API De Xuat

#### `GET /resources/sources`

Query:

- `page`
- `limit`
- `q`
- `documentNo`
- `status`

Response item:

```ts
{
  id: string;
  title: string;
  legalDocumentNo: string | null;
  effectiveDate: string | null;
  sourceUrl: string | null;
  excerpt: string;
  crawlStatus: string;
  updatedAt: string;
}
```

#### `GET /resources/sources/:sourceId`

Response:

```ts
{
  id: string;
  title: string;
  legalDocumentNo: string | null;
  effectiveDate: string | null;
  sourceUrl: string | null;
  rawText: string;
  normalizedText: string | null;
  updatedAt: string;
}
```

#### `GET /resources/media-assets`

Query:

- `page`
- `limit`
- `type=PDF|DOCUMENT|VIDEO`
- `q`

Response item:

```ts
{
  id: string;
  title: string | null;
  type: string;
  url: string | null;
  mimeType: string | null;
  status: string;
  downloadCount: number;
  updatedAt: string;
}
```

#### `POST /resources/media-assets/:assetId/download`

Tac dung:

- Tang `downloadCount`
- Tra ve URL hoac signed URL neu sau nay co object storage

### Files Can Tao

- `backend/src/modules/resources/resources.module.ts`
- `backend/src/modules/resources/controllers/resources.controller.ts`
- `backend/src/modules/resources/services/resources.service.ts`
- `backend/src/modules/resources/repositories/resources.repository.ts`
- `backend/src/modules/resources/dto/request/get-resources-query.dto.ts`
- `backend/src/modules/resources/dto/response/resource-source-response.dto.ts`
- `backend/src/modules/resources/dto/response/resource-media-response.dto.ts`

### Test Can Co

- List public sources only
- Search theo title/rawText
- Detail source chi tra public source
- List media public only
- Download increments counter

### FE Noi Sau Do

- `frontend/src/api/resources.ts`
- `ResourcesPage` replace `SYLLABUS_DOCS` va `LEGAL_ARTICLES`

---

## Phase 2: Lesson Notes Va Lesson Discussion API

### FE Can

`LessonPage` dang hard-code/local state:

- personal notes
- Q&A threads
- tai lieu dinh kem
- video click alert

### Schema De Xuat

Them model:

```prisma
model LessonNote {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @db.ObjectId
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  lessonId  String   @db.ObjectId
  lesson    Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  timeCode  Int?
  text      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId, lessonId])
  @@map("lesson_notes")
}

model LessonDiscussionThread {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  lessonId  String   @db.ObjectId
  lesson    Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  authorId  String   @db.ObjectId
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  title     String?
  question  String
  isSolved  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  replies LessonDiscussionReply[]

  @@index([lessonId])
  @@index([authorId])
  @@map("lesson_discussion_threads")
}

model LessonDiscussionReply {
  id        String                 @id @default(auto()) @map("_id") @db.ObjectId
  threadId  String                 @db.ObjectId
  thread    LessonDiscussionThread @relation(fields: [threadId], references: [id], onDelete: Cascade)
  authorId  String                 @db.ObjectId
  author    User                   @relation(fields: [authorId], references: [id], onDelete: Cascade)
  content   String
  isAccepted Boolean               @default(false)
  createdAt DateTime               @default(now())
  updatedAt DateTime               @updatedAt

  @@index([threadId])
  @@index([authorId])
  @@map("lesson_discussion_replies")
}
```

Can them relations vao `User` va `Lesson`.

### API De Xuat

#### Notes

- `GET /lessons/:lessonId/notes`
- `POST /lessons/:lessonId/notes`
- `PATCH /lessons/:lessonId/notes/:noteId`
- `DELETE /lessons/:lessonId/notes/:noteId`

Request create:

```ts
{
  text: string;
  timeCode?: number | null;
}
```

Rule:

- User chi xem/sua/xoa note cua minh.

#### Discussion

- `GET /lessons/:lessonId/discussions?page=&limit=`
- `POST /lessons/:lessonId/discussions`
- `GET /lessons/:lessonId/discussions/:threadId`
- `POST /lessons/:lessonId/discussions/:threadId/replies`
- `PATCH /lessons/:lessonId/discussions/:threadId/solved`

Rule:

- User dang nhap moi post duoc.
- Author thread hoac admin moi mark solved.
- Admin co the accept reply neu can.

### Files Can Tao

Trong `backend/src/modules/learning/lessons`:

- `controllers/lesson-notes.controller.ts`
- `controllers/lesson-discussions.controller.ts`
- `services/lesson-notes.service.ts`
- `services/lesson-discussions.service.ts`
- `repositories/lesson-notes.repository.ts`
- `repositories/lesson-discussions.repository.ts`
- DTO request/response tuong ung

### Test Can Co

- CRUD note cua user
- User A khong sua/xoa note User B
- Create discussion thread
- Add reply
- Mark solved permission

### FE Noi Sau Do

- `frontend/src/api/lessonInteractions.ts`
- `LessonPage` thay local state notes/Q&A bang API

---

## Phase 3: Notification Inbox API

### FE Can

`NotificationCenterPage` hien dang tong hop tam tu current lesson/challenge/review/preferences. Can inbox that de doc/xoa/mark read.

### Backend Hien Co

Da co:

- `NotificationPreference`
- `NotificationDeliveryLog`

Chua co user inbox.

### Schema De Xuat

```prisma
enum NotificationInboxType {
  STUDY
  REVIEW
  SYSTEM
  CHALLENGE
}

model NotificationInboxItem {
  id        String @id @default(auto()) @map("_id") @db.ObjectId
  userId    String @db.ObjectId
  user      User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  type      NotificationInboxType
  title     String
  body      String
  ctaPath   String?
  ctaText   String?
  data      Json?
  readAt    DateTime?
  deletedAt DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId, readAt])
  @@index([userId, deletedAt])
  @@map("notification_inbox_items")
}
```

### API De Xuat

- `GET /notifications?page=&limit=&type=&unreadOnly=`
- `PATCH /notifications/:notificationId/read`
- `PATCH /notifications/read-all`
- `DELETE /notifications/:notificationId`

Response item:

```ts
{
  id: string;
  type: "STUDY" | "REVIEW" | "SYSTEM" | "CHALLENGE";
  title: string;
  body: string;
  ctaPath: string | null;
  ctaText: string | null;
  isRead: boolean;
  createdAt: string;
}
```

### Notification Creation Sources

Giai doan dau:

- Worker daily reminder tao inbox item cung luc tao delivery log.
- Sau submit quiz neu co wrong answers: tao review notification.
- Sau unlock badge: tao system/challenge notification.
- Sau complete daily challenge: tao challenge notification.

### Files Can Tao/Sua

- `notification/controllers/notifications.controller.ts`
- `notification/services/notifications.service.ts`
- `notification/repositories/notifications.repository.ts`
- Update `notification.module.ts`
- Update reward/challenge services neu can tao notification

### Test Can Co

- List only user notifications
- Mark read
- Read all
- Soft delete
- User khong truy cap notification cua user khac

### FE Noi Sau Do

- `frontend/src/api/notifications.ts`
- `NotificationCenterPage` dung inbox API, bo derived fallback

---

## Phase 4: Admin Users API

### FE Can

`UsersTab` dang dung `mockUsersList`.

### Backend Hien Co

Da co `User`, `UserProfile`, attempts/progress/badges/challenges.
Chi co self-service `/users/me`.

### API De Xuat

#### `GET /admin/users`

Query:

- `page`
- `limit`
- `q`
- `role`
- `status`
- `sort`

Response item:

```ts
{
  id: string;
  email: string;
  role: "ADMIN" | "LEARNER";
  status: "ACTIVE" | "INACTIVE" | "BANNED";
  profile: {
    fullName: string;
    avatarUrl: string | null;
    xp: number;
    streak: number;
  } | null;
  stats: {
    attempts: number;
    completedLessons: number;
    badges: number;
  };
  createdAt: string;
  updatedAt: string;
}
```

#### `GET /admin/users/:userId`

Include:

- profile
- recent attempts
- badges
- progress summary

#### `PATCH /admin/users/:userId/status`

Body:

```ts
{
  status: "ACTIVE" | "INACTIVE" | "BANNED";
}
```

#### `PATCH /admin/users/:userId/role`

Body:

```ts
{
  role: "ADMIN" | "LEARNER";
}
```

#### `PATCH /admin/users/:userId/profile`

Body:

```ts
{
  fullName?: string;
  avatarUrl?: string | null;
  xp?: number;
  streak?: number;
}
```

### Files Can Tao

Nen tao module rieng:

- `backend/src/modules/admin-users/admin-users.module.ts`
- `controllers/admin-users.controller.ts`
- `services/admin-users.service.ts`
- `repositories/admin-users.repository.ts`
- DTO request/response

Sau do import vao `AppModule`.

### Test Can Co

- Learner bi 403 khi goi admin users
- Admin list/search users
- Admin update status
- Admin update role
- Admin xem user detail

### FE Noi Sau Do

- Them helper vao `frontend/src/api/admin.ts` hoac `adminUsers.ts`
- Replace `UsersTab` mock data

---

## Phase 5: Shorts API

### FE Can

`ShortsPage` dang hard-code:

- video list
- quiz trong video
- likes/comments/bookmarks count
- like/bookmark local

### Schema De Xuat

```prisma
model ShortVideo {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  title         String
  description   String
  authorName    String
  category      String
  videoUrl      String
  thumbnailUrl  String?
  isActive      Boolean  @default(true)
  sortOrder     Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  quiz       ShortVideoQuiz?
  reactions  ShortVideoReaction[]
  comments   ShortVideoComment[]

  @@index([category])
  @@index([isActive])
  @@map("short_videos")
}

model ShortVideoQuiz {
  id          String     @id @default(auto()) @map("_id") @db.ObjectId
  videoId     String     @unique @db.ObjectId
  video       ShortVideo @relation(fields: [videoId], references: [id], onDelete: Cascade)
  question    String
  explanation String?
  options     Json
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@map("short_video_quizzes")
}

model ShortVideoReaction {
  id        String     @id @default(auto()) @map("_id") @db.ObjectId
  videoId   String     @db.ObjectId
  video     ShortVideo @relation(fields: [videoId], references: [id], onDelete: Cascade)
  userId    String     @db.ObjectId
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  liked     Boolean    @default(false)
  bookmarked Boolean   @default(false)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  @@unique([videoId, userId])
  @@index([userId])
  @@map("short_video_reactions")
}

model ShortVideoComment {
  id        String     @id @default(auto()) @map("_id") @db.ObjectId
  videoId   String     @db.ObjectId
  video     ShortVideo @relation(fields: [videoId], references: [id], onDelete: Cascade)
  userId    String     @db.ObjectId
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  content   String
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  @@index([videoId])
  @@index([userId])
  @@map("short_video_comments")
}
```

### API De Xuat

- `GET /shorts?category=&page=&limit=`
- `GET /shorts/:videoId`
- `POST /shorts/:videoId/like`
- `DELETE /shorts/:videoId/like`
- `POST /shorts/:videoId/bookmark`
- `DELETE /shorts/:videoId/bookmark`
- `GET /shorts/:videoId/comments`
- `POST /shorts/:videoId/comments`
- `POST /shorts/:videoId/quiz/submit`

Quiz submit co the reward XP nho neu dung.

### Admin API De Xuat

- `GET /admin/shorts`
- `POST /admin/shorts`
- `PATCH /admin/shorts/:videoId`
- `DELETE /admin/shorts/:videoId`

### Test Can Co

- List active shorts
- Reaction unique per user
- Comment auth required
- Quiz submit validates answer
- Admin CRUD protected

---

## Phase 6: Game Content API

### FE Can

GamePage va mini games dang hard-code:

- duel questions
- fraud messages
- law matcher pairs
- detective case
- penalty scenarios

### Schema De Xuat

Dung model generic de nhanh:

```prisma
enum GameContentType {
  DUEL_QUESTION
  FRAUD_MESSAGE
  LAW_MATCH_PAIR
  DETECTIVE_CASE
  PENALTY_SCENARIO
}

model GameContent {
  id        String          @id @default(auto()) @map("_id") @db.ObjectId
  type      GameContentType
  title     String
  payload   Json
  isActive  Boolean         @default(true)
  sortOrder Int             @default(0)
  createdAt DateTime        @default(now())
  updatedAt DateTime        @updatedAt

  @@index([type, isActive])
  @@map("game_contents")
}

model GameAttempt {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @db.ObjectId
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  mode      String
  score     Int
  xpAwarded Int      @default(0)
  coinsAwarded Int   @default(0)
  details   Json?
  createdAt DateTime @default(now())

  @@index([userId, mode])
  @@map("game_attempts")
}
```

### API De Xuat

- `GET /games/content?type=DUEL_QUESTION&limit=`
- `GET /games/modes`
- `POST /games/attempts`

Admin:

- `GET /admin/game-content?type=`
- `POST /admin/game-content`
- `PATCH /admin/game-content/:id`
- `DELETE /admin/game-content/:id`

### Payload Contract Vi Du

DUEL_QUESTION:

```json
{
  "question": "...",
  "options": ["A", "B", "C"],
  "correctIndex": 0,
  "explanation": "..."
}
```

FRAUD_MESSAGE:

```json
{
  "sender": "...",
  "channel": "sms",
  "content": "...",
  "isFraud": true,
  "explanation": "..."
}
```

### Test Can Co

- List by type only active
- Submit attempt updates XP if desired
- Admin CRUD protected

---

## Phase 7: Subscription / Waitlist API

### FE Can

`SubscriptionPage` hard-code plans and waitlist local state.

### Schema De Xuat

```prisma
model SubscriptionPlan {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  code        String   @unique
  name        String
  description String?
  monthlyPrice Int
  yearlyPrice  Int
  features    Json
  isActive    Boolean @default(true)
  sortOrder   Int     @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("subscription_plans")
}

model SubscriptionWaitlist {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String?  @db.ObjectId
  email     String
  planCode  String
  createdAt DateTime @default(now())

  @@index([email])
  @@index([planCode])
  @@map("subscription_waitlists")
}
```

### API De Xuat

- `GET /subscription/plans`
- `POST /subscription/waitlist`

Admin:

- `GET /admin/subscription/waitlist`
- `POST /admin/subscription/plans`
- `PATCH /admin/subscription/plans/:planId`

### Test Can Co

- List active plans
- Waitlist accepts anonymous/user email
- Duplicate policy: allow one per email+plan or return existing

---

## Phase 8: Media Upload API

### FE Can

`MediaTab` hien chi tao metadata va fake URL.

### Huong Trien Khai

Giai doan local/dev:

- Dung `MulterModule`
- Luu file vao `backend/uploads`
- Serve static `/uploads`

Giai doan production:

- Chuyen sang S3/GCS/Cloudinary signed upload.

### Schema Can Sua

`MediaAsset` da co:

- `url`
- `mimeType`
- `provider`
- `metadata`
- `assetType`

Can them:

```prisma
fileSize Int?
originalName String?
```

### API De Xuat

- `POST /admin/media-assets/upload`
  - multipart field `file`
  - body: title, lessonId?, draftId?
- `PATCH /admin/media-assets/:assetId`
- `DELETE /admin/media-assets/:assetId`

Response:

```ts
{
  id: string;
  title: string;
  type: string;
  url: string;
  mimeType: string;
  status: "READY";
}
```

### Files Can Sua

- `admin-content/controllers/admin-media.controller.ts`
- `admin-content/services/admin-content.service.ts`
- `admin-content/repositories/admin-content.repository.ts`
- DTO upload response
- App static serving config, neu local uploads

### Test Can Co

- Upload rejects invalid mime type
- Upload creates MediaAsset with real URL
- Attach upload to lesson

---

## Phase 9: Community API

### FE Can

`CommunityPage` hard-code posts/comments/top contributors.

### Schema De Xuat

```prisma
model CommunityPost {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  authorId  String   @db.ObjectId
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  title     String
  content   String
  category  String
  tags      String[]
  isSolved  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  comments CommunityComment[]
  reactions CommunityReaction[]

  @@index([category])
  @@index([authorId])
  @@map("community_posts")
}

model CommunityComment {
  id        String        @id @default(auto()) @map("_id") @db.ObjectId
  postId    String        @db.ObjectId
  post      CommunityPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  authorId  String        @db.ObjectId
  author    User          @relation(fields: [authorId], references: [id], onDelete: Cascade)
  content   String
  isAccepted Boolean      @default(false)
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt

  @@index([postId])
  @@index([authorId])
  @@map("community_comments")
}

model CommunityReaction {
  id        String        @id @default(auto()) @map("_id") @db.ObjectId
  postId    String        @db.ObjectId
  post      CommunityPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  userId    String        @db.ObjectId
  user      User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  liked     Boolean       @default(true)
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt

  @@unique([postId, userId])
  @@index([userId])
  @@map("community_reactions")
}
```

### API De Xuat

- `GET /community/posts?page=&limit=&category=&q=&solved=`
- `POST /community/posts`
- `GET /community/posts/:postId`
- `PATCH /community/posts/:postId`
- `DELETE /community/posts/:postId`
- `POST /community/posts/:postId/comments`
- `PATCH /community/posts/:postId/solved`
- `POST /community/posts/:postId/like`
- `DELETE /community/posts/:postId/like`
- `GET /community/contributors`

### Rule

- Author sua/xoa post cua minh.
- Admin sua/xoa moi post.
- Author post hoac admin mark solved.
- Contributor ranking tinh theo accepted comments / comment count.

### Test Can Co

- List/filter/search posts
- Create post
- Add comment
- Like idempotent
- Permission update/delete

---

## Cross-Cutting: DTO Va Response Shape

Moi list endpoint nen tra:

```ts
{
  items: T[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  }
}
```

Validation:

- Dung `class-validator`
- Reuse `PaginationQueryDto`
- ObjectId params can validate bang pipe/helper neu repo hien co chua co thi them `ParseObjectIdPipe`

Swagger:

- Them `@ApiTags`
- Them `@ApiBearerAuth`
- Them `@ApiOkResponse`

## Seed Data Can Them

Cap nhat `backend/prisma/seed.ts`:

- 5 legal source public
- 3 PDF/document media public
- 5 shorts + quiz
- 5 game contents moi type
- 3 subscription plans
- 3 community posts sample

Muc tieu: FE co data ngay sau seed, khong can hard-code.

## Backend Test Roadmap

### Phase Test Order

1. Resources access + search
2. Lesson notes ownership
3. Lesson discussion permissions
4. Notification inbox ownership/read/delete
5. Admin users authorization
6. Shorts reaction/comment/quiz
7. Game content list/admin CRUD
8. Subscription waitlist
9. Media upload
10. Community post/comment/reaction

### Commands

Theo package backend hien tai, chay:

```bash
npm test
```

Neu co test theo file:

```bash
npm test -- resources
npm test -- notification
npm test -- community
```

## FE Integration Checklist Sau Moi Phase

Sau khi BE phase xong:

- Them API helper trong `frontend/src/api/*`
- Them types trong `frontend/src/types/*`
- Replace const hard-code trong page
- Them loading/error/empty state neu chua co
- Chay `npm run build` trong frontend

## De Xuat Sprint

### Sprint BE-1

- ResourcesModule
- MediaAsset PDF/document support
- FE ResourcesPage noi API

### Sprint BE-2

- Lesson notes
- Lesson discussions
- FE LessonPage noi API

### Sprint BE-3

- Notification inbox
- Admin users
- FE NotificationCenterPage va UsersTab noi API

### Sprint BE-4

- Shorts
- Game content
- FE ShortsPage va GamePage noi API

### Sprint BE-5

- Subscription plans/waitlist
- Media upload real
- Community module
- FE SubscriptionPage, MediaTab, CommunityPage noi API

