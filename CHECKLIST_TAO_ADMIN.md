# ✅ Checklist: Tạo Admin Toàn Hệ Thống

## 📋 Chuẩn Bị

- [ ] Có máy tính/laptop với Node.js
- [ ] Clone/có code dự án TSA
- [ ] Trình duyệt (Chrome, Firefox, Safari)
- [ ] Kết nối internet

---

## 🔧 Bước 1: Chuẩn Bị Code

```bash
# 1. Mở terminal/command prompt
# 2. Vào thư mục dự án
cd path/to/tsa-master-pro

# 3. Cài đặt dependencies (nếu chưa)
npm install

# 4. Kiểm tra Firebase config
# Kiểm tra services/firebaseConfig.ts có dữ liệu
```

**Status:**
- [ ] Cd vào đúng thư mục
- [ ] Chạy npm install thành công
- [ ] Không có error liên quan Firebase

---

## 🚀 Bước 2: Khởi Động Ứng Dụng

```bash
npm run dev
```

**Status:**
- [ ] Terminal hiển thị: "Local: http://localhost:5173"
- [ ] Trình duyệt tự động mở ứng dụng
- [ ] Trang login hiển thị bình thường

---

## 🔓 Bước 3: Mở Console

```
F12 → Console tab
```

**Status:**
- [ ] DevTools mở thành công
- [ ] Tab Console active
- [ ] Thấy console logs bình thường (không có lỗi đỏ)

---

## 📝 Bước 4: Dán Mã

Sao chép mã từ file `setup-global-admin.js` hoặc dán trực tiếp:

```javascript
const setupGlobalAdmin = async () => {
  try {
    const auth = (await import('./services/firebaseConfig.ts')).auth;
    const db = (await import('./services/firebaseConfig.ts')).db;
    const { createUserWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js');
    const { setDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js');

    const userCredential = await createUserWithEmailAndPassword(auth, 'admin@hethongluyenthi.vn', 'Admin@Hethong123');
    const adminUser = userCredential.user;

    await setDoc(doc(db, 'users', adminUser.uid), {
      uid: adminUser.uid,
      email: 'admin@hethongluyenthi.vn',
      role: 'admin',
      fullName: 'Quản Trị Viên Hệ Thống',
      permissions: ['CREATE_EXAM', 'EDIT_EXAM', 'DELETE_EXAM', 'VIEW_EXAM', 'CREATE_USER', 'EDIT_USER', 'DELETE_USER', 'VIEW_USER', 'VIEW_RESULTS', 'EXPORT_DATA'],
      allowedExamTypes: ['TSA', 'HSA'],
      registeredAt: Date.now(),
      isGlobalAdmin: true
    });

    console.log('🎉 THÀNH CÔNG!');
    console.log('Email: admin@hethongluyenthi.vn');
    console.log('Mật khẩu: Admin@Hethong123');
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
};

setupGlobalAdmin();
```

**Status:**
- [ ] Mã được dán vào console
- [ ] Không có lỗi syntax (màu đỏ)

---

## ⚡ Bước 5: Chạy

```
Nhấn Enter
```

**Status:**
- [ ] Console hiển thị:
  ```
  🎉 THÀNH CÔNG!
  Email: admin@hethongluyenthi.vn
  Mật khẩu: Admin@Hethong123
  ```

---

## 🔄 Bước 6: Làm Mới Trang

```
F5 hoặc Ctrl+R
```

**Status:**
- [ ] Trang load lại
- [ ] Vẫn thấy form login

---

## 🔓 Bước 7: Đăng Nhập Lần 1

```
Email: admin@hethongluyenthi.vn
Mật khẩu: Admin@Hethong123
```

**Status:**
- [ ] Đăng nhập thành công
- [ ] Vào được Dashboard
- [ ] Thấy tùy chọn quản lý hệ thống (admin)

---

## 📱 Bước 8: Kiểm Tra Trên Máy Khác

**Máy B (khác):**
```
1. Mở ứng dụng
2. Nhập cùng email/mật khẩu
3. Đăng nhập
```

**Status:**
- [ ] Đăng nhập thành công trên máy khác
- [ ] Cùng tài khoản hoạt động ✅

---

## 💾 Bước 9: Lưu Thông Tin

```
📧 Email:    admin@hethongluyenthi.vn
🔐 Mật khẩu: Admin@Hethong123
🆔 Loại:     Admin toàn hệ thống
```

**Status:**
- [ ] Lưu email/mật khẩu ở nơi an toàn
- [ ] Không chia sẻ với người không được phép

---

## 🔒 Bước 10: Bảo Mật (Tuỳ Chọn)

```
1. Đăng nhập vào ứng dụng
2. Vào Settings
3. Đổi mật khẩu thành mật khẩu mạnh khác
```

**Status:**
- [ ] Mật khẩu đã đổi (nếu muốn)
- [ ] Lưu mật khẩu mới

---

## 📊 Tóm Tắt Thành Công

| Công Việc | Status | Ghi Chú |
|----------|--------|--------|
| Setup code | ✅ | |
| Tạo admin | ✅ | |
| Đăng nhập máy A | ✅ | |
| Đăng nhập máy B | ✅ | |
| Hoạt động toàn hệ | ✅ | |

---

## 🆘 Nếu Có Lỗi

### Lỗi gì?
- [ ] email-already-in-use
- [ ] weak-password
- [ ] invalid-email
- [ ] Permission denied
- [ ] Cái khác: _____________

### Cách khắc phục:
1. Xem file [CROSS_DEVICE_LOGIN_FIX.md](./CROSS_DEVICE_LOGIN_FIX.md)
2. Hoặc file [TAO_ADMIN_TOAN_HE_THONG.md](./TAO_ADMIN_TOAN_HE_THONG.md)

---

## 🎯 Tiếp Theo (Sau Khi Setup)

- [ ] Tạo tài khoản teacher
- [ ] Tạo tài khoản student
- [ ] Tạo đề thi đầu tiên
- [ ] Thêm câu hỏi
- [ ] Test trên mobile/tablet
- [ ] Share link với người khác

---

## 📞 Hỗ Trợ

Nếu có vấn đề:
1. Kiểm tra lại các bước trên
2. Xem file hướng dẫn liên quan
3. Chụp ảnh console error nếu có
4. Liên hệ IT support

---

✅ **Chúc bạn thành công!**

---

**Ngày tạo:** 23/01/2026
**Phiên bản:** 1.0
**Trạng thái:** Hoạt động bình thường
