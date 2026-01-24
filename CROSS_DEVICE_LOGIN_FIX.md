# 🔐 Cross-Device Admin Login - Solutions

## 🚨 The Problem

You created an admin account locally in **IndexedDB** on one device. When you try to login on another device, you get errors because:

1. **IndexedDB is device/browser-specific** - It's local storage on ONE computer only
2. **Each device has its own separate database** - Not synced between devices
3. **Your admin account only exists on the first device** - Other devices don't have it

---

## ✅ Solutions (Choose One)

### **Solution 1: Use Firebase Authentication (RECOMMENDED) ⭐**

Firebase Auth syncs across **ALL devices automatically**. Your admin account will work everywhere.

#### Step 1: Create Firebase Admin Account

**On any device in browser console (F12):**

```javascript
const createFirebaseAdmin = async () => {
  const { createUserWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js');
  const { auth } = await import('./services/firebaseConfig.ts');
  const { setDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js');
  const { db } = await import('./services/firebaseConfig.ts');

  const email = 'admin@example.com';
  const password = 'admin@123456'; // Strong password!

  try {
    // Create Firebase user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Create Firestore admin profile
    await setDoc(doc(db, 'users', firebaseUser.uid), {
      uid: firebaseUser.uid,
      email: email,
      role: 'admin',
      fullName: 'Quản trị viên',
      department: 'Administration',
      permissions: [
        'CREATE_EXAM', 'EDIT_EXAM', 'DELETE_EXAM', 'VIEW_EXAM',
        'CREATE_USER', 'EDIT_USER', 'DELETE_USER', 'VIEW_USER',
        'VIEW_RESULTS', 'EXPORT_DATA'
      ],
      allowedExamTypes: ['TSA', 'HSA'],
      registeredAt: Date.now()
    });

    console.log('✅ Firebase Admin Created!');
    console.log('📧 Email:', email);
    console.log('🔐 Password:', password);
    console.log('📝 Note this down for login');
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️ Admin account already exists with this email');
    }
    return false;
  }
};

// Run it
createFirebaseAdmin();
```

**Or use Firebase Console directly:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project → Authentication
3. Click **Add User** (Create user manually)
4. Enter: `admin@example.com` / `admin@123456`
5. Click Create
6. Go to Firestore Database → Create user document under collection `users`

#### Step 2: Update App.tsx to Support Firebase Auth

Your app already supports Firebase auth! Just login with:
- **Email:** `admin@example.com`
- **Password:** `admin@123456`

**✅ Benefits:**
- Works on ALL devices automatically
- Synced in real-time
- More secure than local storage
- Professional solution

---

### **Solution 2: Create Admin on Each Device (Quick but Manual) 🔄**

If you want to keep using local IndexedDB, create the admin account on **each device separately**.

#### On Each Device:

1. **Start app:** `npm run dev`
2. **Open DevTools:** F12 → Console
3. **Run this on each device:**

```javascript
const createAdminAccount = async () => {
  const { openDB } = window.idb || await import('https://cdn.jsdelivr.net/npm/idb@7/+esm');
  
  const db = await openDB('tsa-exam-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', { keyPath: 'username' });
      }
    },
  });

  const adminUser = {
    username: 'admin',
    password: 'admin123',
    fullName: 'Quản trị viên',
    role: 'admin',
    department: 'Administration',
    permissions: ['CREATE_EXAM', 'EDIT_EXAM', 'DELETE_EXAM', 'VIEW_EXAM', 'CREATE_USER', 'EDIT_USER', 'DELETE_USER', 'VIEW_USER', 'VIEW_RESULTS', 'EXPORT_DATA'],
    allowedExamTypes: ['TSA', 'HSA'],
    registeredAt: Date.now(),
    id: 'admin-' + Date.now()
  };

  try {
    const existing = await db.get('users', 'admin');
    if (existing) {
      console.log('✅ Admin already exists on this device');
      return true;
    }
    await db.put('users', adminUser);
    console.log('✅ Admin created on THIS device');
    console.log('Username: admin');
    console.log('Password: admin123');
    return true;
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
};

createAdminAccount();
```

Then refresh and login with `admin` / `admin123`

**⚠️ Limitations:**
- Must create account on each device
- Data doesn't sync between devices
- Not practical for multiple devices

---

### **Solution 3: Export Admin Account (Workaround) 📤**

