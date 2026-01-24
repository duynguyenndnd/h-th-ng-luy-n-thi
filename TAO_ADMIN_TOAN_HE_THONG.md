# 🔐 Tạo Tài Khoản Admin Toàn Hệ Thống

**Tài khoản này sẽ hoạt động trên tất cả các máy/thiết bị**

---

## ⚡ Cách Nhanh Nhất (2 phút)

### Bước 1: Khởi động ứng dụng
```bash
npm run dev
```

### Bước 2: Mở DevTools
- Nhấn `F12` trên bàn phím
- Chọn tab **Console**

### Bước 3: Dán mã tạo admin
Sao chép và dán toàn bộ mã này vào console:

```javascript
const setupGlobalAdmin = async () => {
  console.log('🔄 Đang tạo tài khoản admin toàn hệ thống...');

  try {
    const auth = (await import('./services/firebaseConfig.ts')).auth;
    const db = (await import('./services/firebaseConfig.ts')).db;
    
    const { createUserWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js');
    const { setDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js');

    console.log('📝 Tạo user Firebase...');

    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      'admin@hethongluyenthi.vn', 
      'Admin@Hethong123'
    );
    const adminUser = userCredential.user;

    console.log('✅ User Firebase đã tạo');

    console.log('📝 Tạo profile admin trong Firestore...');

    await setDoc(doc(db, 'users', adminUser.uid), {
      uid: adminUser.uid,
      email: 'admin@hethongluyenthi.vn',
      role: 'admin',
      fullName: 'Quản Trị Viên Hệ Thống',
      department: 'Administration',
      permissions: [
        'CREATE_EXAM', 'EDIT_EXAM', 'DELETE_EXAM', 'VIEW_EXAM',
        'CREATE_USER', 'EDIT_USER', 'DELETE_USER', 'VIEW_USER',
        'VIEW_RESULTS', 'EXPORT_DATA'
      ],
      allowedExamTypes: ['TSA', 'HSA'],
      registeredAt: Date.now(),
      isGlobalAdmin: true
    });

    console.log('✅ Profile admin đã tạo');

    console.log(`
╔════════════════════════════════════════════════════════╗
║   🎉 TÀI KHOẢN ADMIN TOÀN HỆ THỐNG ĐÃ TẠO THÀNH CÔNG  ║
╚════════════════════════════════════════════════════════╝

📧 Email:    admin@hethongluyenthi.vn
🔐 Mật khẩu: Admin@Hethong123
✨ Hoạt động trên TẤT CẢ máy/thiết bị

👉 BƯỚC TIẾP THEO:
1. Nhấn F5 để làm mới trang
2. Đăng nhập với email và mật khẩu trên
3. Thử đăng nhập trên máy khác
4. Đổi mật khẩu sau lần đăng nhập đầu tiên

⚠️  QUAN TRỌNG:
- Lưu email và mật khẩu ở nơi an toàn
- Không chia sẻ với người không được phép
- Đổi mật khẩu thường xuyên
`);

    return true;

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('⚠️  Email đã được sử dụng. Xóa user cũ trong Firebase Console hoặc dùng email khác');
    } else if (error.code === 'auth/weak-password') {
      console.log('⚠️  Mật khẩu quá yếu. Cần: ít nhất 6 ký tự, hoa thường, số, ký tự đặc biệt');
    }
    
    return false;
  }
};

setupGlobalAdmin();
```

### Bước 4: Nhấn Enter
Chờ khoảng 2-3 giây, bạn sẽ thấy:
```
✅ User Firebase đã tạo
✅ Profile admin đã tạo

🎉 TÀI KHOẢN ADMIN TOÀN HỆ THỐNG ĐÃ TẠO THÀNH CÔNG

📧 Email:    admin@hethongluyenthi.vn
🔐 Mật khẩu: Admin@Hethong123
✨ Hoạt động trên TẤT CẢ máy/thiết bị
```

### Bước 5: Làm mới trang
- Nhấn `F5` để làm mới

### Bước 6: Đăng nhập
- **Email:** `admin@hethongluyenthi.vn`
- **Mật khẩu:** `Admin@Hethong123`

### Bước 7: Kiểm tra trên máy khác
Mở ứng dụng trên máy tính/điện thoại khác và đăng nhập với **cùng email và mật khẩu** ✅

---

## ✅ Xác Minh Hoạt Động

### Kiểm tra trên máy 1:
1. Đăng nhập: `admin@hethongluyenthi.vn` / `Admin@Hethong123`
2. Tạo một đề thi

### Kiểm tra trên máy 2:
1. Mở ứng dụng
2. Đăng nhập với cùng tài khoản
3. Thấy đề thi từ máy 1 ✅

---

## 🔧 Khắc Phục Lỗi

| Lỗi | Giải Pháp |
|-----|----------|
| "email-already-in-use" | Xóa user cũ trong Firebase Console, sau đó thử lại |
| "weak-password" | Dùng mật khẩu: `Admin@Hethong123` |
| "invalid-email" | Dùng email: `admin@hethongluyenthi.vn` |
| Console hiển thị lỗi khác | Kiểm tra Firebase đã load, kiểm tra console.log đầu |

---

## 📋 Chi Tiết Tài Khoản

**Tài khoản admin toàn hệ thống:**
- **Email:** admin@hethongluyenthi.vn
- **Mật khẩu:** Admin@Hethong123
- **Vai trò:** Quản trị viên
- **Phạm vi:** Tất cả máy/thiết bị
- **Quyền:** Tất cả (tạo/sửa/xóa đề, quản lý user, xem kết quả...)

---

## 🔐 Bảo Mật

⚠️ **Cần làm:**
1. ✅ Lưu email và mật khẩu ở nơi an toàn
2. ✅ Không chia sẻ với người không được phép
3. ✅ Đổi mật khẩu sau lần đăng nhập đầu tiên
4. ✅ Sử dụng mật khẩu mạnh (chữ hoa, thường, số, ký tự đặc biệt)

---

## ❓ Câu Hỏi Thường Gặp

**Q: Tài khoản có hoạt động trên mobile không?**
A: Có, hoạt động trên tất cả thiết bị (desktop, tablet, mobile)

**Q: Nếu quên mật khẩu thì sao?**
A: Dùng Firebase Console để reset mật khẩu

**Q: Có thể tạo nhiều admin không?**
A: Có, tạo tương tự nhưng dùng email khác

**Q: Dữ liệu có đồng bộ giữa các máy không?**
A: Có, tất cả được lưu trong Firestore và đồng bộ tự động

---

## 🆘 Cần Giúp?

Nếu có lỗi khác, hãy cho tôi biết:
1. Mã lỗi (nếu có)
2. Tin nhắn lỗi
3. Những bước bạn đã làm

---

## 🎯 Tiếp Theo

Sau khi tạo admin xong:

1. **Tạo tài khoản khác** (teacher, student)
2. **Tạo đề thi** đầu tiên
3. **Thêm câu hỏi** vào đề
4. **Đăng nhập từ máy khác** để kiểm tra sync

---

Xem thêm: [ADMIN_ACCOUNT_SETUP.md](./ADMIN_ACCOUNT_SETUP.md), [CROSS_DEVICE_LOGIN_FIX.md](./CROSS_DEVICE_LOGIN_FIX.md)
