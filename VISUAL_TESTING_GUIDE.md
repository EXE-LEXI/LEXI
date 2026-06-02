# 🖥️ LEXI AI Testing - Visual Browser Guide

**Mục đích / Purpose:** Hướng dẫn từng bước bằng giao diện trình duyệt / Step-by-step visual guide through browser UI

---

## 📍 Feature 1: Cào dữ liệu luật pháp

### Step 1️⃣: Open Admin Page

```
URL: http://localhost:5173/admin

Expected Page:
┌─────────────────────────────────────────────────────────┐
│ 🔵 LEXI App Header                                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Dieu hanh noi dung  (Admin Forge)                       │
│                                                          │
│  ┌──────────────────┐    ┌──────────────────┐           │
│  │ 📥 Cao va tao    │    │ 🔧 Xu ly nguon   │           │
│  │ draft            │    │ da crawl         │           │
│  │                  │    │                  │           │
│  │ [Form here]      │    │ [Form here]      │           │
│  │                  │    │                  │           │
│  │ [Button] 🔙      │    │ [Button] ⚙️      │           │
│  └──────────────────┘    └──────────────────┘           │
│                                                          │
└─────────────────────────────────────────────────────────┘

✅ If you see this → Ready to test Feature 1
❌ If you see 401 error → Need to login first
❌ If you see "Not Found" → URL is wrong
```

### Step 2️⃣: Find Crawl Section

```
Look for LEFT CARD:
│ Title: "Cao va tao draft"
│ Description: "Nhap cac URL van ban phap luat..."
│
│ Form Fields:
│ ┌─ URLs Input ──────────────┐
│ │ (optional - leave empty)  │
│ └───────────────────────────┘
│ ☐ Generate Drafts (checkbox)
│ ┌─ Question Count ──────────┐
│ │ 3                         │
│ └───────────────────────────┘
│
│ [🔄 Crawl and Create Drafts]  ← Click this button
```

### Step 3️⃣: Submit Crawl Form

```
1. Keep form as default (URLs empty = use fallback)
2. Check: "Generate Drafts" (optional)
3. Keep: Question Count = 3
4. Click: [Crawl and Create Drafts] button

⏳ Wait 2-3 seconds...
```

### Step 4️⃣: Check Result

```
Expected on Page:

✅ SUCCESS MESSAGE (green):
   ┌─────────────────────────────────────┐
   │ ✓ Crawl completed successfully!     │
   │   Found 50 sources and created      │
   │   5 lesson drafts                   │
   └─────────────────────────────────────┘

📊 STATS DISPLAY:
   ┌──────────┬──────────┬────────┐
   │ 50       │ 5        │ 0      │
   │ Sources  │ Drafts   │ Errors │
   └──────────┴──────────┴────────┘

❌ If ERROR appears:
   - Check backend is running
   - Check MongoDB connection
   - See Troubleshooting section
```

### Step 5️⃣: Verify in DevTools

```
1. Press F12 on keyboard (or Right-Click → Inspect)
2. Go to "Network" tab
3. Look in the request list for:
   
   POST /admin/sources/crawl
   Status: 200 ✅
   
4. Click on the request
5. Go to "Response" tab
6. Should show:
   
   {
     "sources": [
       {
         "id": "...",
         "title": "Law on Labor Code 2012",
         "source": "FALLBACK",
         "crawlStatus": "COMPLETED"
       },
       ...
     ],
     "drafts": [
       {
         "id": "...",
         "title": "Lesson: Law on Labor Code",
         "status": "PENDING"
       }
     ],
     "errors": []
   }
```

✅ **Feature 1 Complete if:**
- ✅ Success message appears
- ✅ Sources count > 0
- ✅ API Status 200
- ✅ Response includes sources array

---

## 📍 Feature 2: Xử lý dữ liệu bằng AI

### Step 1️⃣: Stay on Admin Page

```
Already on admin page from Feature 1
Scroll or look for RIGHT CARD:

│ Title: "Xu ly nguon da crawl"
│ Description: "Lay tat ca legal source da crawl..."
│
│ Form Fields:
│ ┌─ Module ID (optional) ────┐
│ │ (leave empty)             │
│ └───────────────────────────┘
│ ┌─ Limit ───────────────────┐
│ │ 5                         │
│ └───────────────────────────┘
│ ┌─ Question Count ──────────┐
│ │ 3                         │
│ └───────────────────────────┘
│
│ [⚙️  Process Sources]  ← Click this button
```

