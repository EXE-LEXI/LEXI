# Kế hoạch chi tiết sửa đổi dự án LEXI

Để khắc phục các điểm phản hồi từ người dùng một cách tối ưu và mạch lạc nhất, chúng ta sẽ thực hiện 4 bước lớn trong luồng xử lý mã nguồn (flow code). Dưới đây là kế hoạch chi tiết từng bước và các tệp tin sẽ thay đổi.

---

## BƯỚC 1: Cải thiện trải nghiệm làm Quiz và Giải thích của AI Mentor

### 1.1. Ẩn gợi ý đáp án khi làm Quiz
- **Tệp tin cần sửa:** [LessonPage.tsx](file:///d:/lexi1/LEXI/frontend/src/pages/LessonPage.tsx)
- **Hành động:** 
  - Tại giao diện Quiz (dòng 1035 - 1054), xóa bỏ hoặc comment lại phần hiển thị `AI Mentor Card` khi người dùng đang chọn đáp án. Điều này giúp ngăn chặn việc lộ đáp án trước khi người dùng thực sự hoàn thành bài.
  - Người dùng sẽ chỉ tập trung chọn đáp án cho từng câu và bấm **Tiếp tục** / **Nộp bài**.

### 1.2. Sửa lỗi hiển thị "Chính xác!" cho tất cả các câu (kể cả câu trả lời sai)
- **Tệp tin cần sửa:** [LessonPage.tsx](file:///d:/lexi1/LEXI/frontend/src/pages/LessonPage.tsx)
- **Hành động:**
  - Cập nhật định nghĩa hàm trợ giúp `getAiMentorExplanation(questionText: string, isCorrect?: boolean)`.
  - Thay vì tất cả các chuỗi trả về đều cứng tiền tố `"Chính xác! "`, chúng ta sẽ tách tiền tố động:
    - Nếu `isCorrect === true` (hoặc `undefined`): Tiền tố là `"Chính xác! "`.
    - Nếu `isCorrect === false`: Tiền tố là `"Lưu ý quan trọng: "` hoặc `"Giải thích chi tiết: "`.
  - Tại phần hiển thị xem lại kết quả (sau khi nộp bài) (dòng 807):
    - Cập nhật lời gọi thành `item.explanation || getAiMentorExplanation(question.text, item.isCorrect)`.

---

## BƯỚC 2: Thêm hình ảnh minh họa cho nội dung bài học

### 2.1. Tạo các hình ảnh minh họa chất lượng cao
- **Thư mục lưu trữ:** `/frontend/public/images/illustrations/`
- **Hành động:** Sử dụng AI tạo ảnh để thiết kế 5 ảnh minh họa tương ứng với 5 chủ đề:
  1. `labor_law.jpg` (Luật Lao động)
  2. `traffic_law.jpg` (Luật Giao thông)
  3. `digital_safety.jpg` (An toàn kỹ thuật số)
  4. `scam_alert.jpg` (Cảnh giác lừa đảo)
  5. `consumer_rights.jpg` (Quyền lợi người tiêu dùng)

### 2.2. Hiển thị hình ảnh minh họa trong bài học
- **Tệp tin cần sửa:** [LessonPage.tsx](file:///d:/lexi1/LEXI/frontend/src/pages/LessonPage.tsx)
- **Hành động:**
  - Viết hàm `getLessonIllustration(slug: string, categoryTitle: string): string` để trả về đường dẫn hình ảnh tương ứng.
  - Trong tab "Nội dung bài học" (`activeMenu === "noi-dung"`), chèn thẻ `<img>` hiển thị ảnh minh họa ngay trên phần văn bản tổng quan bài học.

---

## BƯỚC 3: Xây dựng Dashboard cá nhân hóa & Hướng dẫn Tân thủ

### 3.1. Tạo giao diện Dashboard cá nhân hóa
- **Tệp tin cần sửa:** [LandingPage.tsx](file:///d:/lexi1/LEXI/frontend/src/pages/LandingPage.tsx)
- **Hành động:**
  - Khi học viên đã đăng nhập (`session` có dữ liệu), thay vì hiển thị cấu trúc Landing Page thông tin giới thiệu chung, chúng ta sẽ chuyển sang một giao diện Dashboard hoàn chỉnh có cấu trúc:
    - **Header:** Lời chào cá nhân hóa, hiển thị thông tin Streak, LC (Lexi Coins) và cấp độ học viên.
    - **Section "Hướng dẫn nhập cuộc: Nên chơi thế nào? 🎮":** Sơ đồ 4 bước chỉ dẫn người dùng kèm hình vẽ minh họa sinh động (`onboarding_guide.jpg`):
      1. *Bước 1: Chọn bài học* - Truy cập "Khóa học của tôi" và chọn bài học trên bản đồ.
      2. *Bước 2: Học nội dung* - Xem video ngắn hoặc đọc tóm tắt lý thuyết trực quan.
      3. *Bước 3: Trả lời Quiz* - Vượt ải trắc nghiệm để nhận thưởng XP và Coins.
      4. *Bước 4: Ôn tập & Thi đấu* - Sử dụng "Radar ôn tập" và tham gia "Đấu trường Game".
    - **Section "AI Mentor đề xuất":** Đưa ra các bài học AI khuyên học tiếp dựa trên lịch sử học viên.
    - **Section "Lịch sử học tập gần đây":** Các bài học gần nhất giúp học viên tiếp tục dễ dàng.

---

## BƯỚC 4: Chạy thử và xác minh tính đúng đắn (Verification)
- Khởi chạy ứng dụng: `npm run dev` tại thư mục frontend.
- Tiến hành chạy thử các kịch bản:
  1. Đăng nhập và kiểm tra xem có vào thẳng giao diện Dashboard chỉ dẫn Tân thủ mới hay không.
  2. Bấm vào bài học, xem ảnh minh họa chủ đề đã hiển thị chưa.
  3. Làm Quiz, kiểm tra xem có bị lộ đáp án trong lúc làm không.
  4. Nộp bài, kiểm tra xem câu làm sai có hiển thị đúng nhãn phân tích của AI Mentor mà không có chữ "Chính xác!" hay không.
