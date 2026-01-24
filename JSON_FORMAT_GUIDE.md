# 📋 Hướng dẫn định dạng JSON cho Import Đề Thi

## 1. Cấu trúc cơ bản của file JSON

```json
{
  "title": "Tên đề thi",
  "description": "Mô tả đề thi",
  "type": "TSA",
  "durationMinutes": 150,
  "questions": [
    // Danh sách câu hỏi
  ]
}
```

### Các loại đề thi (type)
- `"TSA"` - Tư duy (Thinking Skills Assessment) - **150 phút**
- `"HSA"` - Đánh giá năng lực (High School Assessment) - **150 phút**

---

## 2. Các loại câu hỏi và định dạng trả lời

### 2.1 Trắc nghiệm đơn (Multiple Choice)
**Người dùng chọn 1 trong 4 đáp án**

```json
{
  "type": "multiple_choice",
  "text": "Tổng của 2 + 3 bằng bao nhiêu?",
  "explanation": "2 + 3 = 5",
  "category": "Toán học (Định lượng)",
  "difficulty": "Dễ",
  "options": ["3", "4", "5", "6"],
  "correctIndex": 2
}
```

**Giải thích:**
- `type`: `"multiple_choice"`
- `options`: Array 4 đáp án
- `correctIndex`: Vị trí đáp án đúng (0-3)

---

### 2.2 Đúng/Sai (True/False)
**Người dùng trả lời Đúng hoặc Sai**

```json
{
  "type": "true_false",
  "text": "Trái Đất quay quanh Mặt Trời",
  "explanation": "Đây là sự thật khoa học",
  "category": "Địa lý",
  "difficulty": "Dễ",
  "options": ["Đúng", "Sai"],
  "correctIndex": 0
}
```

---

### 2.3 Đúng/Sai + Giải thích (True/False Explain)
**Người dùng trả lời Đúng/Sai và nhập giải thích**

```json
{
  "type": "true_false_explain",
  "text": "AI sẽ thay thế toàn bộ công việc con người",
  "explanation": "Cần có giải thích chi tiết từ người dùng",
  "category": "Tư duy Phản biện & Logic",
  "difficulty": "Khó",
  "options": ["Đúng", "Sai"],
  "correctIndex": 1,
  "correctAnswerText": "AI sẽ hỗ trợ nhưng không thay thế hoàn toàn"
}
```

---

### 2.4 Câu hỏi trắc nghiệm phức hợp (Multiple Select)
**Người dùng chọn NHIỀU đáp án đúng**

```json
{
  "type": "multiple_select",
  "text": "Những nước nào nằm ở Đông Nam Á? (Chọn 2 hoặc hơn)",
  "explanation": "Cả ba nước đều nằm ở Đông Nam Á",
  "category": "Địa lý",
  "difficulty": "Trung bình",
  "options": ["Việt Nam", "Thái Lan", "Cam Pu Chia", "Nhật Bản"],
  "correctIndices": [0, 1, 2]
}
```

**Giải thích:**
- `type`: `"multiple_select"`
- `correctIndices`: Array các vị trí đáp án đúng

---

### 2.5 Điền khuyết (Fill in Blank)
**Người dùng nhập câu trả lời vào ô trống**

```json
{
  "type": "fill_in_blank",
  "text": "Thủ đô của Pháp là _______",
  "explanation": "Paris là thủ đô của Pháp",
  "category": "Địa lý",
  "difficulty": "Dễ",
  "correctAnswerText": "Paris",
  "acceptVariations": ["paris", "PARIS", "Pari"]
}
```

**Giải thích:**
- `type`: `"fill_in_blank"`
- `correctAnswerText`: Câu trả lời đúng (không phân biệt hoa/thường)
- `acceptVariations` (tùy chọn): Các biến thể được chấp nhận

---

### 2.6 Câu hỏi ngắn (Short Answer)
**Người dùng viết câu trả lời ngắn (1-2 dòng)**

```json
{
  "type": "short_answer",
  "text": "Nêu 3 lợi ích của học thêm tiếng Anh",
  "explanation": "Tiếng Anh mở ra cơ hội học tập và công việc toàn cầu",
  "category": "Tiếng Anh",
  "difficulty": "Trung bình",
  "correctAnswerText": "Mở rộng cơ hội học tập, công việc, giao tiếp quốc tế"
}
```

---

### 2.7 Tự luận (Essay)
**Người dùng viết bài tự luận dài (500+ từ)**

```json
{
  "type": "essay",
  "text": "Hãy viết một bài luận về 'Vai trò của công nghệ trong giáo dục hiện đại' (500-800 từ)",
  "explanation": "Bài luận cần có: mở bài, các ý chính (ít nhất 3), ví dụ cụ thể, kết luận",
  "category": "Ngữ văn (Định tính)",
  "difficulty": "Khó",
  "correctAnswerText": "Bài luận cần phản ánh sự hiểu biết về vai trò tích cực của công nghệ",
  "rubric": "Nội dung: 40%, Cấu trúc: 30%, Ngôn ngữ: 30%"
}
```

---

### 2.8 Sắp xếp thứ tự (Ordering)
**Người dùng sắp xếp các mục theo thứ tự đúng**

```json
{
  "type": "ordering",
  "text": "Sắp xếp các bước để nấu cơm:",
  "explanation": "Thứ tự đúng: rửa gạo, ngâm, cho vào nước, nấu cho đến chín",
  "category": "Chung",
  "difficulty": "Trung bình",
  "options": [
    "Nấu cho đến khi cơm chín",
    "Rửa gạo sạch",
    "Ngâm gạo 30 phút",
    "Cho gạo vào nước"
  ],
  "correctOrder": [1, 2, 3, 0]
}
```

**Giải thích:**
- `correctOrder`: Array chỉ số theo thứ tự đúng