### Step 2️⃣: Submit Process Form

```
1. Keep all fields as default
2. Click: [Process Sources] button

⏳ Wait 2-3 seconds for initial response...
```

### Step 3️⃣: Check Initial Response

```
Expected on Page:

✅ SUCCESS MESSAGE (green):
   ┌─────────────────────────────────────┐
   │ ✓ Processing completed!             │
   │   Created 5 new lesson drafts       │
   └─────────────────────────────────────┘

📊 UPDATED STATS (should increase):
   Drafts: 10 (was 5 before)
   
❌ If ERROR:
   - Check Feature 1 completed first
   - Check backend logs
   - Try again
```

### Step 4️⃣: Monitor Backend Processing

```
Open Terminal where backend is running:
(where you did: npm run start:dev)

Look for messages like:
```
✅ [Nest] timestamp ... INFO [NestFactory] Application initialized
✅ [DEBUG] Processing AI job: job-123
✅ [DEBUG] Generating lesson content for: Law on Labor Code
✅ [INFO] Job succeeded: draft-456 created
✅ [DEBUG] Saved LessonDraft to MongoDB

⏳ This takes 30-60 seconds per lesson

When complete:
✅ [DEBUG] AI job processor: All jobs completed
```

### Step 5️⃣: Verify Results

```
After 60 seconds, check:

1. ADMIN PAGE:
   - Drafts count increased
   - New entries might appear below

2. DevTools (F12):
   Network tab → POST /admin/ai/legal-sources/process
   Status: 200 ✅
   Response shows: array of draft objects

3. MONGODB (if you have access):
   Collections:
   - AiGenerationJob: Status = "SUCCEEDED"
   - LessonDraft: New records with generated content

4. BACKEND LOGS:
   Should show: "Job succeeded" messages
```

✅ **Feature 2 Complete if:**
- ✅ API Status 200
- ✅ Backend shows processing messages
- ✅ After 60 seconds: Job completed
- ✅ Drafts count increased

---

## 📍 Feature 3: Sử dụng AI cho chức năng

### Test 3A: Check Recommendations

#### Step 1️⃣: Go to Profile Page

```
1. Look for PROFILE button/link:
   - Top right corner (user menu)
   - OR click: "Profile" in sidebar
   - OR go to: http://localhost:5173/profile

2. Expected page structure:

┌──────────────────────────────────────────────┐
│ 👤 User Name               [Edit] [Save]     │
│ 📊 Stats                                     │
│ ├─ Completed Lessons: 5                     │
│ ├─ Average Score: 78%                       │
│ ├─ Learning Streak: 7 days                  │
│ ├─ XP: 1500                                 │
│ └─ Level: 8                                 │
│                                             │
│ 💡 AI Recommendations (if integrated):      │
│ ├─ [Lesson 1] ⭐ 85% match                  │
│ ├─ [Lesson 2] ⭐ 82% match                  │
│ ├─ [Lesson 3] ⭐ 79% match                  │
│ ├─ [Lesson 4] ⭐ 76% match                  │
│ └─ [Lesson 5] ⭐ 73% match                  │
│                                             │
│ 📈 Learning Path (if integrated):           │
│ └─ Phase 1: Complete ████████░░ 80%        │
│    Phase 2: In Progress ██████░░░░ 60%     │
│                                             │
└──────────────────────────────────────────────┘

✅ If you see recommendations → Feature integrated
⚠️ If you don't see them → UI needs integration (normal)
```

#### Step 2️⃣: Check DevTools for API Calls

```
1. Open DevTools (F12)
2. Go to "Network" tab
3. Page should already be making API calls
4. Look for these requests:

   ✓ GET /api/ai-learning/recommendations
   ✓ GET /api/ai-learning/learning-profile
   ✓ GET /api/ai-learning/knowledge-gaps
   ✓ GET /api/ai-learning/consistency-analysis
   ✓ GET /api/ai-learning/learning-patterns

5. All should show: Status 200 ✅

6. Click each one and check "Response":
   - Should contain relevant data
   - Not empty
   - Properly formatted JSON
