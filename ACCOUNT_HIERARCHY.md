# Phân Cấp Tài Khoản Hệ Thống

## Tổng Quan
Hệ thống đã được cập nhật với một phân cấp tài khoản chuyên nghiệp gồm 3 cấp độ chính: **Admin**, **Teacher**, **Student**. Mỗi cấp độ có quyền hạn rõ ràng được định nghĩa.

## 1. Các Cấp Độ Tài Khoản

### 🔐 Admin (Quản Trị Viên)
**Mô tả:** Có toàn quyền quản lý hệ thống
- **Quyền hạn hoàn toàn:**
  - ✅ Tạo đề thi
  - ✅ Chỉnh sửa đề thi
  - ✅ Xóa đề thi
  - ✅ Xem tất cả đề thi (TSA & HSA)
  - ✅ Quản lý người dùng (tạo, sửa, xóa)
  - ✅ Xem kết quả thi
  - ✅ Xuất dữ liệu

**Hiển thị:** Badge xám - "Quản trị viên"

---

### 👨‍🏫 Teacher (Giáo Viên)
**Mô tả:** Có quyền tạo và quản lý đề thi, xem kết quả học sinh
- **Quyền hạn:**
  - ✅ Tạo đề thi
  - ✅ Chỉnh sửa đề thi (của riêng mình)
  - ❌ Xóa đề thi
  - ✅ Xem đề thi (theo phân loại TSA/HSA được cấp)
  - ❌ Quản lý người dùng
  - ✅ Xem kết quả thi
  - ✅ Xuất dữ liệu

**Hiển thị:** Badge xanh - "Giáo viên"

---

### 👨‍🎓 Student (Học Sinh)
**Mô tả:** Có quyền làm bài thi và xem kết quả của mình
- **Quyền hạn:**
  - ❌ Tạo đề thi
  - ❌ Chỉnh sửa đề thi
  - ❌ Xóa đề thi
  - ✅ Xem đề thi (theo phân loại TSA/HSA được cấp)
  - ❌ Quản lý người dùng
  - ✅ Xem kết quả thi (của riêng mình)
  - ❌ Xuất dữ liệu

**Hiển thị:** Badge xanh dương - "Học sinh"

---

## 2. Hệ Thống Quyền Chi Tiết

### Các Quyền Cụ Thể (Permissions)

| Quyền | Admin | Teacher | Student |
|-------|-------|---------|---------|
| `CREATE_EXAM` | ✅ | ✅ | ❌ |
| `EDIT_EXAM` | ✅ | ✅ | ❌ |
| `DELETE_EXAM` | ✅ | ❌ | ❌ |
| `VIEW_EXAM` | ✅ | ✅ | ✅ |
| `CREATE_USER` | ✅ | ❌ | ❌ |
| `EDIT_USER` | ✅ | ❌ | ❌ |
| `DELETE_USER` | ✅ | ❌ | ❌ |
| `VIEW_USER` | ✅ | ❌ | ❌ |
| `VIEW_RESULTS` | ✅ | ✅ | ✅ |
| `EXPORT_DATA` | ✅ | ✅ | ❌ |

---

## 3. Phân Loại Đề Thi

Mỗi tài khoản (ngoại trừ Admin) phải được cấp quyền truy cập vào ít nhất một loại đề thi:

- **TSA (Thinking Skills Assessment)** - Hệ tư duy
- **HSA (High School Assessment)** - Hệ đánh giá năng lực

Admin tự động có quyền truy cập cả hai.

---

## 4. Thông Tin Bổ Sung

Mỗi tài khoản có thể bao gồm:

- **Họ và tên** (Full Name)
- **Tên đăng nhập** (Username)
- **Mật khẩu** (Password)
- **Chức vụ** (Role)
- **Bộ môn/Khoa** (Department) - Tùy chọn
- **Loại đề thi được phép** (Allowed Exam Types)
- **Danh sách lớp quản lý** (Managed Classes) - Dành cho Teacher
- **Danh sách lớp được gán** (Assigned Classes) - Dành cho Student

---

## 5. Cách Tạo Tài Khoản Mới

### Bước 1: Đăng nhập bằng tài khoản Admin
### Bước 2: Truy cập "Quản lý Người dùng"
### Bước 3: Điền form "Cấp tài khoản mới" với:
   - ✏️ Họ và tên
   - ✏️ Tên đăng nhập
   - ✏️ Mật khẩu
   - ✏️ **Chức vụ** (Quản Trị Viên / Giáo Viên / Học Sinh)
   - ✏️ Bộ môn/Khoa (tùy chọn)
   - ✏️ Loại đề thi được phép (TSA / HSA)
### Bước 4: Nhấn "Tạo Tài Khoản"

---

## 6. Ví Dụ Kịch Bản

### Kịch Bản 1: Giáo viên Toán tạo đề thi
```
Tài khoản: teacher_math
Chức vụ: Giáo viên
Bộ môn: Toán
Loại đề: TSA, HSA
Quyền: Tạo & Chỉnh sửa đề → Không thể xóa → Xem kết quả
```

### Kịch Bản 2: Học sinh làm bài thi
```
Tài khoản: student_10a1
Chức vụ: Học sinh
Loại đề: TSA (được gán)
Quyền: Xem & Làm bài thi → Xem kết quả của riêng mình → Không thể chỉnh sửa
```

### Kịch Bản 3: Admin quản lý hệ thống
```
Tài khoản: admin
Chức vụ: Quản Trị Viên
Quyền: Toàn quyền trên tất cả tính năng
```

---

## 7. Thay Đổi Từ Hệ Thống Cũ

| Tính Năng | Trước | Sau |
|-----------|-------|-----|
| **Cấp độ người dùng** | 2 cấp (Admin / User) | 3 cấp (Admin / Teacher / Student) |
| **Phân quyền** | Đơn giản (Admin chỉ) | Chi tiết (11 quyền riêng biệt) |
| **Quản lý Bộ môn** | Không có | Có (Department field) |
| **Quản lý Lớp** | Không có | Có (managedClasses / assignedClasses) |
| **Hiển thị Quyền** | Chỉ TSA/HSA badges | Role + Department + TSA/HSA |
| **Xóa Đề Thi** | Chỉ Admin | Chỉ Admin (Teacher không thể) |

---

## 8. Ghi Chú Bảo Mật

⚠️ **Admin mặc định:**
- Username: `admin` (không thể xóa)
- Không nên chia sẻ tài khoản admin

⚠️ **Bảo mật mật khẩu:**
- Mỗi người dùng nên có mật khẩu riêng
- Admin nên thay đổi mật khẩu định kỳ

⚠️ **Xóa người dùng:**
- Chỉ Admin có thể xóa người dùng
- Không thể xóa tài khoản admin mặc định

---

## 9. Hỗ Trợ & Câu Hỏi Thường Gặp

**Q: Làm cách nào để thay đổi chức vụ của một người dùng?**
A: Hiện tại cần xóa và tạo lại tài khoản với chức vụ mới.

**Q: Student có thể chỉnh sửa đáp án của mình không?**
A: Không. Student chỉ có thể xem kết quả, không thể chỉnh sửa.

**Q: Làm cách nào để cấp quyền cho Teacher xóa đề?**
A: Hiện tại Teacher không có quyền xóa. Cần Admin thực hiện.

---

**Cập nhật:** 23/01/2026
