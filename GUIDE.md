# Hướng Dẫn Sử Dụng & Triển Khai Hệ Thống TSA Master Pro

Chào mừng bạn đến với **TSA Master Pro** - Hệ thống luyện thi Thinking Skills Assessment chuyên nghiệp. Tài liệu này bao gồm hướng dẫn sử dụng cho người dùng cuối và hướng dẫn kỹ thuật để triển khai lên web.

---

## PHẦN 1: HƯỚNG DẪN SỬ DỤNG (USER MANUAL)

### 1. Đăng Ký & Thiết Lập Ban Đầu
Hệ thống sử dụng cơ chế **"Một thiết bị - Một tài khoản"** để đảm bảo tính riêng tư và lưu trữ cục bộ (Offline-first).
- **Bước 1:** Truy cập ứng dụng.
- **Bước 2:** Nhập **Họ tên**, **Tên đăng nhập (ID)**.
- **Bước 3:** Chọn vai trò:
  - **Học sinh (User):** Chỉ có thể làm bài thi và xem kết quả.
  - **Giáo viên (Admin):** Có toàn quyền tạo, sửa, xóa đề thi và sử dụng AI.
- **Lưu ý:** Nếu muốn đổi tài khoản, bạn phải nhấn nút "Thoát" và xác nhận xóa dữ liệu thiết bị.

### 2. Dành Cho Giáo Viên (Admin)

#### A. Quản lý Đề Thi
Tại màn hình Dashboard, giáo viên có 3 cách để tạo đề:
1.  **Tạo thủ công:** Nhập từng câu hỏi, đáp án và lời giải.
2.  **Import file:** Tải lên file có sẵn (Hỗ trợ JSON, CSV, TXT).
3.  **Tạo với AI:** Nhập chủ đề (ví dụ: "Tư duy logic", "Toán đố"), AI sẽ tự động sinh ra bộ câu hỏi.

#### B. Trình Soạn Thảo & Hình Ảnh (Mới)
Trong giao diện chỉnh sửa đề thi (`ExamEditor`):
- **Tải ảnh:** Hỗ trợ kéo thả hoặc chọn file PNG, JPG, GIF.
- **Chỉnh sửa ảnh:** Sau khi chọn ảnh, một cửa sổ sẽ hiện ra cho phép:
  - **Cắt (Crop):** Chọn vùng ảnh cần lấy.
  - **Xoay (Rotate):** Xoay ảnh nếu bị ngược.
  - **Thu phóng (Zoom):** Phóng to chi tiết quan trọng.
- **Bắt buộc hình ảnh:** Có thể tích chọn "Bắt buộc phải có hình ảnh" (dành cho các câu hỏi Visual Reasoning). Hệ thống sẽ ngăn không cho lưu nếu câu hỏi này chưa có ảnh.

### 3. Dành Cho Học Sinh (User)

#### A. Làm Bài Thi (`ExamRunner`)
- **Chế độ Thi thử:** Có đồng hồ đếm ngược, nộp bài mới biết kết quả. Tự động lưu bài làm mỗi 5 giây.
- **Chế độ Luyện tập:** Không giới hạn thời gian. Có thể nhấn "Kiểm tra" ngay sau mỗi câu để xem đáp án đúng/sai và lời giải chi tiết.
- **Autosave (Tự động lưu):** Nếu lỡ tay tắt trình duyệt hoặc tải lại trang, hệ thống sẽ tự động khôi phục tiến độ làm bài (câu đang chọn, đáp án đã điền, thời gian còn lại).

#### B. Xem Kết Quả
- Xem biểu đồ tròn thể hiện tỷ lệ đúng/sai.
- Xem lại chi tiết từng câu hỏi.
- **AI Tutor:** Tại màn hình kết quả hoặc chế độ luyện tập, nhấn "Hỏi gia sư AI chi tiết" để nhận phân tích sâu hơn từ Google Gemini.

---

## PHẦN 2: CẤU TRÚC DỮ LIỆU IMPORT

Để import đề thi từ file, vui lòng tuân thủ định dạng sau:

### 1. Định dạng JSON (Khuyên dùng)
```json
{
  "title": "Tên đề thi",
  "description": "Mô tả",
  "questions": [
    {
      "question_text": "Nội dung câu hỏi?",
      "question_image": "http://link-anh-hoac-base64...",
      "answers": [
        {"text": "Đáp án A", "is_correct": false},
        {"text": "Đáp án B", "is_correct": true}
      ],
      "explanation": "Giải thích...",
      "difficulty": "Medium",
      "category": "Problem Solving"
    }
  ]
}
```

### 2. Định dạng CSV
Cấu trúc các cột (không cần header):
`Text, OptionA, OptionB, OptionC, OptionD, OptionE, CorrectIndex(0-4), Explanation, Category, Tags, ImageURL`

### 3. Định dạng TXT
```text
Title: Đề thi Logic
---
Q: Câu hỏi 1?
A: Lựa chọn 1
B: Lựa chọn 2
Answer: B
Explanation: Giải thích...
---
```

---

## PHẦN 3: TRIỂN KHAI LÊN WEB (DEPLOYMENT)

Hệ thống được xây dựng bằng **React + Vite (hoặc tương đương)**. Dưới đây là cách triển khai lên **Vercel** (miễn phí và dễ nhất).

### Yêu cầu chuẩn bị
1.  Tài khoản GitHub/GitLab/Bitbucket.
2.  Tài khoản Vercel.
3.  **Google Gemini API Key** (Lấy tại [aistudio.google.com](https://aistudio.google.com/)).

### Bước 1: Đẩy mã nguồn lên GitHub
1.  Tạo một repository mới trên GitHub.
2.  Đẩy toàn bộ mã nguồn của dự án lên repository này.

### Bước 2: Cấu hình Vercel
1.  Truy cập [vercel.com](https://vercel.com) và đăng nhập.
2.  Nhấn **"Add New..."** -> **"Project"**.
3.  Chọn repository GitHub bạn vừa tạo.
4.  Tại phần **Configure Project**:
    - **Framework Preset:** Chọn `Vite` (hoặc `Create React App` tùy vào tool build bạn dùng).
    - **Root Directory:** `./` (Mặc định).
5.  **QUAN TRỌNG: Environment Variables (Biến môi trường)**
    - Mở phần **Environment Variables**.
    - Key: `API_KEY` (hoặc `VITE_API_KEY` nếu dùng Vite).
    - Value: `Dán_Key_Gemini_Của_Bạn_Vào_Đây`.
    - *Lưu ý:* Trong mã nguồn `services/geminiService.ts`, hãy đảm bảo bạn gọi đúng biến môi trường (ví dụ: `import.meta.env.VITE_API_KEY` cho Vite hoặc `process.env.API_KEY` cho Webpack).

### Bước 3: Deploy
1.  Nhấn nút **Deploy**.
2.  Chờ khoảng 1-2 phút để Vercel build và cài đặt.
3.  Sau khi hoàn tất, bạn sẽ nhận được một đường link (ví dụ: `tsa-master.vercel.app`).

### Lưu ý về bảo mật API Key
Do đây là ứng dụng Client-side (chạy hoàn toàn trên trình duyệt), API Key có thể bị lộ trong tab Network.
- **Giải pháp tốt nhất:** Sử dụng tính năng "API Key Restrictions" trong Google Cloud Console để giới hạn Key chỉ được phép gọi từ domain của bạn (ví dụ: `tsa-master.vercel.app`).

---

## PHẦN 4: CHẠY DƯỚI LOCAL (MÁY CÁ NHÂN)

Để phát triển hoặc chạy thử trên máy tính cá nhân:

1.  **Cài đặt Node.js:** Tải bản LTS từ [nodejs.org](https://nodejs.org/).
2.  **Mở Terminal** tại thư mục dự án.
3.  **Cài đặt thư viện:**
    ```bash
    npm install
    # hoặc
    yarn install
    ```
4.  **Cấu hình Key:**
    - Tạo file `.env` tại thư mục gốc.
    - Thêm dòng: `VITE_API_KEY=your_google_api_key_here`
5.  **Chạy dự án:**
    ```bash
    npm run dev
    ```
6.  Truy cập `http://localhost:5173` (hoặc port tương ứng).

---

**Liên hệ hỗ trợ:** Đội ngũ phát triển TSA Master Pro.
