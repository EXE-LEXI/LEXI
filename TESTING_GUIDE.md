# LEXI AI Features - Testing Guide

**Ngôn ngữ / Language:** Vietnamese & English
**Mục đích / Purpose:** Hướng dẫn kiểm tra xem các tính năng AI đã hoạt động trong giao diện / Guide to verify AI features are working in the UI

---

## 📋 Tổng Quan / Overview

Có 3 tính năng AI chính để kiểm tra:

| # | Tính năng / Feature | Vị trí kiểm tra / Test Location | Endpoint | Status |
|---|---|---|---|---|
| 1 | **Cào dữ liệu luật pháp** / Scrape Vietnamese Law Data | Admin Page → "Cao va tao draft" | POST `/admin/sources/crawl` | ✅ Ready |
| 2 | **Xử lý dữ liệu bằng AI** / AI Data Processing | Admin Page → "Xu ly nguon da crawl" | POST `/admin/ai/legal-sources/process` | ✅ Ready |
| 3 | **Sử dụng dữ liệu cho tất cả chức năng** / Use AI for All Features | Profile, Lesson, Modules Pages | Multiple endpoints | 🔧 Needs Integration |

---

## ✅ Testing Feature 1: Cào dữ liệu luật pháp Việt Nam

**Tính năng / Feature:** Scrape Vietnamese Law Data
**Vị trí / Location:** Admin Page (Dieu hanh noi dung)

### 🎯 Steps to Test:

#### Step 1: Go to Admin Page
```
1. Open the app → Click "Admin" (if you're an ADMIN user)
   OR navigate directly to: http://localhost:5173/admin
2. You should see: "Dieu hanh noi dung" page
3. Look for section: "Cao va tao draft" (Crawl and Create Draft)
```

#### Step 2: Fill Crawl Form
```
- Form should show:
  ☐ URLs (enter Vietnamese law website URLs, or use examples below)
  ☐ Module ID (optional)
  ☐ Generate Drafts (optional checkbox)
  ☐ Question Count (e.g., 3, 5, 10)
  
- Click button: "Crawl and Create Drafts"
```

#### Step 3: Monitor Request in Browser DevTools
```
1. Open DevTools → Network tab (F12)
2. Submit the form
3. You should see a POST request:
   - URL: /admin/sources/crawl
   - Status: 200 OK
   - Response should contain:
     {
       "sources": [
         {
           "id": "...",
           "title": "Law on Labor Code 2012",
           "documentNo": "...",
           "crawlStatus": "COMPLETED",
           "updatedAt": "2026-05-30T..."
         }
       ],
       "drafts": [...],
       "errors": []
     }
```

#### Step 4: Verify Results
```
The page should show:
- ✅ Green success message
- 📊 Stats showing:
  • Sources: X (number of documents crawled)
  • Drafts: Y (number of drafts created)
  • Errors: Z (any errors)
```

#### Step 5: Check MongoDB (Optional - Advanced)
```
If you have MongoDB access:
1. Connect to MongoDB database
2. Check collection: LegalSourceDocument
3. Should see new records with:
   - title (Vietnamese law name)
   - source (origin URL)
   - crawlStatus: "COMPLETED" or "PENDING"
   - content (full legal text)
```

### 📝 Sample Test Data:
```
Example URLs to test (or leave empty for fallback):
- https://luatcaodanvietnam.com/
- https://vnlaw.gov.vn/
- https://moj.gov.vn/

If websites are unreachable:
✅ Service uses fallback → Returns hardcoded Vietnamese laws
✅ Crawl still succeeds with sample data
```

### 🔍 What to Look For:
- ✅ No 401 Unauthorized error
- ✅ Response includes at least 4+ documents
- ✅ Each document has: title, source, crawlStatus
- ✅ Drafts count > 0 (if generateDrafts=true)
- ✅ Success message appears on page

---

## ⚙️ Testing Feature 2: Xử lý dữ liệu bằng AI

**Tính năng / Feature:** AI Data Processing & Save to MongoDB
**Vị trí / Location:** Admin Page → "Xu ly nguon da crawl" section

### 🎯 Steps to Test:

#### Step 1: Ensure Data is Crawled
```
First, complete Testing Feature 1 above
(Crawl must happen before processing)
```

#### Step 2: Go to Process Section
```
1. Stay on Admin Page
2. Scroll down to: "Xu ly nguon da crawl" section
   (Process Crawled Sources)
3. Form should show:
   ☐ Module ID (optional)
   ☐ Limit (number of sources to process)
   ☐ Question Count (for quiz generation)
   
4. Click button: "Process Sources"
```

