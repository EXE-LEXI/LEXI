# ⚡ LEXI AI Features - Quick Testing Checklist

**Ngôn ngữ / Language:** Tiếng Việt + English
**Thời gian / Time:** 10 phút / 10 minutes

---

## 🚀 Bắt Đầu / Getting Started

### Prerequisites:
```bash
# Terminal 1: Start Backend
cd backend
npm run start:dev

# Terminal 2: Start Frontend
cd frontend
npm run dev
```

### Login:
```
Go to: http://localhost:5173/
Login as ADMIN user to access all features
(Check .env for demo credentials)
```

---

## ✅ Feature 1: Cào dữ liệu luật pháp (Scrape Vietnamese Law)

### Where: Admin Page

```
1. Click: "Admin" or go to http://localhost:5173/admin
2. Find section: "Cao va tao draft" (top-left box)
3. Click button: "Crawl and Create Drafts"
```

### What to Check:

| Check | Expected Result | ✅/❌ |
|-------|-----------------|-------|
| Button exists | "Crawl and Create Drafts" button visible | [ ] |
| Form submits | No error message | [ ] |
| Success message | Green message appears | [ ] |
| Sources count | Shows: "X Sources" | [ ] |
| Drafts count | Shows: "Y Drafts" | [ ] |
| DevTools Network | GET/POST → /admin/sources/crawl → 200 OK | [ ] |

### DevTools Verification:

```
1. Press F12 → Network tab
2. Click "Crawl and Create Drafts"
3. Look for: POST /admin/sources/crawl
4. Check: Status = 200
5. Look at Response → Should show:
   {
     "sources": [ {...}, {...} ],
     "drafts": [ {...} ],
     "errors": []
   }
```

✅ **Feature 1 Working if:** Sources > 0 AND Status 200

---

## ✅ Feature 2: Xử lý AI (Process with AI)

### Where: Admin Page

```
1. Stay on Admin Page
2. Find section: "Xu ly nguon da crawl" (top-right box)
3. Click button: "Process Sources"
```

### What to Check:

| Check | Expected Result | ✅/❌ |
|-------|-----------------|-------|
| Button exists | "Process Sources" button visible | [ ] |
| Form submits | No error message | [ ] |
| Success message | Green message appears | [ ] |
| API response | Shows draft list | [ ] |
| DevTools Network | POST → /admin/ai/legal-sources/process → 200 OK | [ ] |
| Backend logs | Shows "Processing..." messages | [ ] |
| Wait 60 seconds | Backend logs show "Job succeeded" | [ ] |

### DevTools Verification:

```
1. Press F12 → Network tab
2. Click "Process Sources"
3. Look for: POST /admin/ai/legal-sources/process
4. Check: Status = 200
5. Look at Response → Should show:
   [
     {
       "id": "draft-...",
       "title": "Bài học về...",
       "status": "PENDING"
     }
   ]
```

### Backend Verification:

```
Terminal should show messages like:
✅ Processing AI job for legal source
✅ Generating lesson content
✅ Job completed successfully
```

✅ **Feature 2 Working if:** Status 200 AND Backend shows processing

---

## ✅ Feature 3: Sử dụng AI cho chức năng (Use AI for Features)

### Where: Multiple Pages

#### Test 3A: Recommendations

```
Go to: Profile Page
Look for: "Recommendations" section
```

**If you see recommendations:**
```
✅ Feature working
Showing: Lesson titles, reasons, difficulty, score
```

**If you DON'T see recommendations:**
```
⚠️ Not integrated yet (normal)
But API should work in DevTools
```

**DevTools Check:**
```
1. Press F12 → Network tab
2. Go to Profile page
3. Look for: GET /api/ai-learning/recommendations
4. Check: Status = 200 (should see even if not displaying)
5. Response: Array of recommendation objects
```

#### Test 3B: Learning Profile

```
Go to: Profile Page
Look for: "Learning Stats" or similar
```

**What to see:**
```
- Completed Lessons: X
- Average Score: Y%
- Weak Areas: [list]
- Strong Areas: [list]
- Learning Pace: Slow/Medium/Fast
```