```

✅ **Recommendations Working if:**
- ✅ DevTools shows /api/ai-learning/recommendations
- ✅ Status is 200
- ✅ Response contains array of lessons
- ⚠️ UI display is optional (backend works regardless)

---

### Test 3B: Check Adaptive Quiz

#### Step 1️⃣: Go to Lesson Page

```
1. Navigate to: Modules page
   OR click: "Khóa học của tôi" (My Courses)
   
2. Expected page:

┌─────────────────────────────────────┐
│ Danh sách các khóa học:             │
│                                     │
│ 📚 Module 1: Constitutional Law     │
│    [Lesson 1] [Lesson 2] ...       │
│                                     │
│ 📚 Module 2: Civil Law              │
│    [Lesson 1] [Lesson 2] ...       │
│                                     │
│ 📚 Module 3: Criminal Law           │
│    [Lesson 1] [Lesson 2] ...       │
│                                     │
└─────────────────────────────────────┘

2. Click any lesson (e.g., "Lesson 1")
```

#### Step 2️⃣: Go to Quiz Section

```
Lesson page should have sections:
- 📖 Noi dung (Content)
- ❓ Quiz
- 💬 Q&A
- 📝 Notes

1. Click: "Quiz" section or tab
2. Should show quiz questions

Expected quiz layout:

┌─────────────────────────────────────┐
│ Question 3/5                        │
│ Difficulty: 🟡 MEDIUM              │
│                                     │
│ "Which is a valid contract?"        │
│                                     │
│ ○ [Answer A]                        │
│ ○ [Answer B]                        │
│ ◉ [Answer C]  ← Selected            │
│ ○ [Answer D]                        │
│                                     │
│ [Get Hint] [Previous] [Next]        │
│                                     │
└─────────────────────────────────────┘

✅ If you see "Easy", "Medium", "Hard" badge:
   → Feature is working!

⚠️ If no difficulty badge:
   → UI not integrated yet (backend still works)
```

#### Step 3️⃣: Verify in DevTools

```
1. Open DevTools (F12)
2. Click on a quiz question
3. Network tab should show:

   GET /api/ai-learning/adaptive-quiz/{lessonId}
   Status: 200 ✅
   
4. Response should have:
   {
     "questionId": "q123",
     "questionText": "...",
     "difficulty": "medium",  ← Check this!
     "options": [...],
     "hintAvailable": true,
     "explanation": "..."
   }
```

✅ **Adaptive Quiz Working if:**
- ✅ API endpoint returns 200
- ✅ Response includes "difficulty" field
- ✅ Difficulty is "easy", "medium", or "hard"
- ⚠️ Visual badge display optional

---

### Test 3C: Check Performance Feedback

#### Step 1️⃣: Submit Quiz

```
1. On Lesson Page, go to Quiz section
2. Answer all questions
3. Click: [Submit Quiz] or [Finish] button
4. Wait for response (2-3 seconds)
```

#### Step 2️⃣: Look for Feedback

```
After submitting, page should show:

✅ IF INTEGRATED:
   ┌──────────────────────────────────┐
   │ 📊 Kết quả của bạn (Your Result) │
   │                                  │
   │ Score: 85/100  ⭐⭐⭐              │
   │                                  │
   │ 💪 Strengths:                    │
   │ • Contract interpretation        │
   │ • Legal analysis                 │
   │                                  │
   │ 📚 Areas to Improve:             │
   │ • Statute reading                │
   │ • Case law application           │
   │                                  │
   │ 🎯 Next Steps:                   │
   │ • Review Module 3 Statutes       │
   │ • Practice case analysis         │
   │                                  │
   │ 🌟 Keep it up! You're making     │
   │    great progress!               │
   └──────────────────────────────────┘

⚠️ IF NOT INTEGRATED:
   Just basic score might show
   (Full feedback text not visible yet)
```

#### Step 3️⃣: Verify API Call

```
DevTools Network tab should show:

GET /api/ai-learning/attempt/{attemptId}/feedback
Status: 200 ✅

