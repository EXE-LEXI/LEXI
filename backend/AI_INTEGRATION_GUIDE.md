# LEXI AI Features - Comprehensive Integration Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      LEXI AI Platform                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐         ┌──────────────────┐
│   Web Scrapers  │────────>│  Legal Documents │
│   (Vietnamese   │         │  (MongoDB)       │
│    Sources)     │         └──────────────────┘
└─────────────────┘                   │
                                      ▼
                          ┌───────────────────────┐
                          │ AI Job Processor      │
                          │ (Background Service)  │
                          └───────────────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              ▼                       ▼                       ▼
        ┌─────────────┐       ┌──────────────┐      ┌─────────────────┐
        │ Lesson      │       │ Quiz         │      │ Video Scripts   │
        │ Generation  │       │ Generation   │      │ Generation      │
        └─────────────┘       └──────────────┘      └─────────────────┘
              │                     │                       │
              └─────────────────────┼───────────────────────┘
                                    ▼
                        ┌───────────────────────┐
                        │ Lesson Drafts         │
                        │ (Admin Review)        │
                        └───────────────────────┘
                                    │
                                    ▼
                        ┌───────────────────────┐
                        │ Published Lessons     │
                        │ (User Learning)       │
                        └───────────────────────┘
                                    │
              ┌───────────────────────┼───────────────────────┐
              ▼                       ▼                       ▼
        ┌──────────────┐       ┌──────────────┐      ┌─────────────────┐
        │ Performance  │       │ Progress     │      │ Quiz Attempts   │
        │ Analysis     │       │ Tracking     │      │ & Feedback      │
        └──────────────┘       └──────────────┘      └─────────────────┘
              │                     │                       │
              └─────────────────────┼───────────────────────┘
                                    ▼
                    ┌────────────────────────────────┐
                    │  AI Recommendation Engine      │
                    │  - Personalized Paths         │
                    │  - Adaptive Difficulty        │
                    │  - Knowledge Gap Analysis     │
                    └────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
              ┌──────────────┐            ┌──────────────────┐
              │ User         │            │ Frontend          │
              │ Recommendations           │ Adaptive Quiz    │
              └──────────────┘            └──────────────────┘
```

## Complete User Journey with AI

### Phase 1: Content Creation (Admin)

```
1. Admin navigates to AI crawling endpoint
   │
   ▼
2. Vietnamese Law Crawler Service
   ├─ Crawls VnLaw.gov.vn
   ├─ Crawls LuatCaoDan.com
   └─ Crawls MOHA.gov.vn
   │
   ▼
3. Legal documents saved to MongoDB
   ├─ LegalSourceDocument records created
   ├─ Metadata extracted (document number, date, etc.)
   └─ Content normalized for processing
   │
   ▼
4. AI Job Processor detects pending tasks
   ├─ Creates AiGenerationJob for each document
   ├─ Status: PENDING
   └─ Input snapshot stored
   │
   ▼
5. Background Job runs every 5 minutes
   ├─ Fetches up to 10 pending jobs
   ├─ Updates status to RUNNING
   └─ Calls AI provider (local or API)
   │
   ▼
6. AI generates lesson package
   ├─ Lesson content (Vietnamese)
   ├─ Quiz questions (5-10 questions)
   ├─ Video script (45-60 second video)
   └─ Performance: ~30-60 seconds per lesson
   │
   ▼
7. LessonDraft created with:
   ├─ Generated content
   ├─ Status: DRAFT
   └─ Reviewer notes requesting verification
   │
   ▼
8. Admin reviews draft
   ├─ Verifies legal accuracy
   ├─ Edits if necessary
   └─ Sets status to ACCEPTED
   │
   ▼
9. Admin converts draft to published lesson
   ├─ Creates Lesson record
   ├─ Assigns to module
   ├─ Publishes with status: PUBLISHED
   └─ Available for learners
```

### Phase 2: User Learning Journey

```
1. Learner accesses learning module
   │
   ▼
2. Frontend requests personalized recommendations
   │
   GET /api/ai-learning/recommendations
   │
   ▼
3. AI Recommendation Service analyzes learner
   ├─ Fetches user progress history
   ├─ Calculates performance level
   │  ├─ Average score across all quizzes
   │  ├─ Completion rate
   │  └─ Time spent per lesson
   ├─ Identifies weak areas
   │  └─ Topics with <60% average score
   ├─ Identifies strong areas
   │  └─ Topics with >80% average score
   └─ Determines learning pace
      ├─ Fast: >1 lesson/day
      ├─ Medium: 0.3-1 lesson/day
      └─ Slow: <0.3 lesson/day
   │
   ▼
4. Generates 5 recommendations
   ├─ 50% from weak areas (improvement focus)
   ├─ 50% from next logical topics (progression)
   └─ Ranked by relevance score (0.5-1.0)
   │
   ▼