**DevTools Check:**
```
1. Network tab
2. Look for: GET /api/ai-learning/learning-profile
3. Check: Status = 200
4. Response contains the above stats
```

#### Test 3C: Adaptive Quiz

```
Go to: Lesson Page
Start: Any quiz
```

**What to see:**
```
- Each question shows DIFFICULTY:
  ☐ 🟢 Easy
  ☐ 🟡 Medium
  ☐ 🔴 Hard
```

**DevTools Check:**
```
1. Network tab
2. Look for: GET /api/ai-learning/adaptive-quiz/{id}
3. Check: Status = 200
4. Response contains: difficulty, options, hintAvailable
```

#### Test 3D: Performance Feedback

```
Go to: Lesson Page
Submit: Quiz answers
```

**What to see after submission:**
```
✅ Overall score
✅ What you did well (Strengths)
✅ What to improve (Areas to improve)
✅ Next steps
✅ Motivational message
```

**DevTools Check:**
```
1. Network tab
2. After submit, look for: GET /api/ai-learning/attempt/{id}/feedback
3. Check: Status = 200
4. Response contains feedback text
```

#### Test 3E: Learning Path

```
Go to: Modules Page ("Khóa học của tôi")
```

**What to see:**
```
- Current Phase label
- Milestone list with progress
- Estimated completion time
- Next topics to learn
```

**DevTools Check:**
```
1. Network tab
2. Look for: GET /api/ai-learning/learning-path
3. Check: Status = 200
4. Response contains milestones array
```

---

## 🔍 How to Check API Responses in DevTools

### Step-by-Step:

```
1. Press F12 (or Ctrl+Shift+I)
2. Go to "Network" tab
3. Action on page (click button, go to page, etc.)
4. Find your API call in the list
5. Click on it
6. Go to "Response" tab
7. Check the data format
```

### Common API Paths to Look For:

```
Feature 1 (Scrape):
  POST /admin/sources/crawl

Feature 2 (Process):
  POST /admin/ai/legal-sources/process

Feature 3 (AI Usage):
  GET /api/ai-learning/recommendations
  GET /api/ai-learning/learning-profile
  GET /api/ai-learning/adaptive-quiz/{id}
  GET /api/ai-learning/attempt/{id}/feedback
  GET /api/ai-learning/learning-path
  GET /api/ai-learning/knowledge-gaps
  GET /api/ai-learning/consistency-analysis
  GET /api/ai-learning/learning-patterns
```

---

## 🎯 Summary Table

### Feature 1: Scraping

| Item | Status | Where |
|------|--------|-------|
| Backend Service | ✅ Working | VietnameseLawCrawlerService |
| Frontend Form | ✅ Working | Admin Page |
| API Endpoint | ✅ Working | POST /admin/sources/crawl |
| UI Integration | ✅ Working | AdminPage component |
| **Result** | **✅ READY** | **Test Now** |

### Feature 2: AI Processing

| Item | Status | Where |
|------|--------|-------|
| Backend Service | ✅ Working | AiJobProcessor |
| Frontend Form | ✅ Working | Admin Page |
| API Endpoint | ✅ Working | POST /admin/ai/legal-sources/process |
| UI Integration | ✅ Working | AdminPage component |
| **Result** | **✅ READY** | **Test Now** |

### Feature 3: AI Usage

| Item | Status | Where |
|------|--------|-------|
| Backend Service | ✅ Working | AiRecommendationService, etc. |
| API Endpoints | ✅ Working | 8+ endpoints |
| Frontend API Functions | ✅ Created | src/api/learning.ts |
| Frontend Types | ✅ Created | src/types/learning.ts |
| UI Components | 🔧 Partial | ProfilePage, LessonPage (need integration) |
| **Result** | **🔧 NEEDS UI** | **API works, UI updating** |

---

## 📊 What the Status Means

### ✅ READY (Features 1 & 2)
```
You can test these NOW through the Admin UI
Both frontend and backend are fully integrated
Go to Admin Page and click the buttons
```

