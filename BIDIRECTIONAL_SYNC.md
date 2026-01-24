# Bidirectional Sync Implementation

## 🔄 What Changed

Bạn yêu cầu máy của bạn trở thành "máy chủ" với tất cả dữ liệu cũ được đồng bộ tới các thiết bị khác. Tôi đã cập nhật hệ thống để làm điều này:

### Trước (One-way Sync)
```
Firestore → Download ↓ Device
(Chỉ tải xuống dữ liệu từ cloud)
```

### Bây giờ (Bidirectional Sync) 
```
Device ↑ Upload → Firestore ↓ Download → Other Devices
(Tải lên dữ liệu cũ trước, rồi tải xuống từ thiết bị khác)
```

## 📊 Quy Trình Đồng Bộ Mới

### Khi bạn đăng nhập:
1. **Bước 1**: Load dữ liệu cũ từ máy (IndexedDB)
   - Các đề thi cũ, các lần làm bài cũ được giữ lại

2. **Bước 2**: Upload lên Firestore  
   - Tất cả dữ liệu cũ được gửi lên cloud
   - Nếu dữ liệu đã có → Cập nhật
   - Nếu dữ liệu mới → Tạo mới

3. **Bước 3**: Download từ Firestore
   - Lấy dữ liệu từ các thiết bị khác
   - Lấy dữ liệu được cập nhật trên cloud

4. **Bước 4**: Hợp nhất thông minh
   - Giữ ưu tiên dữ liệu cũ (địa phương)
   - Thêm dữ liệu mới từ cloud

## 💻 Khi bạn tạo/chỉnh sửa dữ liệu:

### Tạo đề thi mới
```
Lưu vào máy (IndexedDB) 
    ↓ (nếu đã đăng nhập Firebase)
Upload lên Firestore 
    ↓
Tất cả thiết bị khác có thể xem ngay
```

### Làm bài thi
```
Nộp bài (lưu attempt vào máy) 
    ↓ (nếu đã đăng nhập Firebase)
Upload kết quả lên Firestore 
    ↓
Các thiết bị khác có thể xem lịch sử làm bài
```

### Import file đề thi
```
Nhập từ file JSON/CSV/TXT
    ↓
Lưu vào máy (IndexedDB)
    ↓ (nếu đã đăng nhập Firebase)
Upload lên Firestore
    ↓
Các thiết bị khác tự động có đề thi
```

## 🧪 Cách Kiểm Tra

### Test 1: Dữ liệu cũ được giữ lại
**Máy A:**
1. Tải app (chưa đăng nhập)
2. Tạo đề thi "Test Local" 
3. Đăng nhập Firebase (email: `test@example.com`)
4. ✅ Dữ liệu "Test Local" **vẫn còn** (không bị xóa)
5. Console sẽ hiện: "📤 Uploading local data to cloud..."

### Test 2: Đồng bộ với thiết bị khác
**Máy B (thiết bị khác):**
1. Mở URL app
2. Đăng nhập với **cùng email** (`test@example.com`)
3. ✅ "Test Local" từ Máy A **sẽ xuất hiện**
4. Dashboard sẽ hiện "🔄 Đang đồng bộ dữ liệu..."

### Test 3: Tạo mới trên Máy B
**Máy B:**
1. Tạo đề thi "Test Device B"
2. Logout rồi Login lại
3. ✅ "Test Device B" **vẫn còn**

**Máy A:**
1. Refresh lại hoặc Logout → Login
2. ✅ "Test Device B" từ Máy B **sẽ xuất hiện**

### Test 4: Tạo đề thi khi offline, sync khi online
**Máy A (Offline):**
1. Đăng nhập Firebase
2. Tắt internet
3. Tạo đề thi "Offline Test"
4. ✅ Lưu vào máy thành công

**Máy A (Online lại):**
1. Bật internet
2. Refresh lại app
3. Đăng nhập Firebase
4. ✅ "Offline Test" được upload lên cloud

**Máy B:**
1. Đăng nhập Firebase
2. ✅ "Offline Test" sẽ xuất hiện

## 📝 Các Hàm Mới được Thêm

### `uploadLocalDataToCloud(exams, attempts)`
- Upload tất cả dữ liệu cũ từ máy lên Firestore
- Được gọi khi đăng nhập

### `syncBidirectional(localExams, localAttempts)`
- Tải lên dữ liệu cũ trước
- Rồi tải xuống dữ liệu từ cloud
- Return dữ liệu hợp nhất

### `uploadLocalDataToCloud()` khi:
- Tạo đề thi mới (trong handleSaveEditor)
- Nộp bài thi (trong handleFinishExam)
- Import file đề thi (trong handleFileUpload)

## 🔐 Bảo Vệ Dữ Liệu

✅ Dữ liệu cũ **không bị xóa** khi đăng nhập  
✅ Tất cả dữ liệu **được upload lên cloud**  
✅ Không có **trùng lặp** (kiểm tra bằng ID)  
✅ **Ưu tiên dữ liệu cũ** khi merge  
✅ Tất cả thiết bị luôn có **phiên bản mới nhất**

## 🌐 URLs Đã Deploy

- **Firebase**: https://hethongluyenthi-e1386.web.app
- **Vercel**: https://tsa-master-pro.vercel.app

## 📝 Console Messages (Debug)

Khi đăng nhập, bạn sẽ thấy trong browser console (F12):
```
✅ Firebase user logged in: user@example.com
📦 Local data loaded: { exams: 5, attempts: 12 }
📤 Uploading local data to cloud...
✅ Exam synced to cloud: exam-id-1
✅ Exam synced to cloud: exam-id-2
...
✅ Merged data: { exams: 10, attempts: 20 }
✅ Bidirectional sync completed
```

## ⚙️ Cách Hoạt Động (Chi Tiết Kỹ Thuật)

```typescript
// Khi đăng nhập
const localExams = await getExams();        // Load từ IndexedDB
const localAttempts = await getAttempts();  

// Upload trước
await uploadLocalDataToCloud(localExams, localAttempts);

// Download sau
const { attempts, exams } = await downloadFrom(Firestore);

// Merge: local có ưu tiên
const combined = [
  ...local,  // Local first
  ...cloud.filter(c => !local.find(l => l.id === c.id))  // Only new from cloud
];
```

## ✨ Tóm Tắt Cải Tiến

| Tính Năng | Trước | Bây Giờ |
|-----------|-------|--------|
| Dữ liệu cũ khi login | ❌ Bị xóa | ✅ Được giữ lại |
| Upload dữ liệu cũ | ❌ Không | ✅ Tự động upload |
| Sync với thiết bị khác | ⚠️ Chỉ download | ✅ Upload + Download |
| Dữ liệu offline | ❌ Không | ✅ Sync khi online |
| Ưu tiên dữ liệu | ☁️ Cloud first | 💻 Local first |

---

**Status**: ✅ Deployed & Ready  
**Last Updated**: 2024-01-23
