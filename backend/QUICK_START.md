# LEXI AI Features - Quick Start Guide

## 🚀 5-Minute Setup

### 1. Update Environment Variables

Add to your `.env` file:
```env
# Minimal AI configuration
AI_DRAFT_PROVIDER=local
LEGAL_SOURCE_CRAWL_ENABLED=true
LEGAL_SOURCE_CRAWL_CRON=0 2 * * *
```

### 2. Start the Application

```bash
npm run start:dev
```

Services automatically initialize:
- ✅ Vietnamese Law Crawler
- ✅ AI Recommendation Engine
- ✅ AI Job Processor (runs every 5 min)
- ✅ Adaptive Learning Service

## 📱 Test in 30 Seconds

### For Learners: Get Recommendations
```bash
curl -X GET "http://localhost:3000/api/ai-learning/recommendations" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
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

### For Admins: Crawl Legal Sources
```bash
curl -X GET "http://localhost:3000/api/ai-learning/admin/legal-sources?limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

**Response:**
```json
[
  {
    "url": "https://luatcaodanvietnam.com/...",
    "title": "Law on Business Registration 2014",
    "source": "LUATCAODAN",
    "lastModified": "2024-05-29T00:00:00.000Z"
  }
]
```

## 🔧 Available Endpoints

### Learner Endpoints
```
GET  /api/ai-learning/recommendations          - Get personalized lessons
GET  /api/ai-learning/learning-profile         - View learning stats
GET  /api/ai-learning/learning-path            - View learning roadmap
GET  /api/ai-learning/adaptive-quiz/:id        - Get adaptive quiz
GET  /api/ai-learning/attempt/:id/feedback     - Get quiz feedback
GET  /api/ai-learning/learning-patterns        - Get study recommendations
GET  /api/ai-learning/knowledge-gaps           - See knowledge gaps
GET  /api/ai-learning/review-recommendations   - Lessons to review
GET  /api/ai-learning/hint/:questionId         - Get question hint
```

### Admin Endpoints
```
GET  /api/ai-learning/admin/legal-sources      - Crawl legal sources
GET  /api/ai-learning/admin/government-laws    - Get government laws
GET  /api/ai-learning/admin/legal-topics       - Get legal topics
POST /api/ai-learning/admin/legal-metadata     - Extract metadata
POST /api/ai-learning/admin/batch-generate-drafts - Batch generate lessons
GET  /api/ai-learning/admin/job/:id/status    - Check job status
POST /api/ai-learning/admin/job/:id/cancel    - Cancel job
```

## 📊 Complete Feature Overview

### 1. Content Creation (Admin)
```
Crawl Laws → Process with AI → Generate Lessons → Admin Review → Publish
```

### 2. Personalized Learning (Learner)
```
Learner Progress → AI Analysis → Recommendations → Adaptive Quiz → Feedback
```

## 🎯 Core Features at a Glance

| Feature | Usage | Response Time |
|---------|-------|---|
| **Recommendations** | Personalized lesson suggestions | <500ms |
| **Adaptive Quiz** | Difficulty adjusts to user level | <200ms |
| **Performance Feedback** | AI-generated quiz feedback | <300ms |
| **Learning Path** | Roadmap with milestones | <500ms |
| **Job Processor** | Background lesson generation | 30-60s per lesson |

## 💡 Key Use Cases

### Use Case 1: Admin Generates Lessons
```bash
# 1. Get Vietnamese legal sources
GET /api/ai-learning/admin/legal-sources?limit=10

# 2. Batch generate lesson drafts
POST /api/ai-learning/admin/batch-generate-drafts
{
  "sourceIds": ["source1", "source2", "source3"],
  "moduleId": "module123",
  "questionCount": 5
}

# 3. Monitor job progress
GET /api/ai-learning/admin/job/job123/status

# 4. Review & approve via existing endpoints
# GET /admin/ai/lesson-drafts
# PATCH /admin/ai/lesson-drafts/:draftId
# POST /admin/ai/lesson-drafts/:draftId/create-lesson
```

### Use Case 2: Learner Gets Personalized Path
```bash
# 1. Get recommendations
GET /api/ai-learning/recommendations

# 2. View learning path
GET /api/ai-learning/learning-path

# 3. Take adaptive quiz
GET /api/ai-learning/adaptive-quiz/lesson123

# 4. Get feedback
GET /api/ai-learning/attempt/attempt123/feedback

# 5. Repeat with updated recommendations
```