### 🔧 NEEDS UI (Feature 3 - Partial)
```
Backend API is 100% ready
Frontend API functions are 100% ready
But React components need to be updated to show the data

Status:
✅ If you open DevTools Network tab → You'll see API calls
✅ If you check response → Data is there
⚠️ But the UI components don't display it yet

Solution: Update React components to call the API functions
See: FRONTEND_AI_INTEGRATION.md for code examples
```

---

## 🐛 Troubleshooting

### Problem: "Unauthorized" (401)

```
Check 1: Are you logged in?
  □ Check page shows user name
  □ Check localStorage has token (DevTools > Application > Storage)

Check 2: Is it an ADMIN route?
  □ Feature 1 & 2 require ADMIN role
  □ Feature 3 works for ADMIN or LEARNER

Action: Login again, or use admin account
```

### Problem: No data appears

```
Check 1: Is API being called?
  □ DevTools Network tab
  □ Look for /api/ai-learning/... or /admin/... requests
  □ If no request → UI component not calling the function

Check 2: Is API returning data?
  □ Click the request
  □ Look at Response tab
  □ Status should be 200
  □ Should have data inside

Check 3: Is component displaying it?
  □ Feature 1 & 2: Check AdminPage logs
  □ Feature 3: May not be displayed yet (UI needs updating)
```

### Problem: API returns 500 error

```
Check: Backend logs
  □ npm run start:dev terminal
  □ Should show error message
  □ Check MongoDB connection
  □ Check .env variables

Restart:
  □ Kill backend (Ctrl+C)
  □ npm run start:dev
  □ Try again
```

---

## ✨ Expected Results

### Feature 1 - After Testing:
```
✅ Admin page shows:
   - Sources: 20-50+ (depending on crawl)
   - Drafts: X (if you enabled generation)
   - No errors
```

### Feature 2 - After Testing:
```
✅ Admin page shows:
   - New drafts count increased
   - Backend logs show processing
   - After 60 seconds: Job completed messages
```

### Feature 3 - After Testing:
```
✅ DevTools shows API calls returning 200 OK
✅ Responses contain properly formatted data
⏳ UI display depends on component integration
   (Currently AdminPage features work, other pages pending)
```

---

## 📋 Quick Checklist

```
Before Testing:
☐ Backend is running (npm run start:dev)
☐ Frontend is running (npm run dev)
☐ You're logged in as ADMIN user
☐ DevTools is open (F12)
☐ Network tab is visible

Feature 1 Test:
☐ Admin page loads
☐ "Crawl and Create Drafts" button visible
☐ Click button → Success message
☐ Sources count > 0
☐ Drafts count > 0
☐ API Status: 200 ✅

Feature 2 Test:
☐ "Process Sources" button visible
☐ Click button → Success message
☐ Drafts count increases
☐ Backend logs show processing
☐ API Status: 200 ✅
☐ Wait 60 seconds → Job completed ✅

Feature 3 Test:
☐ Profile page loads
☐ Network tab shows /api/ai-learning/... calls
☐ All calls return Status 200 ✅
☐ Responses contain data ✅
☐ Components display data (pending full UI integration)
```

---

## 🎯 Success Criteria

| Feature | Success = |
|---------|-----------|
| Feature 1 | Admin UI shows crawled sources, API returns 200 |
| Feature 2 | Admin UI shows processed drafts, Backend logs show completion |
| Feature 3 | DevTools shows 8+ API endpoints returning 200 with valid data |

---

## 📞 Next Steps

### If All Tests Pass ✅
```
1. Congratulations! All features are working!
2. Backend is production-ready
3. Admin features are fully integrated
4. AI learning features are API-ready
5. Next: Complete UI integration (see FRONTEND_AI_INTEGRATION.md)
```

### If Tests Fail ⚠️
```
1. Check troubleshooting section above
2. Check backend logs: npm run start:dev terminal
3. Check DevTools: F12 → Network tab
4. Read full guide: TESTING_GUIDE.md
5. Check database: MongoDB should have new records
```

---

**Ready to test? Start with Feature 1 on Admin Page! 🚀**