1. **On Device A** (where admin exists):
   - Open Console (F12)
   - Run:
   ```javascript
   const db = await (await import('./services/dbService.ts')).getDB();
   const admin = await db.get('users', 'admin');
   console.log(JSON.stringify(admin, null, 2));
   // Copy the output
   ```

2. **On Device B**:
   - Open Console (F12)
   - Run:
   ```javascript
   const db = await (await import('./services/dbService.ts')).getDB();
   const adminData = {
     // Paste the data from Device A here
   };
   await db.put('users', adminData);
   console.log('✅ Admin account imported');
   ```

---

## 🎯 Recommended Approach

### **For Development (Single Device):**
Use **Solution 2** - Quick setup with local accounts

### **For Production / Multiple Devices:**
Use **Solution 1** - Firebase Auth (Recommended)

### **Current Issue:** 
You're mixing both! That's why you get errors.

---

## 🔧 Troubleshooting

### "Login works on Device A but not Device B"

**Cause:** Device B doesn't have the admin account (IndexedDB is local only)

**Fix Options:**
1. Use Firebase Auth (Solution 1) ← **BEST**
2. Create admin on Device B (Solution 2)
3. Sync accounts via export (Solution 3)

### "Firebase login not working"

Check:
1. Is Firebase initialized? Check console for `🔧 Firebase Config Loaded`
2. Is the email/password correct?
3. Check Firestore rules allow user access
4. Try in incognito window

### "Still getting errors after setup"

1. **Clear browser data:**
   - DevTools → Application → Clear site data
   - Or: Settings → Privacy → Clear cookies

2. **Restart dev server:**
   ```bash
   # Stop: Ctrl+C
   npm run dev
   ```

3. **Check browser console (F12)** for error messages

---

## 📋 Quick Decision Matrix

| Situation | Solution | Time | Notes |
|-----------|----------|------|-------|
| Single device only | #2 (Local) | 2 min | Simplest |
| 2+ devices, testing | #1 (Firebase) | 5 min | Syncs everywhere |
| Production/users | #1 (Firebase) | 5 min | Professional |
| Emergency access | #3 (Export) | 3 min | Manual but works |

---

## ✨ Step-by-Step: Firebase Admin Setup (Fastest)

### **Complete Setup in 5 Minutes:**

#### Step 1: Create Firebase User
```javascript
// In browser console (F12):
const { createUserWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js');
const { auth } = await import('./services/firebaseConfig.ts');

await createUserWithEmailAndPassword(auth, 'admin@example.com', 'admin@123456');
console.log('✅ Firebase user created');
```

#### Step 2: Create Firestore Admin Profile
```javascript
// In browser console (F12):
const { setDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js');
const { db } = await import('./services/firebaseConfig.ts');
const { auth } = await import('./services/firebaseConfig.ts');

const uid = auth.currentUser.uid;
await setDoc(doc(db, 'users', uid), {
  uid: uid,
  email: 'admin@example.com',
  role: 'admin',
  fullName: 'Quản trị viên',
  permissions: ['CREATE_EXAM', 'EDIT_EXAM', 'DELETE_EXAM', 'VIEW_EXAM', 'CREATE_USER', 'EDIT_USER', 'DELETE_USER', 'VIEW_USER', 'VIEW_RESULTS', 'EXPORT_DATA'],
  registeredAt: Date.now()
});
console.log('✅ Admin profile created in Firestore');
```

#### Step 3: Logout and Test
```javascript
const { signOut } = await import('https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js');
const { auth } = await import('./services/firebaseConfig.ts');

await signOut(auth);
console.log('✅ Logged out');
```

#### Step 4: Login on Any Device
- Refresh page
- Use email/password login option (if available)
- Or modify login form to support email

#### Step 5: Verify on Other Device
- Open app on Device B
- Should be able to login with same credentials

---

## 🚀 Next Steps

1. **Choose your solution** based on your needs
2. **Follow the steps** for your chosen solution
3. **Test on multiple devices** to verify it works
4. **Change default passwords** for security

---

## 📞 Still Having Issues?

1. **Check browser console** (F12) for specific error messages
2. **Verify Firebase is initialized** - Look for `🔧 Firebase Config Loaded`
3. **Check Firestore rules** - Go to Firebase Console → Firestore → Rules
4. **Try incognito window** - Rules out cache issues
5. **Restart dev server** - Sometimes helps

For more help, see [ADMIN_ACCOUNT_SETUP.md](./ADMIN_ACCOUNT_SETUP.md)