#### Step 3: Monitor Processing in DevTools
```
1. Open DevTools → Network tab
2. Submit the form
3. You should see POST request:
   - URL: /admin/ai/legal-sources/process
   - Status: 200 OK
   - Response: Array of lesson drafts
   
   Example response:
   [
     {
       "id": "draft-123",
       "title": "Bài học về Luật Lao động",
       "status": "PENDING",  // or "PROCESSING"
       "source": {
         "title": "Law on Labor Code 2012"
       },
       "createdAt": "2026-05-30T..."
     }
   ]
```

#### Step 4: Verify AI Processing Happened
```
1. Check page shows: "Drafts: X" (should increase after processing)
2. Backend is now processing in background:
   - Job Processor runs every 5 minutes
   - Check logs for processing status
   - Monitor: LessonDraft collection in MongoDB
```

#### Step 5: Check Backend Logs
```
Backend logs should show:
✅ "Processing AI job for legal source: ..."
✅ "Generating lesson content..."
✅ "Job completed successfully" (after 30-60 seconds)
✅ "LessonDraft created with ID: ..."
```

#### Step 6: Verify MongoDB (Optional)
```
In MongoDB:
1. Check collection: AiGenerationJob
   - Should see records with status: "SUCCEEDED"
   - progress: 100
   
2. Check collection: LessonDraft
   - Should see new drafts
   - title: Auto-generated lesson title
   - content: AI-generated lesson content
   - quizzes: AI-generated quiz questions
```

### 🔍 What to Look For:
- ✅ No 401 Unauthorized error
- ✅ Response includes array of drafts
- ✅ Each draft has status (PENDING/PROCESSING/SUCCEEDED)
- ✅ Backend logs show processing happening
- ✅ New records appear in MongoDB within 60 seconds

### ⏱️ Timing:
```
- Initial response: ~1 second (creates job)
- AI processing: 30-60 seconds (depends on content size)
- Total time to completion: ~2 minutes
```

---

## 🧠 Testing Feature 3: Sử dụng dữ liệu cho tất cả chức năng

**Tính năng / Feature:** Use AI for Personalized Learning Features
**Vị trí / Location:** Profile, Lesson, Modules Pages

### 🎯 Features to Verify:

| Feature | Location | What to Look For |
|---------|----------|------------------|
| **Personalized Recommendations** | Profile Page | List of 5 recommended lessons |
| **Learning Profile** | Profile Page | Stats: completed lessons, avg score, weak areas |
| **Adaptive Quiz** | Lesson Page | Questions with difficulty levels (easy/medium/hard) |
| **Learning Path** | Modules Page | Roadmap with milestones and progress |
| **Performance Feedback** | Lesson Page (after quiz) | Feedback on strengths & areas to improve |
| **Knowledge Gaps** | Profile Page | Topics user needs to improve |
| **Learning Consistency** | Profile Page | Study streak and consistency score |
| **Learning Patterns** | Profile Page | Best times to study, recommended duration |

### 🎯 Step 1: Test Personalized Recommendations

#### Go to Profile Page:
```
1. Open app → Click Profile
   OR go to: http://localhost:5173/profile
2. Look for section: "AI Recommendations" or similar
```

#### Verify Data:
```
You should see a list showing:
- Lesson Title (e.g., "Bài học về Luật Lao động")
- Reason (why it's recommended)
- Difficulty (beginner/intermediate/advanced)
- Estimated Minutes (study time)
- Relevant Score (0-100%)

If you DON'T see this:
⚠️ Feature not yet integrated into ProfilePage component
```

#### Check DevTools:
```
1. Open DevTools → Network tab
2. Look for request: GET /api/ai-learning/recommendations
3. Status should be: 200 OK
4. Response should show array of recommendations

If no request:
⚠️ ProfilePage not calling getRecommendations() function
✅ Solution: See "Frontend Integration Steps" below
```

### 🎯 Step 2: Test Learning Profile

#### Look for Section:
```
Profile Page → Section with user statistics showing:
- Total Completed Lessons: X
- Average Score: Y%
- Weak Areas: [List of topics]
- Strong Areas: [List of topics]
- Learning Pace: Slow/Medium/Fast
```

#### Check DevTools:
```
1. Network tab
2. Look for: GET /api/ai-learning/learning-profile
3. Response should contain:
   {
     "userId": "...",
     "completedLessonsCount": 42,
     "averageScore": 78.5,
     "weakAreas": ["Contract Law", "Tax Law"],
     "strongAreas": ["Criminal Law"],
     "learningPace": "medium",
     "recommendedNextTopics": [...]
   }
```

