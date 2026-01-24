#!/usr/bin/env node

/**
 * 🔐 Tạo Admin Account Toàn Hệ Thống - Tự Động
 * 
 * Script này tạo admin account bằng Firebase Admin SDK
 * Chỉ cần chạy 1 lần: node create-admin-auto.js
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createGlobalAdmin() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║     🔐 TẠO ADMIN ACCOUNT TOÀN HỆ THỐNG - TỰ ĐỘNG        ║
╚═══════════════════════════════════════════════════════════╝
`);

  try {
    // 1. Tìm service account key
    console.log('📝 Bước 1: Tìm Firebase credentials...');
    
    const keyPaths = [
      path.join(__dirname, 'servieAccountKey.json'),
      path.join(__dirname, 'serviceAccountKey.json'),
      path.join(__dirname, 'firebase-key.json'),
    ];

    let serviceAccountPath = null;
    for (const p of keyPaths) {
      if (fs.existsSync(p)) {
        serviceAccountPath = p;
        break;
      }
    }

    if (!serviceAccountPath) {
      throw new Error(`❌ Không tìm thấy Firebase credentials file!
      
Cần tìm một trong các file:
- servieAccountKey.json
- serviceAccountKey.json
- firebase-key.json

Vui lòng đặt file vào thư mục gốc dự án.`);
    }

    console.log('✅ Tìm thấy:', path.basename(serviceAccountPath));

    // 2. Tải service account
    console.log('📝 Bước 2: Tải Firebase Admin SDK...');
    
    const serviceAccountData = fs.readFileSync(serviceAccountPath, 'utf8');
    const serviceAccount = JSON.parse(serviceAccountData);
    
    // 3. Khởi tạo Firebase Admin
    console.log('📝 Bước 3: Khởi tạo Firebase...');
    
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }

    const auth = admin.auth();
    const db = admin.firestore();

    // 4. Admin credentials
    const ADMIN_EMAIL = 'admin@hethongluyenthi.vn';
    const ADMIN_PASSWORD = 'Admin@Hethong123';

    console.log('📝 Bước 4: Tạo user Firebase...');

    // Kiểm tra user đã tồn tại
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(ADMIN_EMAIL);
      console.log('⚠️  User đã tồn tại, sử dụng user cũ');
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Tạo user mới
        userRecord = await auth.createUser({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          displayName: 'Quản Trị Viên Hệ Thống',
          emailVerified: true,
        });
        console.log('✅ User Firebase tạo mới:', userRecord.uid);
      } else {
        throw error;
      }
    }

    // 5. Tạo/cập nhật Firestore profile
    console.log('📝 Bước 5: Tạo admin profile trong Firestore...');

    const adminProfile = {
      uid: userRecord.uid,
      email: ADMIN_EMAIL,
      role: 'admin',
      fullName: 'Quản Trị Viên Hệ Thống',
      department: 'Administration',
      permissions: [
        'CREATE_EXAM',
        'EDIT_EXAM',
        'DELETE_EXAM',
        'VIEW_EXAM',
        'CREATE_USER',
        'EDIT_USER',
        'DELETE_USER',
        'VIEW_USER',
        'VIEW_RESULTS',
        'EXPORT_DATA',
      ],
      allowedExamTypes: ['TSA', 'HSA'],
      registeredAt: Date.now(),
      createdAt: new Date().toISOString(),
      isGlobalAdmin: true,
      syncEnabled: true,
      devices: [],
    };

    await db.collection('users').doc(userRecord.uid).set(adminProfile, { merge: true });
    console.log('✅ Admin profile tạo thành công');

    // 6. Set custom claims
    console.log('📝 Bước 6: Thiết lập custom claims...');

    await auth.setCustomUserClaims(userRecord.uid, {
      admin: true,
      globalAdmin: true,
    });
    console.log('✅ Custom claims đặt thành công');

    // 7. Tạo system settings
    console.log('📝 Bước 7: Tạo system settings...');

    await db.collection('system').doc('adminSettings').set({
      globalAdminEmail: ADMIN_EMAIL,
      globalAdminUID: userRecord.uid,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: '1.0',
      description: 'Global admin account cho toàn hệ thống',
    }, { merge: true });
    console.log('✅ System settings tạo thành công');

    // Success!
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║         🎉 ADMIN ACCOUNT TOÀN HỆ THỐNG ĐÃ TẠO!             ║
╚══════════════════════════════════════════════════════════════╝

📋 THÔNG TIN ĐĂNG NHẬP:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Tài Khoản Admin
📧 Email:        admin@hethongluyenthi.vn
🔐 Mật khẩu:     Admin@Hethong123
🆔 UID:          ${userRecord.uid}
✨ Vai trò:       Quản Trị Viên Toàn Hệ Thống

🌐 PHẠM VI:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Hoạt động trên TẤT CẢ máy tính
✅ Hoạt động trên mobile & tablet
✅ Dữ liệu tự động đồng bộ
✅ Bảo mật cao (Firebase)

✅ QUYỀN HẠN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Tạo/sửa/xóa đề thi
✓ Quản lý tất cả user
✓ Xem kết quả tất cả
✓ Export dữ liệu hệ thống
✓ Cấu hình hệ thống

🚀 TIẾP THEO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. npm run dev        (khởi động ứng dụng)
2. Nhập email & mật khẩu trên
3. Đăng nhập thành công ✅
4. Thử đăng nhập từ máy khác (dùng cùng email/mật khẩu)
5. Tất cả máy đều hoạt động ✅

⚠️  QUAN TRỌNG:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  LƯU EMAIL VÀ MẬT KHẨU Ở NƠI AN TOÀN
⚠️  KHÔNG CHIA SẺ VỚI NGƯỜI KHÔNG ĐƯỢC PHÉP
⚠️  ĐỔI MẬT KHẨU SAU LẦN ĐĂNG NHẬP ĐẦU TIÊN

╚══════════════════════════════════════════════════════════════╝
`);

    return {
      success: true,
      email: ADMIN_EMAIL,
      uid: userRecord.uid,
    };

  } catch (error) {
    console.error(`
❌ LỖI TẠO ADMIN ACCOUNT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Lỗi: ${error.message}
Code: ${error.code || 'N/A'}
`);

    // Giúp khắc phục lỗi
    if (error.message.includes('servieAccountKey.json')) {
      console.log(`
📋 CÁCH KHẮC PHỤC:

1. Tìm file credentials Firebase của bạn
   - Vào Firebase Console: https://console.firebase.google.com
   - Project Settings → Service Accounts
   - Click "Generate new private key"
   - Tải file JSON về

2. Đặt file vào thư mục gốc dự án với tên:
   - servieAccountKey.json
   (hoặc serviceAccountKey.json / firebase-key.json)

3. Chạy lại script:
   node create-admin-auto.js
`);
    } else if (error.code === 'auth/email-already-exists') {
      console.log(`
⚠️  EMAIL ĐÃ ĐƯỢC SỬ DỤNG

Cách khắc phục:
1. Vào Firebase Console
2. Authentication > Users
3. Tìm admin@hethongluyenthi.vn
4. Xóa user cũ
5. Chạy lại script

Hoặc sử dụng email khác.
`);
    }

    return { success: false, error: error.message };
  }
}

// Chạy script
createGlobalAdmin().then((result) => {
  if (result.success) {
    console.log('✅ Admin account sẵn sàng sử dụng!');
    process.exit(0);
  } else {
    console.log('❌ Có lỗi xảy ra');
    process.exit(1);
  }
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
