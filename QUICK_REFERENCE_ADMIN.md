# 🎴 Quick Reference Card: Admin Toàn Hệ Thống

## 📌 PIN THIS - Hướng Dẫn Nhanh (1 phút)

### ⏱️ Chỉ Làm 1 Lần

```
Thời gian: ~2 phút
Bước: 6 bước
Kết quả: Admin hoạt động trên tất cả máy ✅
```

---

## 🔥 6 Bước Nhanh

### 1️⃣ Terminal
```bash
npm run dev
```

### 2️⃣ DevTools
```
F12 → Console
```

### 3️⃣ Copy & Paste
```javascript
const setupGlobalAdmin = async () => {
  const auth = (await import('./services/firebaseConfig.ts')).auth;
  const db = (await import('./services/firebaseConfig.ts')).db;
  const { createUserWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js');
  const { setDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js');
  const userCredential = await createUserWithEmailAndPassword(auth, 'admin@hethongluyenthi.vn', 'Admin@Hethong123');
  const adminUser = userCredential.user;
  await setDoc(doc(db, 'users', adminUser.uid), { uid: adminUser.uid, email: 'admin@hethongluyenthi.vn', role: 'admin', fullName: 'Quản Trị Viên Hệ Thống', permissions: ['CREATE_EXAM', 'EDIT_EXAM', 'DELETE_EXAM', 'VIEW_EXAM', 'CREATE_USER', 'EDIT_USER', 'DELETE_USER', 'VIEW_USER', 'VIEW_RESULTS', 'EXPORT_DATA'], allowedExamTypes: ['TSA', 'HSA'], registeredAt: Date.now(), isGlobalAdmin: true });
  console.log('✅ ADMIN CREATED: admin@hethongluyenthi.vn / Admin@Hethong123');
};
setupGlobalAdmin();
```

### 4️⃣ Enter
```
Chờ thấy: ✅ ADMIN CREATED
```

### 5️⃣ Refresh
```
F5
```

### 6️⃣ Login
```
📧 admin@hethongluyenthi.vn
🔐 Admin@Hethong123
```

---

## ✅ Xong!

Bây giờ đăng nhập được trên **MỌI máy**

```
Máy A, B, C, D... → Cùng tài khoản ✅
```

---

## 💾 Lưu Lại

```
📧 Email:    admin@hethongluyenthi.vn
🔐 Password: Admin@Hethong123
🌐 Scope:    Toàn hệ thống
```

---

## 🚀 Test

**Máy A:** Đăng nhập → OK ✅
**Máy B:** Đăng nhập → OK ✅
**Máy C:** Đăng nhập → OK ✅

---

## ⚠️ Nếu Lỗi

| Lỗi | Fix |
|-----|-----|
| email-already-in-use | Delete old in Firebase |
| weak-password | Dùng: `Admin@Hethong123` |
| Permission denied | Check Firestore Rules |
| Can't import | Wait & reload (F5) |

---

## 📚 Docs

- 📖 [TAO_ADMIN_TOAN_HE_THONG.md](./TAO_ADMIN_TOAN_HE_THONG.md) - Chi tiết
- 🖼️ [HUONG_DAN_DANG_NHAP_NHIEU_MAY.md](./HUONG_DAN_DANG_NHAP_NHIEU_MAY.md) - Hình ảnh
- ✅ [CHECKLIST_TAO_ADMIN.md](./CHECKLIST_TAO_ADMIN.md) - Checklist
- 🆘 [CROSS_DEVICE_LOGIN_FIX.md](./CROSS_DEVICE_LOGIN_FIX.md) - Lỗi?
- 📋 [ADMIN_TOAN_HE_THONG_SUMMARY.md](./ADMIN_TOAN_HE_THONG_SUMMARY.md) - Tóm tắt

---

## 🎯 Tiếp Theo

1. ✅ Setup admin
2. → Tạo teacher account
3. → Tạo student account
4. → Tạo đề thi
5. → Dạy học

---

**Lưu QR hoặc link của tài liệu này để dễ tìm lại**

```
https://github.com/YOUR_REPO/TAO_ADMIN_TOAN_HE_THONG.md
```

---

**Ngày:** 23/01/2026 | **Status:** ✅ Ready | **Version:** 1.0
