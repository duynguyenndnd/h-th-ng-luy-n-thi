#!/usr/bin/env node

/**
 * Setup Real Admin Account
 * This script creates a real admin account and removes the demo account
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

async function setupAdmin() {
  console.log('\n🔧 TSA System - Real Admin Account Setup\n');
  
  try {
    // Get admin email
    const adminEmail = await question('📧 Nhập email admin thật (VD: admin@example.com): ');
    if (!adminEmail || !adminEmail.includes('@')) {
      console.error('❌ Email không hợp lệ');
      process.exit(1);
    }

    // Get admin password
    const adminPassword = await question('🔑 Nhập mật khẩu admin (tối thiểu 8 ký tự): ');
    if (!adminPassword || adminPassword.length < 8) {
      console.error('❌ Mật khẩu phải có tối thiểu 8 ký tự');
      process.exit(1);
    }

    // Get admin full name
    const adminFullName = await question('👤 Nhập tên đầy đủ của admin: ');
    if (!adminFullName) {
      console.error('❌ Tên không hợp lệ');
      process.exit(1);
    }

    console.log('\n⏳ Đang xử lý...\n');

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

    console.log('\n' + '='.repeat(50));
    console.log('✅ SETUP HOÀN TẤT!');
    console.log('='.repeat(50));
    console.log('\n📝 Thông tin tài khoản admin mới:');
    console.log(`   📧 Email: ${adminEmail}`);
    console.log(`   👤 Tên: ${adminFullName}`);
    console.log(`   🔑 Mật khẩu: ${adminPassword}`);
    console.log(`   🆔 UID: ${newAdminUser.uid}`);
    console.log('\n💡 Lưu ý:');
    console.log('   - Tài khoản admin demo đã bị xóa');
    console.log('   - Hãy cập nhật Login.tsx để xóa hướng dẫn đăng nhập demo');
    console.log('   - Đăng nhập bằng email và mật khẩu mới để kiểm tra\n');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    process.exit(0);
  }
}

setupAdmin();
