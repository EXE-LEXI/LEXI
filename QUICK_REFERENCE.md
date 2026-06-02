# ⚡ LEXI Features - Quick Reference Card

**In 3 phút / 3 Minutes - Verify All Features**

---

## 🎯 The 3 Features

### Feature 1: Cào dữ liệu 
### Feature 2: Xử lý AI
### Feature 3: Sử dụng cho chức năng

---

## 📍 WHERE TO TEST EACH

```
Feature 1 & 2: http://localhost:5173/admin (Admin Page)
Feature 3:     DevTools Network tab (F12)
```

---

## 🔘 BUTTONS TO CLICK

### Feature 1:
```
Admin Page → Left box "Cao va tao draft"
→ [Crawl and Create Drafts]
```

### Feature 2:
```
Admin Page → Right box "Xu ly nguon da crawl"  
→ [Process Sources]
```

### Feature 3:
```
DevTools F12 → Network tab → Visit pages
→ Check for /api/ai-learning/* requests
→ Verify Status 200
```

---

## ✅ WHAT SUCCESS LOOKS LIKE

| Feature | Success Indicator |
|---------|-------------------|
| Feature 1 | ✓ "Sources: 50, Drafts: 5" appears |
| Feature 2 | ✓ "Processing..." message + Backend logs show "Job succeeded" |
| Feature 3 | ✓ All 8 API endpoints show Status 200 in DevTools |

---

## 🔍 DEVTOOLS VERIFICATION (For All Features)

```
1. Press F12
2. Network tab
3. Submit form or navigate page
4. Look for request
5. Click request
6. Go to Response tab
7. Check: Status 200? Data inside? ✅
```

---

## 🚨 QUICK TROUBLESHOOTING

| Problem | Fix |
|---------|-----|
| 401 Unauthorized | Login as ADMIN user |
| Admin page says "Not Found" | URL is http://localhost:5173/admin |
| No API calls in DevTools | Component may not be calling API yet |
| API shows 500 error | Check backend logs, restart backend |
| No data in response | Check if crawl (Feature 1) completed first |

---

## ⏱️ TIME ESTIMATE

```
Feature 1: 2 minutes
Feature 2: 3 minutes (+ 60 sec for processing)
Feature 3: 3 minutes
─────────────
Total: ~5-8 minutes
```

---

## 📊 STATUS SUMMARY

```
✅ Backend: READY
✅ APIs: READY
✅ Feature 1: READY to test
✅ Feature 2: READY to test
✅ Feature 3: READY to test (APIs working)
🔧 Feature 3 UI: Needs component updates
```

---

## 🎯 ACTION ITEMS

```
☐ Start backend: npm run start:dev
☐ Start frontend: npm run dev
☐ Open: http://localhost:5173
☐ Login: As ADMIN user
☐ Go to: Admin page
☐ Click: "Crawl and Create Drafts"
☐ See: Success + stats
☐ Click: "Process Sources"  
☐ See: Processing message
☐ Wait: 60 seconds for completion
☐ Open DevTools (F12)
☐ Network tab
☐ Visit: Profile page
☐ Check: 8 API calls all Status 200
☐ Result: All features working! ✅
```

---

## 📚 FULL GUIDES

```
Need more details?

Quick Test (10 min):
→ QUICK_TEST_CHECKLIST.md

Visual Guide (20 min):
→ VISUAL_TESTING_GUIDE.md

Complete Guide (45 min):
→ TESTING_GUIDE.md

Just Overview:
→ HOW_TO_VERIFY_FEATURES.md
```

---

## 💼 FOR TEAM MEMBERS

**Admin:** Run Features 1 & 2 on Admin Page
**Dev:** Check Feature 3 APIs in DevTools  
**QA:** Use TESTING_GUIDE.md for full verification
**DevOps:** Monitor backend logs during Feature 2

---

## 🚀 READY?

```
1. Terminal 1: cd backend && npm run start:dev
2. Terminal 2: cd frontend && npm run dev
3. Browser: http://localhost:5173
4. Follow bullets above
5. Get results ✅
```

**3 minutes to verify all features!** ⚡