### 🎯 Step 3: Test Adaptive Quiz

#### Go to Lesson Page:
```
1. Click any lesson from Modules page
2. Go to Lesson Page
3. Start quiz
```

#### Look for Difficulty Indicators:
```
Each quiz question should show:
- Question text
- ✅ Difficulty badge: "Easy", "Medium", or "Hard"
- Answer options
- [Get Hint] button (if available)
- [Next Question] button
```

#### Check DevTools:
```
1. Network tab
2. When you load quiz, look for: 
   GET /api/ai-learning/adaptive-quiz/{lessonId}
3. Response should show:
   {
     "questionId": "q123",
     "questionText": "Question here",
     "difficulty": "easy",  // or "medium" or "hard"
     "options": [...],
     "hintAvailable": true
   }
```

### 🎯 Step 4: Test Learning Path

#### Go to Modules Page:
```
1. Open app → Click "Khóa học của tôi" (My Courses)
2. Should show learning roadmap
```

#### Look for:
```
- Current Phase label (e.g., "Phase 1: Fundamentals")
- Milestone list with progress bars
- Estimated Completion Date (e.g., "30 days")
- Next Topics to Learn
- Progress percentage for each milestone
```

#### Check DevTools:
```
1. Network tab
2. Look for: GET /api/ai-learning/learning-path
3. Response:
   {
     "userId": "...",
     "currentPhase": "Phase 1: Fundamentals",
     "completedTopics": ["Constitutional Law"],
     "nextTopics": ["Civil Law", "Criminal Law"],
     "estimatedCompletionDays": 30,
     "milestones": [
       {
         "name": "Complete 10 lessons",
         "completed": true,
         "progress": 100
       }
     ]
   }
```

### 🎯 Step 5: Test Performance Feedback

#### Go to Lesson Page and Submit Quiz:
```
1. Take a lesson quiz
2. Submit your answers
3. After submission, look for feedback section
```

#### Feedback Should Show:
```
✅ Overall Performance Score
✅ Your Strengths: [topics you did well in]
✅ Areas to Improve: [topics needing work]
✅ Next Steps: [recommended actions]
✅ Motivational Message: [encouraging text]

Example:
"Great job! You scored 85%. 
Strengths: Contract interpretation, legal analysis
Areas to improve: Statute reading, case law application
Next steps: Review statutes in Module 3"
```

#### Check DevTools:
```
1. Network tab
2. After submitting quiz, look for:
   GET /api/ai-learning/attempt/{attemptId}/feedback
3. Response should include feedback data
```

### 🎯 Step 6: Test Knowledge Gaps

#### Look for Section:
```
Profile Page → "Knowledge Gaps" or "Topics to Improve"

Should show:
- Topic/Gap Name
- Related Topics
- Suggested Lessons
- Progress towards closing gap
```

#### Check DevTools:
```
Network tab → GET /api/ai-learning/knowledge-gaps
Response:
[
  {
    "gap": "Contract Drafting",
    "relatedTopics": ["Contract Law", "Legal Writing"],
    "suggestedLessons": ["lesson-123", "lesson-456"]
  }
]
```

---

## 🔧 Frontend Integration Status

### Currently Working ✅:
```
✅ Backend endpoints: All 21 endpoints functional
✅ API wrapper functions: All 11 functions created
✅ TypeScript types: All 11 interfaces defined
✅ Admin Page: Crawl and Process features working
```

### Needs Integration 🔧:
```
🔧 ProfilePage: Should show recommendations + learning profile
🔧 LessonPage: Should show adaptive quiz + performance feedback
🔧 ModulesPage: Should show learning path
🔧 Dashboard: Should show knowledge gaps + learning patterns
```

### How to Complete Integration:
```
See: FRONTEND_AI_INTEGRATION.md
For code examples on how to integrate each feature
```

---

## 🛠️ Debugging Checklist

### If You See "Unauthorized" (401):
```
☐ Check token in localStorage:
  - Open DevTools → Application tab
  - Look for: localStorage.getItem('lexi.auth')
  - Should show: {"accessToken": "eyJ...", ...}
  
☐ Check token is valid:
  - Go to https://jwt.io
  - Paste token (without "Bearer")
  - Should not show "Invalid signature"
  
☐ Check API includes token:
  - Network tab → API call
  - Headers should include: Authorization: Bearer eyJ...
  
☐ Check user role:
  - User must have role: ADMIN or LEARNER
  - Check in database or token payload
```

