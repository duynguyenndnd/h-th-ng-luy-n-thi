#!/usr/bin/env node

/**
 * 🔐 Global Admin Account Setup Script
 * 
 * This script creates a SINGLE admin account that works on ALL devices
 * Run this script once, then the admin can login from anywhere
 * 
 * Usage:
 *   node setup-global-admin.js
 * 
 * Or copy the Firebase code below to browser console
 */

console.log(`
╔═══════════════════════════════════════════════════════════╗
║     🔐 GLOBAL ADMIN ACCOUNT SETUP FOR ALL DEVICES        ║
╚═══════════════════════════════════════════════════════════╝
`);

// ============================================
// BROWSER CONSOLE METHOD (Recommended)
// ============================================

const firebaseSetupCode = `
/**
 * Copy this entire code block and paste into browser console (F12)
 * It will create a global admin account in Firebase that works on ALL devices
 */

const setupGlobalAdmin = async () => {
  console.log('🔄 Setting up global admin account...');
  console.log('This may take a few seconds...');

  try {
    // Import Firebase modules dynamically
    const auth = (await import('./services/firebaseConfig.ts')).auth;
    const db = (await import('./services/firebaseConfig.ts')).db;
    
    const { createUserWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js');
    const { setDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js');

    // Admin credentials (change password if needed)
    const ADMIN_EMAIL = 'admin@hethongluyenthi.vn';
    const ADMIN_PASSWORD = 'Admin@Hethong123';

    console.log('\\n📝 Creating Firebase user...');

    // Step 1: Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    const adminUser = userCredential.user;

    console.log('✅ Firebase user created with UID:', adminUser.uid);

    // Step 2: Create admin profile in Firestore
    console.log('📝 Creating admin profile in Firestore...');

    const adminProfile = {
      uid: adminUser.uid,
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
        'EXPORT_DATA'
      ],
      allowedExamTypes: ['TSA', 'HSA'],
      registeredAt: Date.now(),
      createdAt: new Date().toISOString(),
      isGlobalAdmin: true,
      syncEnabled: true,
      devices: []
    };

    await setDoc(doc(db, 'users', adminUser.uid), adminProfile);

    console.log('✅ Admin profile created in Firestore');

    // Step 3: Create admin settings document
    console.log('📝 Creating system admin settings...');

    await setDoc(doc(db, 'system', 'adminSettings'), {
      globalAdminEmail: ADMIN_EMAIL,
      globalAdminUID: adminUser.uid,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      description: 'Global admin account for the entire system'
    });

    console.log('✅ System settings configured');

    // Success!
    console.log(\`
╔══════════════════════════════════════════════════════════════╗
║         🎉 GLOBAL ADMIN ACCOUNT CREATED SUCCESSFULLY!       ║
╚══════════════════════════════════════════════════════════════╝

📋 ADMIN ACCOUNT DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📧 Email:      admin@hethongluyenthi.vn
🔐 Password:   Admin@Hethong123
🆔 UID:        \${adminUser.uid}
👤 Full Name:  Quản Trị Viên Hệ Thống

✨ FEATURES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Works on ALL devices
✅ Works on mobile apps
✅ Real-time sync across devices
✅ Create/edit/delete exams
✅ Manage all users
✅ View all results
✅ Export system data

🚀 NEXT STEPS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Refresh this page (F5)
2. Login with the email and password above
3. Test login on another device with same credentials
4. Change password after first login (recommended)
5. Create other admin/teacher/student accounts

⚠️  IMPORTANT SECURITY NOTES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  SAVE THESE CREDENTIALS IN A SECURE LOCATION
⚠️  DO NOT SHARE WITH UNAUTHORIZED USERS
⚠️  CHANGE PASSWORD REGULARLY
⚠️  ENABLE 2FA IN FIREBASE CONSOLE (OPTIONAL)

╚══════════════════════════════════════════════════════════════╝
\`);

    return { success: true, uid: adminUser.uid };

  } catch (error) {
    console.error('\\n❌ ERROR CREATING ADMIN ACCOUNT');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);

    // Help with common errors
    if (error.code === 'auth/email-already-in-use') {
      console.log(\`
⚠️  EMAIL ALREADY IN USE

Solution:
1. Go to Firebase Console (https://console.firebase.google.com)
2. Go to Authentication > Users
3. Find and delete the existing admin account
4. Try this script again

Or use a different email address.
\`);
    } else if (error.code === 'auth/weak-password') {
      console.log(\`
⚠️  PASSWORD TOO WEAK

Requirements:
✓ At least 6 characters
✓ Mix of uppercase and lowercase
✓ Include numbers and special characters
✓ Example: Admin@Hethong123
\`);
    } else if (error.code === 'auth/invalid-email') {
      console.log(\`
⚠️  INVALID EMAIL FORMAT

Use format: admin@hethongluyenthi.vn
\`);
    }

    return { success: false, error: error.message };
  }
};

// Run it
setupGlobalAdmin();
`;

