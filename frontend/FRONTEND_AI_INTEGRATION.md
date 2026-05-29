# LEXI Frontend AI Integration Guide

**Status:** ✅ API Layer Complete - Ready for UI Integration
**Date:** May 29, 2026

---

## 📋 What's Been Added

### 1. AI Learning Types
**File:** `frontend/src/types/learning.ts`

Added 11 new TypeScript interfaces:
- ✅ `ContentRecommendation` - Recommendation data
- ✅ `UserLearningProfile` - User analysis
- ✅ `AdaptiveQuestion` - Difficulty-adjusted quiz questions
- ✅ `LearningPath` - Learning roadmap
- ✅ `PerformanceFeedback` - Quiz feedback
- ✅ `QuizImprovement` - Quiz suggestions
- ✅ `LearningConsistency` - Streak analysis
- ✅ `KnowledgeGap` - Gap identification
- ✅ `LearningPattern` - Study patterns
- ✅ `ReviewRecommendationItem` - Review suggestions
- ✅ `QuestionHint` - Hint data

### 2. AI Learning API Functions
**File:** `frontend/src/api/learning.ts`

Added 11 new API wrapper functions:

```typescript
// Get personalized recommendations
getRecommendations(token, limit = 5)

// Get learning profile  
getLearningProfile(token)

// Get quiz improvement suggestions
getQuizImprovements(token, lessonId)

// Analyze learning consistency
getLearningConsistency(token)

// Identify knowledge gaps
getKnowledgeGaps(token, limit = 5)

// Get adaptive quiz questions
getAdaptiveQuizQuestions(token, lessonId, count = 3)

// Get learning path
getLearningPath(token)

// Get performance feedback
getPerformanceFeedback(token, attemptId)

// Get question hint
getQuestionHint(token, questionId)

// Analyze learning patterns
getLearningPatterns(token)

// Get AI review recommendations
getAiReviewRecommendations(token, limit = 5)
```

---

## 🚀 How to Use in UI Components

### Example 1: Display Recommendations in ProfilePage

```typescript
import { getRecommendations } from "../api/learning";

// In your component
const [recommendations, setRecommendations] = useState<ContentRecommendation[]>([]);

useEffect(() => {
  if (session?.accessToken) {
    getRecommendations(session.accessToken)
      .then(setRecommendations)
      .catch(err => console.error("Failed to load recommendations:", err));
  }
}, [session?.accessToken]);

// Render recommendations
{recommendations.map(rec => (
  <div key={rec.lessonId}>
    <h3>{rec.title}</h3>
    <p>{rec.reason}</p>
    <p>Difficulty: {rec.difficulty}</p>
    <p>Time: {rec.estimatedMinutes} min</p>
  </div>
))}
```

### Example 2: Show Adaptive Quiz in LessonPage

```typescript
import { getAdaptiveQuizQuestions } from "../api/learning";

const [questions, setQuestions] = useState<AdaptiveQuestion[]>([]);

useEffect(() => {
  if (session?.accessToken && lessonId) {
    getAdaptiveQuizQuestions(session.accessToken, lessonId, 5)
      .then(setQuestions)
      .catch(err => console.error("Failed to load adaptive quiz:", err));
  }
}, [session?.accessToken, lessonId]);

// Render adaptive questions
{questions.map(q => (
  <div key={q.questionId}>
    <p>{q.questionText}</p>
    <div>Difficulty: {q.difficulty}</div>
    {q.options.map(opt => (
      <button key={opt.id}>{opt.text}</button>
    ))}
    {q.hintAvailable && <button>Show Hint</button>}
  </div>
))}
```

### Example 3: Show Learning Path in ModulesPage