---

### 2.9 Ghép đôi (Matching)
**Người dùng ghép các mục từ cột trái sang cột phải**

```json
{
  "type": "matching",
  "text": "Ghép thủ đô với nước tương ứng:",
  "explanation": "Mỗi nước có thủ đô riêng",
  "category": "Địa lý",
  "difficulty": "Trung bình",
  "leftItems": [
    { "id": "a", "text": "Việt Nam" },
    { "id": "b", "text": "Thái Lan" },
    { "id": "c", "text": "Nhật Bản" }
  ],
  "rightItems": [
    { "id": "1", "text": "Bangkok" },
    { "id": "2", "text": "Hà Nội" },
    { "id": "3", "text": "Tokyo" }
  ],
  "correctPairs": [
    { "left": "a", "right": "2" },
    { "left": "b", "right": "1" },
    { "left": "c", "right": "3" }
  ]
}
```

---

### 2.10 Đọc hiểu văn bản (Reading Comprehension)
**Bài đọc lớn với nhiều câu hỏi con**

```json
{
  "type": "reading",
  "text": "Văn bản để đọc:\n\nVietnam là một đất nước xinh đẹp nằm ở Đông Nam Á. Dân số khoảng 100 triệu người. Thủ đô là Hà Nội. Hà Nội có lịch sử hơn 1000 năm. Thành phố lớn nhất là Thành phố Hồ Chí Minh...",
  "explanation": "Đây là bài đọc về địa lý và lịch sử Việt Nam",
  "category": "Địa lý",
  "difficulty": "Trung bình",
  "subQuestions": [
    {
      "text": "Dân số Việt Nam khoảng bao nhiêu người?",
      "options": ["50 triệu", "100 triệu", "150 triệu", "200 triệu"],
      "correctIndex": 1
    },
    {
      "text": "Thủ đô của Việt Nam là thành phố nào?",
      "options": ["TPHCM", "Hải Phòng", "Hà Nội", "Đà Nẵng"],
      "correctIndex": 2
    },
    {
      "text": "Hà Nội có lịch sử bao lâu?",
      "options": ["500 năm", "800 năm", "1000 năm", "1500 năm"],
      "correctIndex": 2
    }
  ]
}
```

---

## 3. Ví dụ file JSON hoàn chỉnh

```json
{
  "title": "Đề thi Tư duy - Mẫu đầy đủ",
  "description": "Đề thi thử gồm các loại câu hỏi khác nhau",
  "type": "TSA",
  "durationMinutes": 60,
  "questions": [
    {
      "type": "multiple_choice",
      "text": "2 + 2 = ?",
      "explanation": "Đây là phép cộng cơ bản",
      "category": "Toán học (Định lượng)",
      "difficulty": "Dễ",
      "options": ["2", "3", "4", "5"],
      "correctIndex": 2
    },
    {
      "type": "essay",
      "text": "Viết bài luận về tầm quan trọng của giáo dục (500+ từ)",
      "explanation": "Bài luận cần có cấu trúc rõ ràng",
      "category": "Ngữ văn (Định tính)",
      "difficulty": "Khó",
      "correctAnswerText": "Giáo dục là nền tảng phát triển con người"
    },
    {
      "type": "reading",
      "text": "Bài đọc dài về lịch sử hoặc khoa học...",
      "explanation": "Kiểm tra kỹ năng đọc hiểu",
      "category": "Ngữ văn (Định tính)",
      "difficulty": "Trung bình",
      "subQuestions": [
        {
          "text": "Câu hỏi 1 về bài đọc?",
          "options": ["A", "B", "C", "D"],
          "correctIndex": 0
        }
      ]
    }
  ]
}
```

---

## 4. Trường thông tin bổ sung (Tùy chọn)

Bạn có thể thêm các trường sau để làm phong phú đề thi:

```json
{
  "type": "multiple_choice",
  "text": "Câu hỏi?",
  "image": "https://example.com/image.jpg",
  "tags": ["toán", "số học", "cộng"],
  "category": "Toán học (Định lượng)",
  "difficulty": "Dễ",
  "options": ["A", "B", "C", "D"],
  "correctIndex": 0,
  "explanation": "Giải thích chi tiết",
  "timer": 30
}
```

### Các loại category
- `"Toán học (Định lượng)"` - Toán
- `"Ngữ văn (Định tính)"` - Tiếng Việt
- `"Vật lý"` - Vật lý
- `"Hóa học"` - Hóa học
- `"Sinh học"` - Sinh học
- `"Lịch sử"` - Lịch sử
- `"Địa lý"` - Địa lý
- `"Tiếng Anh"` - Tiếng Anh
- `"Chung"` - Chung

### Độ khó
- `"Dễ"` - Dễ
- `"Trung bình"` - Trung bình
- `"Khó"` - Khó

---

## 5. Lưu ý quan trọng khi tạo file

✅ **Nên làm:**
- Sử dụng JSON hợp lệ (dùng https://jsonlint.com để kiểm tra)
- Đảm bảo `correctIndex` nằm trong phạm vi `options`
- Viết giải thích chi tiết cho mỗi câu
- Chọn category phù hợp
- Sử dụng UTF-8 encoding khi lưu file

❌ **Không nên:**
- Dùng dấu ngoặc kép không đóng trong text
- Để trống trường `text` hoặc `explanation`
- Sử dụng `correctIndex` không tồn tại
- Mix định dạng (vd: `correctIndex` cho essay questions)

---

## 6. Công cụ hỗ trợ

- **JSON Validator**: https://jsonlint.com
- **Format beautifier**: https://beautifier.io
- **Test JSON**: Copy-paste vào phần "Import Đề" trong ứng dụng

---

Chúc bạn tạo đề thi thành công! 🎓
