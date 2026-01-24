/**
 * 🔐 Firebase Admin Account Creator
 * 
 * Copies the code below to your browser console and run it to create an admin account
 * that works across ALL DEVICES via Firebase Authentication
 * 
 * This is the RECOMMENDED solution for multi-device admin access
 */

const createFirebaseAdmin = async () => {
  console.log('🔄 Creating Firebase admin account...');

  // Dynamically import Firebase modules
  const firebaseAuthModule = await import('https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js');
  const firebaseFirestoreModule = await import('https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js');
  
  // Get Firebase instances from your config
  const firebaseConfig = await import('./services/firebaseConfig.ts');
  
  const { createUserWithEmailAndPassword } = firebaseAuthModule;
  const { setDoc, doc } = firebaseFirestoreModule;
  const { auth, db } = firebaseConfig;

  // Admin credentials
  const adminEmail = 'admin@example.com'; // Change this if needed
  const adminPassword = 'Admin@123456';   // Change this! Use strong password

  try {
    console.log('📝 Creating Firebase Authentication user...');
    
    // Step 1: Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    const firebaseUser = userCredential.user;
    
    console.log('✅ Firebase user created:', firebaseUser.uid);
    console.log('📧 Email:', adminEmail);

    // Step 2: Create admin profile in Firestore
    console.log('📝 Creating admin profile in Firestore...');
    
    await setDoc(doc(db, 'users', firebaseUser.uid), {
      uid: firebaseUser.uid,
      email: adminEmail,
      role: 'admin',
      fullName: 'Quản trị viên',
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
      syncEnabled: true,
      devices: []
    });

    console.log('✅ Admin profile created in Firestore');

    // Success message
    console.log('\n' + '='.repeat(50));
    console.log('🎉 FIREBASE ADMIN ACCOUNT CREATED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log('\n📋 Login Credentials:');
    console.log('   📧 Email:    ' + adminEmail);
    console.log('   🔐 Password: ' + adminPassword);
    console.log('\n💡 This account works on ALL DEVICES automatically');
    console.log('\n🚀 Next steps:');
    console.log('   1. Refresh this page (F5)');
    console.log('   2. Login with the email/password above');
    console.log('   3. Test on other devices with same credentials');
    console.log('\n⚠️  IMPORTANT:');
    console.log('   - Save these credentials somewhere safe');
    console.log('   - Change the password after first login');
    console.log('   - Never share the password');
    console.log('\n' + '='.repeat(50));

    return true;
  } catch (error: any) {
    console.error('❌ Error creating Firebase admin:', error.message);
    
    // Common errors
    if (error.code === 'auth/email-already-in-use') {
      console.log('\n⚠️  This email already has an account');
      console.log('   Try a different email or use: ' + adminEmail.replace('admin', 'admin2'));
    } else if (error.code === 'auth/weak-password') {
      console.log('\n⚠️  Password too weak. Use: Admin@123456');
    } else if (error.code === 'auth/invalid-email') {
      console.log('\n⚠️  Invalid email. Use format: admin@example.com');
    }
    
    console.error('Error code:', error.code);
    return false;
  }
};

// Run the function
createFirebaseAdmin().catch(err => console.error('Unexpected error:', err));

console.log('\n⏳ Creating admin account...');
console.log('💬 Check back in a moment for results\n');