### If No Data Appears:
```
☐ Check API call exists in Network tab
  - If no call: Feature not integrated yet (see 🔧 above)
  
☐ Check response status:
  - 200: Data should appear (if component integrated)
  - 404: Endpoint not found
  - 500: Server error (check backend logs)
  
☐ Check backend logs:
  - npm run start:dev
  - Should see: "GET /api/ai-learning/..."
  - Check for error messages
  
☐ Check MongoDB connection:
  - Verify MongoDB is running
  - Check .env has correct MONGODB_URI
```

### If Data Appears But Wrong:
```
☐ Check response format matches interface:
  - DevTools → Network tab → Response
  - Compare with type definitions in types/learning.ts
  
☐ Check AI processing happened:
  - Backend logs should show processing
  - Check MongoDB for recent updates
  - Job status should be: SUCCEEDED
```

---

## 📊 Monitoring Dashboard (For Developers)

### Backend Logs to Watch:
```bash
# When crawling:
[DEBUG] Crawling legal source: https://vnlaw.gov.vn
[DEBUG] Found 50 documents
[INFO] Crawl completed successfully

# When processing:
[DEBUG] Processing AI job: job-123
[DEBUG] Generating lesson content for: Law on Labor Code
[INFO] Job succeeded: draft-456 created
[DEBUG] Saved LessonDraft to MongoDB

# Every 5 minutes:
[DEBUG] Running AI job processor
[DEBUG] Found 2 pending jobs
[DEBUG] Processing jobs...
```

### Database to Check:
```
MongoDB Collections:
├── LegalSourceDocument (crawled laws)
├── AiGenerationJob (processing status)
├── LessonDraft (generated content)
├── Lesson (published lessons)
└── UserProgress (learning stats)
```

---

## 📋 Complete Testing Checklist

### Feature 1: Scraping ✅
- [ ] Admin page loads
- [ ] Crawl form visible
- [ ] Form submits successfully
- [ ] API request shows 200 OK
- [ ] Sources count > 0
- [ ] Drafts count > 0 (if enabled)
- [ ] MongoDB shows new LegalSourceDocument records

### Feature 2: AI Processing ✅
- [ ] Process form visible
- [ ] Form submits successfully
- [ ] API request shows 200 OK
- [ ] Drafts count increases
- [ ] Backend logs show processing
- [ ] MongoDB shows AiGenerationJob with status SUCCEEDED
- [ ] MongoDB shows new LessonDraft records

### Feature 3: AI Usage 🔧
- [ ] Profile page shows recommendations (after integration)
- [ ] Profile page shows learning profile (after integration)
- [ ] Lesson page shows adaptive quiz difficulty (after integration)
- [ ] Lesson page shows performance feedback (after integration)
- [ ] Modules page shows learning path (after integration)
- [ ] All API calls return 200 OK (after integration)
- [ ] All data displays correctly (after integration)

---

## 🚀 Quick Test Scenario

### Complete End-to-End Test (15 minutes):

```
1. Login as ADMIN user [2 min]
2. Go to Admin Page [1 min]
3. Test Feature 1: Click "Crawl and Create Drafts" [2 min]
   - Wait for success message
   - Verify stats show sources/drafts
4. Test Feature 2: Click "Process Sources" [2 min]
   - Wait for success message
   - Check backend logs
5. Test Feature 3: Go to Profile as LEARNER [3 min]
   - Look for recommendations (if integrated)
   - Look for learning stats
   - Check Network tab for API calls
6. Go to Lesson Page [3 min]
   - Start quiz
   - Look for difficulty badge
   - Submit quiz
   - Look for feedback section

Total Time: ~15-20 minutes
```

---

## 📞 Need Help?

### Common Issues:

| Problem | Solution |
|---------|----------|
| 401 Unauthorized | Check localStorage token exists and is valid |
| No data appears | Check if component integrated (see FRONTEND_AI_INTEGRATION.md) |
| API request fails | Check backend logs, verify endpoint path |
| MongoDB errors | Check connection string in .env |
| Processing slow | Normal (30-60 sec). Check backend logs. |

### Files to Check:
- Backend logs: `npm run start:dev`
- API responses: DevTools → Network tab
- Database: MongoDB GUI
- Component code: `src/pages/*.tsx`
- API functions: `src/api/learning.ts`
- Types: `src/types/learning.ts`

---

## ✨ Summary

You now know:
1. ✅ **Where to test** each feature (Admin Page, Profile, etc.)
2. ✅ **What to look for** (stats, API responses, database records)
3. ✅ **How to verify** using DevTools and backend logs
4. ✅ **What's working** (Backend + Admin features)
5. ✅ **What needs integration** (Profile/Lesson/Modules pages)

**Next Step:** See FRONTEND_AI_INTEGRATION.md for code examples to complete the integration!