Response:
{
  "overallFeedback": "Excellent performance!",
  "strengths": ["Contract interpretation", ...],
  "areasForImprovement": ["Statute reading", ...],
  "nextSteps": ["Review statutes", ...],
  "motivationalMessage": "Keep it up!"
}
```

✅ **Performance Feedback Working if:**
- ✅ API returns 200
- ✅ Response has feedback text
- ⚠️ Full UI display optional

---

## 🔍 DevTools Verification - Complete Checklist

### All Requests Should Show Status 200:

```
Feature 1 - Scraping:
□ POST /admin/sources/crawl → 200 ✅

Feature 2 - Processing:
□ POST /admin/ai/legal-sources/process → 200 ✅

Feature 3 - AI Usage (All should be 200):
□ GET /api/ai-learning/recommendations → 200 ✅
□ GET /api/ai-learning/learning-profile → 200 ✅
□ GET /api/ai-learning/quiz-improvements/{id} → 200 ✅
□ GET /api/ai-learning/consistency-analysis → 200 ✅
□ GET /api/ai-learning/knowledge-gaps → 200 ✅
□ GET /api/ai-learning/adaptive-quiz/{id} → 200 ✅
□ GET /api/ai-learning/learning-path → 200 ✅
□ GET /api/ai-learning/attempt/{id}/feedback → 200 ✅
□ GET /api/ai-learning/learning-patterns → 200 ✅
```

---

## ❌ Troubleshooting with Browser

### Problem: Page Shows "401 Unauthorized"

```
Solution Steps:

1. Check URL
   Current: http://localhost:5173
   Expected: http://localhost:5173
   (Should not show 401 on home page)

2. If 401 on admin page:
   ✓ Are you logged in?
   ✓ Do you have ADMIN role?
   
3. Action:
   - Logout (if logged in)
   - Login again as ADMIN user
   - Try admin page again

4. Check localStorage (Advanced):
   - F12 → Application tab
   - Left sidebar: Storage → Local Storage
   - Look for: "lexi.auth"
   - Should show: {"accessToken": "eyJ...", ...}
```

### Problem: API Call Shows 500 Error

```
1. Check backend terminal:
   Should show error message
   Example: "TypeError: Cannot read property..."

2. Action:
   - Fix the error (see message)
   - Restart backend: Ctrl+C, then npm run start:dev
   - Retry in browser

3. Check MongoDB:
   - Should be running
   - Connection string correct in .env
```

### Problem: No Data Appears in Response

```
1. Check API was called:
   - DevTools Network tab
   - Is request there? (If no → UI not calling API)
   - Status is 200? (If not → Server error)

2. Check response is empty:
   - Click request
   - "Response" tab
   - Is it empty []? Or has data?

3. If empty:
   - Data might not exist yet
   - Run Feature 1 first (crawl data)
   - Then Feature 2 (process data)
   - Then check Feature 3
```

---

## 🎯 Quick Visual Reference

### What to See in Each Feature

```
Feature 1: CRAWL
├─ Admin Page
├─ Form: URLs, Drafts, Count
├─ Button: [Crawl and Create Drafts]
├─ Result: ✓ Success, Sources: 50, Drafts: 5
└─ DevTools: Status 200, has sources array

Feature 2: PROCESS
├─ Admin Page (same page)
├─ Form: Module, Limit, Count
├─ Button: [Process Sources]
├─ Result: ✓ Success, Processing started...
├─ Backend logs: Show AI processing happening
└─ DevTools: Status 200, has drafts array

Feature 3: USE AI
├─ Profile Page
├─ Lesson Page (with quiz)
├─ Modules Page
│
├─ DevTools shows:
│  • /api/ai-learning/recommendations → 200
│  • /api/ai-learning/learning-profile → 200
│  • /api/ai-learning/adaptive-quiz → 200
│  • /api/ai-learning/attempt/feedback → 200
│
└─ UI display:
   ✅ Admin Page: Shows recommendations, processing
   🔧 Other pages: Needs component integration
```

---

## ✨ Final Verification

| Feature | Check | Status |
|---------|-------|--------|
| 1 - Scrape | Admin page works + API 200 | ✅ Working |
| 2 - Process | Admin page works + Backend logs show processing | ✅ Working |
| 3A - Recommendations | DevTools shows API 200 with data | ✅ Working |
| 3B - Adaptive Quiz | DevTools shows "difficulty" field in response | ✅ Working |
| 3C - Feedback | DevTools shows API 200 with feedback text | ✅ Working |

**All features are backend + API ready! 🎉**

Browser display integration is in progress (normal).