5. Returns recommendations to frontend
   │
   [
     {
       "lessonId": "...",
       "title": "...",
       "reason": "Cải thiện kỹ năng...",
       "difficulty": "medium",
       "estimatedMinutes": 25,
       "relevantScore": 0.85
     }
   ]
   │
   ▼
6. Learner selects a lesson
   │
   ▼
7. Frontend requests adaptive quiz
   │
   GET /api/ai-learning/adaptive-quiz/:lessonId
   │
   ▼
8. AI Enhanced Learning Service
   ├─ Gets user's performance level for this lesson
   ├─ Adjusts question difficulty
   │  ├─ Beginner: Easy questions, simpler concepts
   │  ├─ Intermediate: Medium difficulty
   │  └─ Advanced: Hard questions, edge cases
   ├─ Orders questions strategically
   │  └─ Start with easier, progress to harder
   └─ Prepares hints for each question
   │
   ▼
9. Learner completes quiz
   ├─ Selects answers
   └─ Submits attempt
   │
   ▼
10. LessonAttempt recorded with:
    ├─ Score
    ├─ Time spent
    ├─ Answers selected
    └─ Correctness for each answer
    │
    ▼
11. Frontend requests performance feedback
    │
    GET /api/ai-learning/attempt/:attemptId/feedback
    │
    ▼
12. AI generates personalized feedback
    ├─ Calculates score percentage
    ├─ Identifies which questions were missed
    ├─ Generates strengths list
    │  └─ "Hiểu rõ nội dung pháp luật"
    ├─ Generates improvement areas
    │  └─ "Cần ôn luyện lại chi tiết..."
    ├─ Suggests next steps
    │  ├─ "Xem lại nội dung"
    │  └─ "Làm bài kiểm tra lại sau 1-2 ngày"
    └─ Provides motivational message
    │
    ▼
13. Learner views feedback
    ├─ Overall assessment
    ├─ Specific areas to improve
    └─ Next recommended actions
    │
    ▼
14. Frontend requests learning path
    │
    GET /api/ai-learning/learning-path
    │
    ▼
15. AI generates personalized learning path
    ├─ Current phase: Căn bản/Trung cấp/Nâng cao
    ├─ Milestones with progress tracking
    ├─ Next recommended topics (3-5 topics)
    └─ Estimated completion time
    │
    ▼
16. Learner continues with recommended next lesson
    └─ Cycle repeats with updated AI analysis
