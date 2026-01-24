# 📱 Hướng Dẫn: Đăng Nhập Admin Trên Nhiều Máy

## Mục Tiêu
Tạo **1 tài khoản admin** có thể **đăng nhập từ bất kỳ máy nào** (laptop, desktop, mobile)

---

## 🎯 Giải Pháp: Sử Dụng Firebase Authentication

Firebase lưu trữ tài khoản trên **máy chủ đám mây**, không phải máy tính cá nhân → **Hoạt động mọi nơi**

```
Máy A ─── [Firebase Authentication] ──── Máy B
                    ↑
                  Máy C
```

---

## ⚡ Thực Hiện (4 bước)

### 📍 Bước 1: Khởi động ứng dụng

```bash
npm run dev
```
Mở trình duyệt: `http://localhost:5173`

---

### 📍 Bước 2: Mở DevTools Console

```
1. Nhấn F12 (hoặc Ctrl+Shift+I)
2. Chọn tab Console
```

**Hình ảnh:**
```
┌─ Browser ─────────────────────────┐
│                                   │
│ [Mở DevTools]  [F12]  [Console]  │  ← Click Console
│                                   │
│ Console log area                  │  ← Dán mã ở đây
│ > _                               │
│                                   │
└───────────────────────────────────┘
```

---

### 📍 Bước 3: Dán mã tạo admin

**Copy toàn bộ mã này:**

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

**Dán vào console:**
```
┌─ Console ─────────────────────────────────┐
│                                           │
│ > const setupGlobalAdmin = async () => {  │
│   ...                                     │  ← Dán tại đây
│   setupGlobalAdmin();                     │
│                                           │
│ ← Nhấn Enter                              │
│                                           │
└───────────────────────────────────────────┘
```

---

### 📍 Bước 4: Nhấn Enter và chờ

```javascript
// Bạn sẽ thấy:
✅ THÀNH CÔNG!
Email: admin@hethongluyenthi.vn
Mật khẩu: Admin@Hethong123
```

---

## 🔓 Đăng Nhập

### Trên máy này:
1. Nhấn `F5` để làm mới trang
2. Nhập:
   - **Email:** `admin@hethongluyenthi.vn`
   - **Mật khẩu:** `Admin@Hethong123`
3. Nhấn **Đăng nhập**

### Trên máy khác:
1. Mở `http://localhost:5173` (hoặc URL ứng dụng)
2. Nhập **cùng email và mật khẩu** ✅
3. Đăng nhập thành công 🎉

---

## ✅ Kiểm Tra Hoạt Động

### Scenario: 2 máy tính

**Máy A (Desktop):**
```
1. Đăng nhập: admin@hethongluyenthi.vn / Admin@Hethong123
2. Tạo đề thi: "Đề TSA mẫu"
3. Lưu
```

**Máy B (Laptop):**
```
1. Mở ứng dụng
2. Đăng nhập: admin@hethongluyenthi.vn / Admin@Hethong123
3. Vào Dashboard
4. Thấy "Đề TSA mẫu" từ Máy A ✅
```

---

## 🔐 Bảo Mật

| Việc Cần Làm | Mô Tả |
|-------------|-------|
| ✅ Lưu mật khẩu | Lưu ở nơi an toàn (password manager) |
| ✅ Bảo vệ email | Dùng email công ty an toàn |
| ✅ Đổi mật khẩu | Sau lần đầu tiên, thay mật khẩu mạnh hơn |
| ❌ Không chia sẻ | Không cho người không được phép |
| ❌ Không lưu công khai | Không dán trên bảng trắng |

---

## 🆘 Xử Lý Lỗi

### Lỗi 1: "email-already-in-use"
```
⚠️  Email đã tồn tại

Cách sửa:
1. Vào Firebase Console
2. Xóa user cũ
3. Thực hiện lại bước 3
```

### Lỗi 2: "weak-password"
```
⚠️  Mật khẩu quá đơn giản

Cách sửa:
Dùng mật khẩu: Admin@Hethong123
(Có chữ hoa, số, ký tự đặc biệt)
```

### Lỗi 3: "Permission denied"
```
⚠️  Firestore rules không cho phép

Cách sửa:
1. Vào Firebase Console
2. Kiểm tra Firestore Rules
3. Đảm bảo user có quyền read/write
```

### Lỗi 4: Không thấy dòng nào trong console
```
⚠️  Firebase không load

Cách sửa:
1. Kiểm tra: npm run dev chạy bình thường?
2. Kiểm tra console có lỗi gì trước khi chạy mã?
3. Thử reload trang (F5) và chạy lại
```

---

## 📊 So Sánh: Local vs Firebase

| Tính Năng | Local (cũ) | Firebase (mới) |
|----------|---------|---------|
| Đăng nhập trên máy khác | ❌ Không | ✅ Có |
| Hoạt động offline | ✅ Có | ❌ Không (nhưng có cache) |
| Dữ liệu lưu ở đâu | Máy tính | Đám mây |
| Bảo mật | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Đồng bộ tự động | ❌ Không | ✅ Có |

---

## 🎯 Workflow Khuyến Nghị

```
Lần 1: Tạo admin toàn hệ thống (ở nhà)
    ↓
Lần 2: Dạy học (ở trường - máy khác)
    ↓
Lần 3: Sửa đề thi (ở nhà - máy khác)
    ↓
Tất cả dữ liệu đồng bộ tự động ✅
```

---

## 📞 Liên Hệ Hỗ Trợ

Nếu còn lỗi khác:
1. Chụp ảnh console error
2. Ghi chú lỗi
3. Liên hệ IT support

---

## 📚 Tài Liệu Liên Quan

- [TAO_ADMIN_TOAN_HE_THONG.md](./TAO_ADMIN_TOAN_HE_THONG.md) - Hướng dẫn chi tiết
- [CROSS_DEVICE_LOGIN_FIX.md](./CROSS_DEVICE_LOGIN_FIX.md) - Khắc phục lỗi đăng nhập
- [ADMIN_ACCOUNT_SETUP.md](./ADMIN_ACCOUNT_SETUP.md) - Setup admin cơ bản
