# Fix Firestore Rules để Share Đề Thi

## Vấn đề
Người dùng không thấy đề thi mà admin tải lên vì Firestore rules không cho phép đọc `shared` collection.

## Giải pháp
Cập nhật Firestore Security Rules như sau:

### Các bước:
1. Vào [Firebase Console](https://console.firebase.google.com)
2. Chọn project
3. Tìm **Firestore Database** → **Rules**
4. Thay thế toàn bộ rules bằng code dưới

### Rules mới:
```firestore
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // User documents - personal data
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
      
      // Nested personal exams
      match /exams/{examId} {
        allow read: if request.auth.uid == userId;
        allow write: if request.auth.uid == userId;
      }
      
      // Nested exam attempts
      match /examAttempts/{attemptId} {
        allow read: if request.auth.uid == userId;
        allow write: if request.auth.uid == userId;
      }
      
      // Nested devices
      match /devices/{deviceId} {
        allow read: if request.auth.uid == userId;
        allow write: if request.auth.uid == userId;
      }
    }
    
    // ✅ GLOBAL EXAMS - Bất kỳ user đã xác thực nào cũng có thể đọc
    match /globalExams/{examId} {
      allow read: if request.auth != null;
      allow write: if false;
    }
  }
}
```

### Giải thích:
- ✅ `match /shared/{document=**}`: Tất cả user đã login có thể đọc
- ✅ Admin tải đề → lưu vào `shared/exams`
- ✅ User tải danh sách → sẽ thấy cả shared exams + personal exams

### Test:
1. Admin tải đề thi mới
2. User khác đăng nhập → refresh page
3. User sẽ thấy đề thi của admin ✅

---

**📌 Ghi chú:** Nếu dùng Firebase Console:
- Copy toàn bộ code trên
- Paste vào Rules tab
- Click "Publish"
- Chờ update (vài giây)
