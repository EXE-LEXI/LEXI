# AI Features Implementation Guide

## Overview

This guide explains the newly implemented AI features for the LEXI platform:

1. **Vietnamese Law Web Scraper** - Automatically crawls Vietnamese legal sources
2. **AI Processing Pipeline** - Processes crawled data into lesson drafts using AI
3. **AI Recommendations** - Provides personalized learning recommendations
4. **Adaptive Learning** - Adjusts content difficulty based on user performance
5. **Background Job Processor** - Async processing of AI generation tasks

## Features Implemented

### 1. Vietnamese Law Crawler Service

**File:** `src/modules/admin-content/services/vietnamese-law-crawler.service.ts`

Crawls official Vietnamese legal sources including:
- VnLaw (https://vnlaw.gov.vn)
- LuatCaoDan (https://luatcaodanvietnam.com)
- MOHA (https://moj.gov.vn)

**Usage:**

```typescript
// Crawl all legal sources
const sources = await lawCrawlerService.crawlVietnameseLegalSources();

// Crawl specific source type
const sources = await lawCrawlerService.crawlVietnameseLegalSources('VNLAW', 50);

// Get government law database
const laws = await lawCrawlerService.crawlGovernmentDatabase();

// Get relevant legal topics for education
const topics = await lawCrawlerService.getRelevantLegalTopics();

// Extract metadata from a document
const metadata = await lawCrawlerService.extractLegalDocumentMetadata(url);
```

### 2. AI Recommendation Service

**File:** `src/modules/admin-content/services/ai-recommendation.service.ts`

Analyzes user learning profiles and provides personalized recommendations.

**Key Methods:**

```typescript
// Get personalized recommendations
const recommendations = await recommendationService.getPersonalizedRecommendations(userId, limit);

// Analyze user learning profile
const profile = await recommendationService.analyzeUserLearningProfile(userId);

// Get quiz improvement suggestions
const suggestions = await recommendationService.getQuizImprovementSuggestions(userId, lessonId);

// Analyze learning consistency
const consistency = await recommendationService.analyzeLearningConsistency(userId);

// Get knowledge gap suggestions
const gaps = await recommendationService.getKnowledgeGapSuggestions(userId);
```

**API Endpoints:**

```
GET /api/ai-learning/recommendations?limit=5
GET /api/ai-learning/learning-profile
GET /api/ai-learning/quiz-improvements/:lessonId
GET /api/ai-learning/consistency-analysis
GET /api/ai-learning/knowledge-gaps
```

### 3. AI Enhanced Learning Service

**File:** `src/modules/admin-content/services/ai-enhanced-learning.service.ts`

Provides adaptive learning features that adjust to user performance.

**Key Methods:**

```typescript
// Get adaptive quiz questions
const questions = await enhancedLearningService.getAdaptiveQuizQuestions(userId, lessonId, count);

// Generate personalized learning path
const path = await enhancedLearningService.generatePersonalizedContentPath(userId);

// Get performance feedback
const feedback = await enhancedLearningService.generatePerformanceFeedback(userId, attemptId);

// Get hint for a question
const hint = await enhancedLearningService.getQuestionHint(questionId);

// Analyze learning patterns
const patterns = await enhancedLearningService.analyzeLearningPatterns(userId);

// Get review recommendations
const reviews = await enhancedLearningService.getReviewRecommendations(userId, limit);
```

**API Endpoints:**

```
GET /api/ai-learning/adaptive-quiz/:lessonId?count=3
GET /api/ai-learning/learning-path
GET /api/ai-learning/attempt/:attemptId/feedback
GET /api/ai-learning/hint/:questionId
GET /api/ai-learning/learning-patterns
GET /api/ai-learning/review-recommendations?limit=5
```

### 4. AI Job Processor Service

**File:** `src/modules/admin-content/services/ai-job-processor.service.ts`

Handles asynchronous background processing of AI generation tasks.

**Features:**

- Processes pending AI generation jobs every 5 minutes
- Supports multiple generation types:
  - LESSON - Generate lesson content
  - QUIZ - Generate quiz questions
  - VIDEO_SCRIPT - Generate video scripts
  - FULL_LESSON_PACKAGE - Generate complete lesson package

**Key Methods:**

```typescript
// Batch generate lesson drafts
const jobIds = await aiJobProcessor.batchGenerateLessonDrafts(sourceIds, moduleId, questionCount);

// Check job status
const status = await aiJobProcessor.getJobStatus(jobId);

// Cancel a job
await aiJobProcessor.cancelJob(jobId);
```

**API Endpoints:**

```
POST /api/ai-learning/admin/batch-generate-drafts
GET /api/ai-learning/admin/job/:jobId/status
POST /api/ai-learning/admin/job/:jobId/cancel
```

### 5. AI Learning Controller

**File:** `src/modules/admin-content/controllers/ai-learning.controller.ts`

Exposes all AI features through REST API endpoints.

## Environment Variables

Add these to your `.env` file:

```env
# AI Provider Configuration
AI_DRAFT_PROVIDER=local  # Options: 'local' or 'openai', 'anthropic', etc.
AI_DRAFT_ENDPOINT=https://api.openai.com/v1/chat/completions
AI_DRAFT_API_KEY=your_api_key_here
AI_DRAFT_MODEL=gpt-4-turbo
AI_DRAFT_PROMPT_VERSION=legal-draft-v1

# Legal Source Crawling
LEGAL_SOURCE_CRAWL_ENABLED=true
LEGAL_SOURCE_CRAWL_CRON=0 2 * * *  # 2 AM daily
LEGAL_SOURCE_CRAWL_URLS=https://luatcaodanvietnam.com,https://moj.gov.vn
LEGAL_SOURCE_CRAWL_MODULE_ID=your_module_id_here
LEGAL_SOURCE_CRAWL_QUESTION_COUNT=3

# AI Job Processing
AI_JOB_PROCESSOR_ENABLED=true
AI_JOB_PROCESSOR_BATCH_SIZE=10
```

## Usage Examples

### Example 1: Get Personalized Recommendations for a User

```bash
curl -X GET "http://localhost:3000/api/ai-learning/recommendations?limit=5" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json"
```

**Response:**

```json
[
  {
    "lessonId": "lesson123",
    "title": "Luật Lao Động - Quyền Công Nhân",
    "reason": "Cải thiện kỹ năng: Labor Law",
    "difficulty": "intermediate",
    "estimatedMinutes": 25,
    "relevantScore": 0.85
  }
]
```

### Example 2: Analyze User Learning Profile

```bash
curl -X GET "http://localhost:3000/api/ai-learning/learning-profile" \
  -H "Authorization: Bearer <your_jwt_token>"
```

**Response:**

```json
{
  "userId": "user123",
  "completedLessonsCount": 12,
  "averageScore": 78,
  "weakAreas": ["Criminal Law", "Administrative Law"],
  "strongAreas": ["Civil Law", "Labor Law"],
  "learningPace": "medium",
  "recommendedNextTopics": ["Commercial Law", "Environmental Law"]
}
```

### Example 3: Batch Generate Lesson Drafts from Legal Sources

```bash
curl -X POST "http://localhost:3000/api/ai-learning/admin/batch-generate-drafts" \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceIds": ["source1", "source2", "source3"],
    "moduleId": "module123",
    "questionCount": 5
  }'
```

**Response:**

```json
{
  "jobIds": ["job1", "job2", "job3"]
}
```

### Example 4: Get Adaptive Quiz Questions

```bash
curl -X GET "http://localhost:3000/api/ai-learning/adaptive-quiz/lesson123?count=3" \
  -H "Authorization: Bearer <your_jwt_token>"
```

**Response:**

```json
[
  {
    "questionId": "q1",
    "questionText": "Theo Luật Lao Động 2012, định nghĩa nào đúng?",
    "difficulty": "medium",
    "explanation": "Giải thích chi tiết về câu hỏi",
    "options": [
      { "id": "opt1", "text": "Đáp án A" },
      { "id": "opt2", "text": "Đáp án B" }
    ],
    "hintAvailable": true
  }
]
```

### Example 5: Get Quiz Improvement Suggestions

```bash
curl -X GET "http://localhost:3000/api/ai-learning/quiz-improvements/lesson123" \
  -H "Authorization: Bearer <your_jwt_token>"
```

**Response:**

```json
[
  {
    "suggestion": "Bạn trả lời sai 2 câu. Hãy xem lại các giải thích để hiểu rõ hơn.",
    "focusAreas": ["Định nghĩa pháp luật", "Trường hợp áp dụng"],
    "recommendedReview": ["Định nghĩa pháp luật"]
  }
]
```

### Example 6: Get Learning Path

```bash
curl -X GET "http://localhost:3000/api/ai-learning/learning-path" \
  -H "Authorization: Bearer <your_jwt_token>"
```

**Response:**

```json
{
  "userId": "user123",
  "currentPhase": "Trung cấp",
  "completedTopics": ["Civil Law", "Labor Law", "Family Law"],
  "nextTopics": ["Commercial Law", "Criminal Law", "Administrative Law"],
  "estimatedCompletionDays": 45,
  "milestones": [
    { "name": "Bắt đầu hành trình", "completed": true, "progress": 100 },
    { "name": "Hoàn thành 5 bài học", "completed": true, "progress": 100 },
    { "name": "Hoàn thành 10 bài học", "completed": true, "progress": 100 },
    { "name": "Trở thành chuyên gia", "completed": false, "progress": 60 }
  ]
}
```

## Data Flow

### Legal Document Processing Pipeline:

```
1. Web Crawler (VietnameseLawCrawlerService)
   ↓
2. Legal Source Storage (LegalSourceDocument)
   ↓
3. AI Job Creation (AiGenerationJob)
   ↓
4. Background Processing (AiJobProcessor)
   ↓
5. Lesson Draft Generation (LessonDraft)
   ↓
6. Admin Review & Approval
   ↓
7. Published Lessons (Lesson)
```

### User Learning Flow:

```
1. User completes lesson
   ↓
2. Quiz attempt recorded
   ↓
3. AI analyzes performance
   ↓
4. Recommendations generated
   ↓
5. Adaptive content delivered
   ↓
6. Personalized feedback provided
```

## Database Models

Key database models used by AI features:

- **LegalSourceDocument** - Stores crawled Vietnamese legal documents
- **AiGenerationJob** - Tracks AI generation tasks and their status
- **LessonDraft** - Stores AI-generated lesson drafts
- **UserProgress** - Tracks user's lesson completion status
- **LessonAttempt** - Stores quiz attempt data for analysis

## Performance Considerations

1. **AI Job Processing**: Runs every 5 minutes via cron job
2. **Batch Processing**: Process up to 10 jobs per cycle
3. **Caching**: Consider caching recommendations for users
4. **Database Indexing**: Ensure indexes on frequently queried fields

## Error Handling

All services include proper error handling:

- Network errors during crawling are caught and logged
- Failed AI jobs are marked with error messages
- API endpoints return meaningful error responses
- Fallback behaviors for missing data

## Testing

Example test cases to implement:

```typescript
// Test Vietnamese law crawler
it('should crawl Vietnamese legal sources', async () => {
  const sources = await crawlerService.crawlVietnameseLegalSources();
  expect(sources.length).toBeGreaterThan(0);
});

// Test recommendations
it('should generate personalized recommendations', async () => {
  const recommendations = await recommendationService.getPersonalizedRecommendations(userId);
  expect(recommendations.length).toBeLessThanOrEqual(5);
});

// Test adaptive learning
it('should adjust quiz difficulty based on user performance', async () => {
  const questions = await enhancedLearningService.getAdaptiveQuizQuestions(userId, lessonId);
  expect(questions[0].difficulty).toBeDefined();
});
```

## Next Steps

1. Configure AI provider (OpenAI, Anthropic, or local model)
2. Set environment variables
3. Run database migrations for new models
4. Test API endpoints with sample data
5. Monitor background job processing
6. Gather user feedback on recommendations

## Support

For issues or questions, please refer to the service documentation or contact the development team.