```typescript
import { getLearningPath } from "../api/learning";

const [path, setPath] = useState<LearningPath | null>(null);

useEffect(() => {
  if (session?.accessToken) {
    getLearningPath(session.accessToken)
      .then(setPath)
      .catch(err => console.error("Failed to load learning path:", err));
  }
}, [session?.accessToken]);

// Render learning path
{path && (
  <div>
    <h2>Your Learning Path</h2>
    <p>Current Phase: {path.currentPhase}</p>
    <p>Estimated Completion: {path.estimatedCompletionDays} days</p>
    
    <h3>Milestones:</h3>
    {path.milestones.map((m, i) => (
      <div key={i}>
        <span>{m.name}</span>
        <span>{m.completed ? "✓" : "○"}</span>
        <div style={{width: "100%", height: "4px", background: "#ddd"}}>
          <div style={{width: `${m.progress * 100}%`, height: "100%", background: "#4CAF50"}} />
        </div>
      </div>
    ))}
  </div>
)}
```

### Example 4: Show Performance Feedback After Quiz

```typescript
import { getPerformanceFeedback } from "../api/learning";

// After quiz submission
const handleQuizComplete = async (attemptId: string) => {
  try {
    const feedback = await getPerformanceFeedback(session.accessToken, attemptId);
    
    // Show feedback modal or new section
    showFeedback({
      overall: feedback.overallFeedback,
      strengths: feedback.strengths,
      improvements: feedback.areasForImprovement,
      nextSteps: feedback.nextSteps,
      motivation: feedback.motivationalMessage
    });
  } catch (error) {
    console.error("Failed to load feedback:", error);
  }
};

// Render feedback
{feedback && (
  <div className="feedback-container">
    <div className="overall">{feedback.overall}</div>
    <div className="strengths">
      <h4>Your Strengths:</h4>
      <ul>
        {feedback.strengths.map(s => <li key={s}>{s}</li>)}
      </ul>
    </div>
    <div className="improvements">
      <h4>Areas for Improvement:</h4>
      <ul>
        {feedback.improvements.map(i => <li key={i}>{i}</li>)}
      </ul>
    </div>
    <div className="next-steps">
      <h4>Next Steps:</h4>
      <ul>
        {feedback.nextSteps.map(s => <li key={s}>{s}</li>)}
      </ul>
    </div>
    <div className="motivation">{feedback.motivation}</div>
  </div>
)}
```

---

## 🔄 Integration Checklist

### Phase 1: Display Recommendations (ProfilePage)
- [ ] Import `getRecommendations` API function
- [ ] Add state for recommendations
- [ ] Call API when session loads
- [ ] Display recommendations in a card/list component
- [ ] Handle loading and error states

### Phase 2: Show Learning Profile
- [ ] Import `getLearningProfile` API function
- [ ] Display stats: completed lessons, average score
- [ ] Show weak areas and strong areas
- [ ] Show learning pace indicator
- [ ] Show recommended next topics

### Phase 3: Adaptive Quiz (LessonPage)
- [ ] Import `getAdaptiveQuizQuestions` API function
- [ ] Replace static quiz questions with adaptive ones
- [ ] Adjust UI based on difficulty level (easy/medium/hard)
- [ ] Show "Get Hint" button if available
- [ ] Call `getQuestionHint` when user clicks hint

### Phase 4: Learning Path (ModulesPage)
- [ ] Import `getLearningPath` API function
- [ ] Display learning path as visual roadmap
- [ ] Show milestones with progress bars
- [ ] Show estimated completion time
- [ ] Show current phase in progress

### Phase 5: Performance Feedback
- [ ] Import `getPerformanceFeedback` API function
- [ ] Call after quiz submission
- [ ] Display in a modal or new page
- [ ] Show overall feedback, strengths, improvements, next steps
- [ ] Show motivational message

### Phase 6: Learning Analysis (New Page or Dashboard)
- [ ] Import analysis functions:
  - `getLearningConsistency` - Streak and consistency
  - `getKnowledgeGaps` - Gap analysis
  - `getLearningPatterns` - Study patterns
  - `getQuizImprovements` - Specific improvement suggestions
- [ ] Create dashboard or analysis page
- [ ] Display all analyses with charts/visualizations

---

## 📊 API Endpoint Mapping

