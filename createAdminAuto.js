#!/usr/bin/env node

/**
 * Setup Real Admin Account - Automated
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Admin credentials from command line or hardcoded
const adminEmail = 'admin@admin.com';
const adminPassword = '12345678';
const adminFullName = 'nguyễn gia bảo';

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, 'servieAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: servieAccountKey.json not found');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://hethongluyenthi-e1386.firebaseio.com"
});

const db = admin.firestore();
const auth = admin.auth();

async function setupAdmin() {
  console.log('\n🔧 TSA System - Real Admin Account Setup\n');
  
  try {
    // Step 1: Remove demo admin account
    console.log('1️⃣  Đang xóa tài khoản admin demo...');
    const demoEmail = 'admin@hethongluyenthi.vn';
    try {
      const demoUser = await auth.getUserByEmail(demoEmail);
      await auth.deleteUser(demoUser.uid);
      console.log('   ✅ Đã xóa tài khoản demo');
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        console.log('   ✅ Tài khoản demo không tồn tại (bỏ qua)');
      } else {
        console.warn('   ⚠️  Không thể xóa tài khoản demo:', e.message);
      }
    }

    // Step 2: Create new real admin account
    console.log('2️⃣  Đang tạo tài khoản admin mới...');
    let newAdminUser;
    try {
      // Check if email already exists
      try {
        await auth.getUserByEmail(adminEmail);
        console.error('❌ Email này đã được sử dụng');
        process.exit(1);
      } catch (e) {
        if (e.code !== 'auth/user-not-found') throw e;
      }

      newAdminUser = await auth.createUser({
        email: adminEmail,
        password: adminPassword,
        displayName: adminFullName,
        emailVerified: true
      });
      console.log('   ✅ Tài khoản tạo thành công:', newAdminUser.uid);
    } catch (e) {
      console.error('❌ Lỗi tạo tài khoản:', e.message);
      process.exit(1);
    }

    // Step 3: Set admin role in Firestore
    console.log('3️⃣  Đang cấp quyền admin...');
    await db.collection('users').doc(newAdminUser.uid).set({
      email: adminEmail,
      fullName: adminFullName,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('   ✅ Quyền admin được cấp thành công');

    // Step 4: Set custom claims
    console.log('4️⃣  Đang thiết lập quyền hạn tùy chỉnh...');
    await auth.setCustomUserClaims(newAdminUser.uid, { role: 'admin' });
    console.log('   ✅ Quyền hạn tùy chỉnh được thiết lập');

    console.log('\n' + '='.repeat(60));
    console.log('✅ SETUP HOÀN TẤT!');
    console.log('='.repeat(60));
    console.log('\n📝 Thông tin tài khoản admin mới:');
    console.log(`   📧 Email: ${adminEmail}`);
    console.log(`   👤 Tên: ${adminFullName}`);
    console.log(`   🔑 Mật khẩu: ${adminPassword}`);
    console.log(`   🆔 UID: ${newAdminUser.uid}`);
    console.log('\n💡 Lưu ý:');
    console.log('   - Tài khoản admin demo đã bị xóa');
    console.log('   - Hướng dẫn đăng nhập demo đã bị xóa khỏi giao diện');
    console.log('   - Đăng nhập bằng email và mật khẩu mới để kiểm tra\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
}

setupAdmin();
