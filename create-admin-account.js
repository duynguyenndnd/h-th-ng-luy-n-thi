// 👤 Admin Account Creator Script
// Run this in browser DevTools Console to create an admin account

const createAdminAccount = async () => {
  const { openDB } = window.idb || await import('https://cdn.jsdelivr.net/npm/idb@7/+esm');
  
  // Initialize IndexedDB
  const db = await openDB('tsa-exam-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('users')) {
        const store = db.createObjectStore('users', { keyPath: 'username' });
        store.createIndex('role', 'role');
      }
    },
  });

  // Create admin user
  const adminUser = {
    username: 'admin',
    password: 'admin123', // Change this password!
    fullName: 'Quản trị viên',
    role: 'admin',
    department: 'Administration',
    permissions: [
      'CREATE_EXAM', 'EDIT_EXAM', 'DELETE_EXAM', 'VIEW_EXAM',
      'CREATE_USER', 'EDIT_USER', 'DELETE_USER', 'VIEW_USER',
      'VIEW_RESULTS', 'EXPORT_DATA'
    ],
    allowedExamTypes: ['TSA', 'HSA'],
    registeredAt: Date.now(),
    id: 'admin-' + Date.now()
  };

  try {
    // Check if admin already exists
    const existing = await db.get('users', 'admin');
    if (existing) {
      console.log('❌ Admin account already exists!');
      console.log('Current admin user:', existing);
      return false;
    }

    // Create admin account
    await db.put('users', adminUser);
    console.log('✅ Admin account created successfully!');
    console.log('👤 Username: admin');
    console.log('🔐 Password: admin123');
    console.log('⚠️  Please change the password after first login!');
    console.log('\nFull account details:', adminUser);
    return true;
  } catch (error) {
    console.error('❌ Error creating admin account:', error);
    return false;
  }
};

// Run the function
createAdminAccount();