// ============================================
// Node.js CLI Method
// ============================================

const nodeSetupCode = \`
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

async function setupGlobalAdmin() {
  try {
    // Load service account key
    const serviceAccountPath = path.join(__dirname, 'servieAccountKey.json');
    
    if (!fs.existsSync(serviceAccountPath)) {
      console.error('❌ Error: servieAccountKey.json not found');
      console.error('Place your Firebase service account key in the project root');
      process.exit(1);
    }

    const serviceAccount = require(serviceAccountPath);

    // Initialize Firebase Admin SDK
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    const auth = admin.auth();
    const db = admin.firestore();

    // Admin credentials
    const ADMIN_EMAIL = 'admin@hethongluyenthi.vn';
    const ADMIN_PASSWORD = 'Admin@Hethong123';

    console.log('🔄 Creating global admin account...');

    // Create user
    const userRecord = await auth.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      displayName: 'Quản Trị Viên Hệ Thống',
      emailVerified: true
    });

    console.log('✅ Firebase user created:', userRecord.uid);

    // Create Firestore profile
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: ADMIN_EMAIL,
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

    console.log('✅ Admin profile created');

    // Set custom claims
    await auth.setCustomUserClaims(userRecord.uid, {
      admin: true,
      globalAdmin: true
    });

    console.log('✅ Custom claims set');

    console.log(\`
✅ SUCCESS! Global admin created:
   Email: \${ADMIN_EMAIL}
   Password: \${ADMIN_PASSWORD}
   UID: \${userRecord.uid}
\`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupGlobalAdmin();
\`;

console.log('═'.repeat(60));
console.log('METHOD 1: BROWSER CONSOLE (FASTEST) ⚡');
console.log('═'.repeat(60));
console.log(`
1. Start your app: npm run dev
2. Open DevTools: F12
3. Go to Console tab
4. Copy and paste the code below:
5. Press Enter and wait for success message
6. Refresh page (F5)
7. Login with credentials shown in console

`);

console.log(firebaseSetupCode);

console.log('\n\n');
console.log('═'.repeat(60));
console.log('METHOD 2: NODE.JS CLI (ADVANCED)');
console.log('═'.repeat(60));
console.log(`
Requirements:
- Firebase Admin SDK: npm install firebase-admin
- Service account key in project root (servieAccountKey.json)

Usage:
${nodeSetupCode}
`);

console.log('\n\n');
console.log('═'.repeat(60));
console.log('QUICK START');
console.log('═'.repeat(60));
console.log(`
👉 RECOMMENDED: Use Browser Console Method

Steps:
  1. npm run dev
  2. Press F12 → Console
  3. Copy the code from above
  4. Paste into console and press Enter
  5. Wait for "✅ ADMIN ACCOUNT CREATED" message
  6. Refresh page (F5)
  7. Login anywhere with:
     Email: admin@hethongluyenthi.vn
     Password: Admin@Hethong123

After setup, you can login on any device!
`);