| Frontend Function | Backend Endpoint | Method | Auth |
|---|---|---|---|
| `getRecommendations()` | `GET /api/ai-learning/recommendations` | GET | JWT |
| `getLearningProfile()` | `GET /api/ai-learning/learning-profile` | GET | JWT |
| `getQuizImprovements()` | `GET /api/ai-learning/quiz-improvements/:id` | GET | JWT |
| `getLearningConsistency()` | `GET /api/ai-learning/consistency-analysis` | GET | JWT |
| `getKnowledgeGaps()` | `GET /api/ai-learning/knowledge-gaps` | GET | JWT |
| `getAdaptiveQuizQuestions()` | `GET /api/ai-learning/adaptive-quiz/:id` | GET | JWT |
| `getLearningPath()` | `GET /api/ai-learning/learning-path` | GET | JWT |
| `getPerformanceFeedback()` | `GET /api/ai-learning/attempt/:id/feedback` | GET | JWT |
| `getQuestionHint()` | `GET /api/ai-learning/hint/:id` | GET | JWT |
| `getLearningPatterns()` | `GET /api/ai-learning/learning-patterns` | GET | JWT |
| `getAiReviewRecommendations()` | `GET /api/ai-learning/review-recommendations` | GET | JWT |

---

## 🔐 Authentication

All functions require a valid JWT token. The token is automatically included in the request headers via the `apiRequest` function.

```typescript
// Usage is consistent across all AI functions
getRecommendations(session.accessToken)  // Pass the access token
```

---

## ⚠️ Error Handling

All functions return promises. Always handle errors:

```typescript
try {
  const recommendations = await getRecommendations(token);
  // Use recommendations
} catch (error) {
  if (error instanceof ApiError) {
    if (error.statusCode === 401) {
      // Handle unauthorized - redirect to login
    } else if (error.statusCode === 403) {
      // Handle forbidden
    } else {
      // Handle other errors
    }
  }
}
```

---

## 🎨 UI Components to Create

### Recommended Components:

1. **RecommendationCard** - Display single recommendation
2. **LearningProfileSummary** - Show learning stats
3. **LearningPathVisualization** - Show roadmap with milestones
4. **PerformanceFeedbackModal** - Show quiz feedback
5. **AdaptiveQuestionCard** - Display single adaptive question
6. **LearningAnalysisDashboard** - Comprehensive analysis view
7. **HintPopover** - Show question hints

---

## 📱 Responsive Design Considerations

- Recommendations list should work on mobile
- Learning path should scroll horizontally on small screens
- Performance feedback should be readable on all devices
- Adaptive questions should have readable font sizes
- Progress bars should be visible on mobile

---

## 🔄 Refresh Strategy

Consider when to refresh data:

```typescript
// Refresh recommendations after every quiz completion
useEffect(() => {
  if (quizCompleted) {
    getRecommendations(token)
      .then(setRecommendations)
      .catch(err => console.error(err));
  }
}, [quizCompleted]);

// Refresh learning path on lesson completion
useEffect(() => {
  if (lessonCompleted) {
    getLearningPath(token)
      .then(setPath)
      .catch(err => console.error(err));
  }
}, [lessonCompleted]);
```

---

## ✅ Testing Checklist

- [ ] All API functions can be called without errors
- [ ] Token is properly passed to all endpoints
- [ ] Responses match TypeScript interfaces
- [ ] Error handling works correctly
- [ ] Loading states display properly
- [ ] Data displays correctly in UI
- [ ] Works on mobile and desktop
- [ ] Works in different browsers
- [ ] No console errors

---

## 📚 Related Documentation

- [REQUIREMENTS_COMPLIANCE_CHECK.md](./REQUIREMENTS_COMPLIANCE_CHECK.md) - Requirements status
- [AI_INTEGRATION_GUIDE.md](./AI_INTEGRATION_GUIDE.md) - Backend architecture
- [AI_FEATURES_GUIDE.md](./AI_FEATURES_GUIDE.md) - Feature documentation
- [QUICK_START.md](./QUICK_START.md) - Quick start guide

---

## 🚀 Ready to Start?

1. ✅ Types are defined
2. ✅ API functions are created
3. ✅ Backend endpoints are ready
4. ✅ Authentication is configured

**Next step:** Integrate these into your React components! Start with the simplest feature (recommendations) and build up from there.