```

## Key Features in Action

### 1. Intelligent Content Recommendation

**Input:** User's learning history
```json
{
  "completedLessons": 12,
  "averageScore": 78,
  "attemptedTopics": ["Civil Law", "Labor Law"],
  "failedAttempts": [2, 5, 8],
  "timeSpent": { "min": 10, "max": 45, "avg": 25 }
}
```

**Process:**
1. Analyze performance by topic
2. Identify weak areas (score < 60%)
3. Identify strong areas (score > 80%)
4. Determine next logical progression
5. Score recommendations by relevance
6. Sort and return top N

**Output:** Ranked recommendations with reasons

### 2. Adaptive Quiz Difficulty

**Input:** User's performance level for a lesson
- Beginner: <60% average score
- Intermediate: 60-80% average score
- Advanced: >80% average score

**Process:**
1. Get all questions for the lesson
2. Filter by difficulty level
3. Order questions strategically
4. Prepare hints
5. Return adaptive question set

**Output:** Quiz tailored to user's skill level

### 3. Performance Analysis

**Input:** Quiz attempt with answers
```json
{
  "totalQuestions": 5,
  "correctAnswers": 4,
  "timeSpent": 180,
  "incorrectQuestions": [3]
}
```

**Process:**
1. Calculate score percentage (80%)
2. Identify strengths
3. Identify improvement areas
4. Generate next steps
5. Create motivational message

**Output:** Detailed feedback and recommendations

### 4. Learning Pattern Analysis

**Input:** Last 30 learning attempts
```
2024-05-01 10:00 - Lesson 1 - 90%
2024-05-02 14:30 - Lesson 2 - 75%
2024-05-03 10:15 - Lesson 3 - 85%
...
```

**Process:**
1. Extract time information (hour of day)
2. Count activities by hour
3. Find peak learning hours
4. Determine consistency
5. Suggest optimal schedule

**Output:** Best times to study + frequency recommendation

## Data Models Integration

### LegalSourceDocument
```typescript
{
  id: string;
  title: string;
  sourceUrl: string;
  legalDocumentNo?: string; // e.g., "91/2015/QH13"
  effectiveDate?: Date;
  rawText: string;
  normalizedText: string;
  contentHash?: string;
  crawlStatus: "PENDING" | "CRAWLED" | "FAILED";
  crawledAt?: Date;
}
```

### AiGenerationJob
```typescript
{
  id: string;
  sourceDocumentId: string;
  targetModuleId?: string;
  type: "LESSON" | "QUIZ" | "VIDEO_SCRIPT" | "FULL_LESSON_PACKAGE";
  status: "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELLED";
  promptVersion: string;
  model: string;
  inputSnapshot: Json;
  output: Json;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### LessonDraft
```typescript
{
  id: string;
  generationJobId?: string;
  sourceDocumentId: string;
  moduleId?: string;
  createdLessonId?: string;
  title: string;
  content: string;
  videoScript?: string;
  videoPrompt?: string;
  reviewerNote?: string;
  status: "DRAFT" | "IN_REVIEW" | "ACCEPTED" | "REJECTED";
  questions: LessonDraftQuestion[];
}
```

## API Workflow Examples

### Example 1: Admin Creates Lessons from Vietnamese Laws

```bash
# Step 1: Crawl legal sources
curl -X GET "http://localhost:3000/api/ai-learning/admin/legal-sources?source=VNLAW&limit=50" \
  -H "Authorization: Bearer <admin_token>"

# Step 2: Extract metadata
curl -X POST "http://localhost:3000/api/ai-learning/admin/legal-metadata" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{"url": "https://luatcaodanvietnam.com/..."}'

# Step 3: Batch generate drafts
curl -X POST "http://localhost:3000/api/ai-learning/admin/batch-generate-drafts" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "sourceIds": ["source1", "source2", "source3"],
    "moduleId": "module123",
    "questionCount": 5
  }'

# Step 4: Monitor job status
curl -X GET "http://localhost:3000/api/ai-learning/admin/job/job1/status" \
  -H "Authorization: Bearer <admin_token>"

# Step 5: Review drafts via existing admin endpoints
# GET /admin/ai/lesson-drafts
# PATCH /admin/ai/lesson-drafts/:draftId
# POST /admin/ai/lesson-drafts/:draftId/create-lesson
```

### Example 2: Learner Gets Personalized Learning Path

```bash
# Get recommendations
curl -X GET "http://localhost:3000/api/ai-learning/recommendations?limit=5" \
  -H "Authorization: Bearer <user_token>"

# Get learning profile
curl -X GET "http://localhost:3000/api/ai-learning/learning-profile" \
  -H "Authorization: Bearer <user_token>"

# Get learning path
curl -X GET "http://localhost:3000/api/ai-learning/learning-path" \
  -H "Authorization: Bearer <user_token>"

# Get adaptive quiz
curl -X GET "http://localhost:3000/api/ai-learning/adaptive-quiz/lesson123?count=5" \
  -H "Authorization: Bearer <user_token>"

# Get feedback after quiz
curl -X GET "http://localhost:3000/api/ai-learning/attempt/attempt123/feedback" \
  -H "Authorization: Bearer <user_token>"

# Get learning patterns
curl -X GET "http://localhost:3000/api/ai-learning/learning-patterns" \
  -H "Authorization: Bearer <user_token>"
```

## Performance Metrics

Expected system performance:

- **AI Job Processing**: 30-60 seconds per lesson (local model)
- **Recommendation Generation**: <500ms for most users
- **Adaptive Quiz Preparation**: <200ms
- **Feedback Generation**: <300ms
- **Pattern Analysis**: <1 second

Database operations optimized with indexes on:
- `LegalSourceDocument.crawlStatus`
- `AiGenerationJob.status`
- `UserProgress.userId, status`
- `LessonAttempt.userId, lessonId`

## Security Considerations

1. **Authentication**: All AI endpoints require JWT token
2. **Authorization**: 
   - Learners: Can access recommendations, adaptive learning
   - Admin: Can access crawling, job processing, batch operations
3. **Rate Limiting**: Recommended limits:
   - Recommendations: 10 requests/minute per user
   - Job status checks: 30 requests/minute per admin
4. **Data Privacy**: 
   - User learning data is private to that user
   - Aggregated data for recommendations doesn't expose individual details

## Monitoring & Logging

Monitor these metrics:
1. **AI Job Status**: 
   - Pending jobs count
   - Success rate
   - Average processing time
   - Error rate
2. **Recommendation Quality**:
   - User engagement with recommendations
   - Recommendation relevance feedback
3. **System Health**:
   - API response times
   - Database query performance
   - Job processor uptime

## Troubleshooting

Common issues and solutions:

1. **Jobs stuck in RUNNING status**
   - Check AI provider availability
   - Verify API key configuration
   - Check job processor logs

2. **Recommendations seem irrelevant**
   - Ensure sufficient user history (>5 attempts)
   - Check AI recommendation service logs
   - Verify learning profile calculation

3. **Adaptive quiz not adjusting**
   - Verify user performance data exists
   - Check LessonAttempt records
   - Ensure difficulty scoring logic

## Next Steps

1. Configure AI provider (OpenAI, Anthropic, or local)
2. Set environment variables (.env.ai.example → .env)
3. Deploy and test all endpoints
4. Monitor system performance
5. Gather user feedback on recommendations
6. Iterate and improve based on feedback