### Use Case 3: Learner Improves Performance
```bash
# 1. See what needs improvement
GET /api/ai-learning/knowledge-gaps

# 2. Get quiz suggestions
GET /api/ai-learning/quiz-improvements/lesson123

# 3. Review those lessons
GET /api/ai-learning/review-recommendations

# 4. Check learning patterns
GET /api/ai-learning/learning-patterns
# Response: Best times to study, recommended frequency
```

## 🔍 Monitoring

### Check Job Processor Status
```bash
# Monitor in logs - look for:
# - "Processing X pending AI generation jobs"
# - "AI job [jobId] completed successfully"
# - "AI job [jobId] failed: [error]"
```

### Key Metrics to Monitor
1. **Pending Jobs**: Should decrease over time
2. **Success Rate**: Aim for >95%
3. **Processing Time**: 30-60s per lesson is normal
4. **Recommendation Quality**: Check user engagement

## 📝 Configuration Examples

### For Development
```env
AI_DRAFT_PROVIDER=local
LEGAL_SOURCE_CRAWL_ENABLED=true
AI_DEBUG=true
```

### For Production with OpenAI
```env
AI_DRAFT_PROVIDER=openai
AI_DRAFT_ENDPOINT=https://api.openai.com/v1/chat/completions
AI_DRAFT_API_KEY=sk-...
AI_DRAFT_MODEL=gpt-4-turbo
LEGAL_SOURCE_CRAWL_ENABLED=true
LEGAL_SOURCE_CRAWL_CRON=0 2 * * *
```

### For Production with Local Model
```env
AI_DRAFT_PROVIDER=local
LEGAL_SOURCE_CRAWL_ENABLED=true
LEGAL_SOURCE_CRAWL_CRON=0 3 * * *
```

## 🐛 Troubleshooting

### Jobs Not Processing?
```bash
# Check if processor is enabled
echo $AI_JOB_PROCESSOR_ENABLED  # Should be true

# Check logs for:
# - "AI job processor already running"
# - "Processing X pending AI generation jobs"

# Monitor MongoDB:
# db.ai_generation_jobs.find({ status: "PENDING" })
```

### Recommendations Not Working?
```bash
# Ensure user has enough history
# Need at least 1-2 completed lessons

# Check user progress
# db.user_progress.find({ userId: "..." })

# Check attempts
# db.lesson_attempts.find({ userId: "..." })
```

### API Returns Errors?
```bash
# Verify JWT token is valid
# Verify user role (ADMIN for admin endpoints)
# Check request headers:
# - Authorization: Bearer <token>
# - Content-Type: application/json
```

## 📚 Full Documentation

For detailed information, see:
- `AI_FEATURES_GUIDE.md` - Complete feature documentation
- `AI_INTEGRATION_GUIDE.md` - Architecture & workflows
- `IMPLEMENTATION_SUMMARY.md` - What was implemented

## ✅ Checklist for Deployment

- [ ] Configure AI provider in `.env`
- [ ] Verify MongoDB connection
- [ ] Test all learner endpoints
- [ ] Test all admin endpoints
- [ ] Monitor job processor for 1 hour
- [ ] Verify recommendation quality
- [ ] Check performance metrics
- [ ] Review error logs
- [ ] Train team on new features

## 🎓 Learning Resources

1. **Start Here**: This guide (you are here!)
2. **Features Guide**: `AI_FEATURES_GUIDE.md`
3. **Architecture**: `AI_INTEGRATION_GUIDE.md`
4. **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`

## 🤝 Support

For issues:
1. Check Troubleshooting section above
2. Review logs for error messages
3. Check MongoDB for data consistency
4. Verify environment variables
5. Review documentation files

## 🎉 You're Ready!

You now have a fully functional AI-powered learning platform:

✅ Vietnamese legal content automatically crawled
✅ AI-generated lessons (content + quiz + video scripts)
✅ Personalized recommendations for each learner
✅ Adaptive quiz difficulty
✅ Intelligent performance feedback
✅ Optimized learning paths
✅ Background job processing
✅ Production-ready API

**Start exploring the features now!** 🚀

---

**Questions?** Check the detailed guides or review the source code in:
- `src/modules/admin-content/services/`
- `src/modules/admin-content/controllers/ai-learning.controller.ts`
