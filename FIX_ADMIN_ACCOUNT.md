# 🔧 HƯỚNG DẪN FIX ADMIN ACCOUNT - BƯỚC CHI TIẾT

## ⚠️ Trước khi bắt đầu - Kiểm tra vấn đề

Hãy chọn vấn đề bạn gặp:

### ❌ **Vấn đề 1: Không thể login**
- Nhập email/password nhưng báo lỗi "email not found" hoặc "wrong password"

### ❌ **Vấn đề 2: Login được nhưng không thấy menu admin**
- Đăng nhập thành công
- Nhưng không thấy nút "Tải đề thi", "Quản lý user", v.v.

### ❌ **Vấn đề 3: Admin account không tồn tại**
- Cần tạo mới admin account từ đầu

---

## ✅ CÁCH 1: Setup Admin Nhanh Nhất (2 phút)

### **Bước 1: Mở app → F12 → Console**

```javascript
// Dán code này vào console:

const createAdmin = async () => {
  try {
    // Import Firebase
    const { createUserWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js');
    const { setDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js');
    const { auth, db } = await import('./services/firebaseConfig.ts');

    // Admin credentials
    const email = 'admin@hethongluyenthi.vn';
    const password = 'Admin@Hethong123';

    console.log('🔄 Tạo admin account...');
    
    // Tạo user Firebase
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const adminUser = userCredential.user;
    
    console.log('✅ User Firebase tạo thành công:', adminUser.uid);
    
    // Tạo profile admin trong Firestore
    await setDoc(doc(db, 'users', adminUser.uid), {
      uid: adminUser.uid,
      email: email,
      role: 'admin',  // ← QUAN TRỌNG: phải có 'admin' role
      fullName: 'Quản Trị Viên Hệ Thống',
      department: 'Administration',
      permissions: [
        'CREATE_EXAM', 'EDIT_EXAM', 'DELETE_EXAM', 'VIEW_EXAM',
        'CREATE_USER', 'EDIT_USER', 'DELETE_USER', 'VIEW_USER',
        'VIEW_RESULTS', 'EXPORT_DATA'
      ],
      allowedExamTypes: ['TSA', 'HSA'],
      registeredAt: Date.now(),
      isGlobalAdmin: true,
      syncEnabled: true,
      devices: []
    });
    
    console.log('✅ Admin profile tạo trong Firestore');
    console.log('📧 Email:', email);
    console.log('🔐 Password:', password);
    console.log('\n✨ Làm mới trang (F5) và login!');
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    if (error.code === 'auth/email-already-in-use') {
      console.log('⚠️  Email này đã được dùng. Xóa user cũ trong Firebase Console rồi thử lại.');
    }
  }
};

createAdmin();
```

### **Bước 2: Refresh trang (F5)**

### **Bước 3: Login với credentials**
- Email: `admin@hethongluyenthi.vn`
- Password: `Admin@Hethong123`

---

## ✅ CÁCH 2: Nếu vẫn không hoạt động

### **Kiểm tra 1: Admin role trong Firestore**

```javascript
// Console:
const { auth, db } = await import('./services/firebaseConfig.ts');
const { getDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js');

const uid = auth.currentUser?.uid;
if (!uid) {
  console.log('❌ Chưa login');
} else {
  const userDoc = await getDoc(doc(db, 'users', uid));
  console.log('👤 User data:', userDoc.data());
  console.log('🔑 Role:', userDoc.data()?.role);
}
```

### **Kiểm tra 2: Xóa user cũ & tạo lại**

1. Vào [Firebase Console](https://console.firebase.google.com)
2. Select project `hethongluyenthi-e1386`
3. **Authentication** → Tìm user cũ → Click 3 dots → Delete
4. **Firestore Database** → Collection `users` → Xóa document cũ
5. Chạy lại code ở CÁCH 1

---

## ✅ CÁCH 3: Setup bằng Node.js

Nếu có file `servieAccountKey.json`:

```bash
node create-admin-auto.js
```

---

## 🎯 Kiểm tra Admin Account Hoạt Động

Sau khi login, bạn sẽ thấy:
- ✅ Nút "📥 Import Đề Thi" (upload đề)
- ✅ Nút "👥 Quản Lý User" (manage users)
- ✅ Nút "📊 Admin Dashboard" (xem stats)

Nếu không thấy → Vấn đề là role không được set đúng.

---

## 🔍 Debug: Tìm vấn đề

**Nếu login được nhưng không thấy admin menu:**

```javascript
// Console:
const { auth, db } = await import('./services/firebaseConfig.ts');
const { getDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js');

const user = auth.currentUser;
console.log('👤 Current user:', user?.email);
console.log('🔑 UID:', user?.uid);

const userDoc = await getDoc(doc(db, 'users', user.uid));
const userData = userDoc.data();
console.log('📋 Firestore user data:', userData);
console.log('❓ Role là:', userData?.role);

if (userData?.role !== 'admin') {
  console.log('⚠️  VẤN ĐỀ: Role không phải "admin"');
  console.log('   Hiện tại là:', userData?.role);
}
```

---

## 💡 Credentials Thường Dùng

| Field | Value |
|-------|-------|
| Email | `admin@hethongluyenthi.vn` |
| Password | `Admin@Hethong123` |
| Role | `admin` |

---

**Cần giúp gì thêm? Hãy cho biết output của console khi chạy code trên!**
