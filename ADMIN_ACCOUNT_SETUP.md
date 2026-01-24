# 👤 Admin Account Setup Guide

## How to Create Your Admin Account

You have **3 options** to create an admin account:

---

## **Option 1: Browser Console (Fastest) ⚡**

### Step-by-Step:

1. **Start the application**
   ```bash
   npm run dev
   ```
   - Opens at `http://localhost:5173`

2. **Open DevTools**
   - Press `F12` or `Ctrl + Shift + I`
   - Go to **Console** tab

3. **Copy and paste this code:**
   ```javascript
   const createAdminAccount = async () => {
     const { openDB } = window.idb || await import('https://cdn.jsdelivr.net/npm/idb@7/+esm');
     
     const db = await openDB('tsa-exam-db', 1, {
       upgrade(db) {
         if (!db.objectStoreNames.contains('users')) {
           const store = db.createObjectStore('users', { keyPath: 'username' });
           store.createIndex('role', 'role');
         }
       },
     });

     const adminUser = {
       username: 'admin',
       password: 'admin123',
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
       const existing = await db.get('users', 'admin');
       if (existing) {
         console.log('❌ Admin account already exists!');
         return false;
       }

       await db.put('users', adminUser);
       console.log('✅ Admin account created!');
       console.log('👤 Username: admin');
       console.log('🔐 Password: admin123');
       return true;
     } catch (error) {
       console.error('❌ Error:', error);
       return false;
     }
   };

   createAdminAccount();
   ```

4. **Press Enter**
   - You should see: `✅ Admin account created!`
   - Note the credentials

5. **Refresh the page** (`F5`)

6. **Login with:**
   - **Username:** `admin`
   - **Password:** `admin123`

---

## **Option 2: Using the Script File 📝**

1. The file `create-admin-account.js` has already been created in your project

2. **Run the script in browser console:**
   - Start `npm run dev`
   - Open DevTools (F12)
   - Open **Console** tab
   - Copy-paste the code from `create-admin-account.js`
   - Press Enter

3. **Done!** Account is created.

---

## **Option 3: Firebase Authentication (Advanced) 🔐**

If you want to use Firebase instead of local IndexedDB:

```javascript
// In browser console with Firebase configured:
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from './services/firebaseConfig';

const email = 'admin@example.com';
const password = 'admin123';

try {
  // Create Firebase user
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;

  // Create Firestore admin document
  await setDoc(doc(db, 'users', firebaseUser.uid), {
    email: email,
    role: 'admin',
    fullName: 'Quản trị viên',
    permissions: ['CREATE_EXAM', 'EDIT_EXAM', 'DELETE_EXAM', 'VIEW_EXAM', 
                  'CREATE_USER', 'EDIT_USER', 'DELETE_USER', 'VIEW_USER', 
                  'VIEW_RESULTS', 'EXPORT_DATA'],
    registeredAt: Date.now()
  });

  console.log('✅ Firebase admin account created!');
  console.log('📧 Email:', email);
  console.log('🔐 Password:', password);
} catch (error) {
  console.error('❌ Error:', error.message);
}
```

---

## **Next Steps After Account Creation**

### 1. **First Login:**
   - Username: `admin`
   - Password: `admin123`

### 2. **Change Password (Recommended):**
   - After login, go to user settings
   - Change default password to something secure
   - Follow format: At least 8 characters

### 3. **Create Other Users:**
   - As admin, go to **User Management**
   - Click **Create New User**
   - Select role: Teacher, Student, or Admin
   - Set permissions as needed

### 4. **Create Your First Exam:**
   - Go to **Dashboard**
   - Click **Create New Exam**
   - Add questions
   - Save to Firestore

---

## **Account Details**

### Default Admin Account:
```
Username:           admin
Password:           admin123
Role:               admin
Full Name:          Quản trị viên
Department:         Administration
Email:              (not required for local)
```

### Admin Permissions (All):
- ✅ CREATE_EXAM
- ✅ EDIT_EXAM
- ✅ DELETE_EXAM
- ✅ VIEW_EXAM
- ✅ CREATE_USER
- ✅ EDIT_USER
- ✅ DELETE_USER
- ✅ VIEW_USER
- ✅ VIEW_RESULTS
- ✅ EXPORT_DATA

### Allowed Exam Types:
- TSA (Thinking Skills Assessment)
- HSA (Higher-level thinking)

---

## **Troubleshooting**

### "Admin account already exists"
- Clear browser storage:
  1. Open DevTools (F12)
  2. Go to **Application** tab
  3. Find **IndexedDB** → `tsa-exam-db`
  4. Right-click → **Delete Database**
  5. Run the script again

### Login doesn't work after creation
1. **Refresh the page** (F5)
2. Make sure credentials are exactly: `admin` / `admin123`
3. Check browser console for errors
4. Try clearing browser cache

### Script won't run
- Make sure `npm run dev` is running
- Check that IndexedDB is enabled (usually is by default)
- Try using an incognito/private window
- Check browser console for errors

---

## **Security Notes**

⚠️ **Important:**
- This admin account is local (IndexedDB) by default
- Change the password after first login
- For production, use Firebase Authentication
- Keep admin credentials secure
- Don't share admin password with students

---

## **Additional Options**

### Create other users as admin:
After logging in as admin:
1. Go to **User Management** (if available)
2. Click **Create New User**
3. Choose role: Teacher or Student
4. Set specific permissions
5. Save the user

### Export/Import Users:
- As admin, use **Export Data** to backup user accounts
- Users can be restored from JSON file

---

## **Quick Commands**

### List all users in console:
```javascript
const db = await (await import('./services/dbService.ts')).getDB();
const users = await db.getAll('users');
console.table(users);
```

### Delete all users and reset:
```javascript
const db = await (await import('./services/dbService.ts')).getDB();
const users = await db.getAll('users');
users.forEach(u => db.delete('users', u.username));
console.log('✅ All users deleted');
```

### Update admin password:
```javascript
const db = await (await import('./services/dbService.ts')).getDB();
const admin = await db.get('users', 'admin');
admin.password = 'newPassword123';
await db.put('users', admin);
console.log('✅ Password updated');
```

---

## **Still Having Issues?**

1. Check browser console for error messages (F12)
2. Verify `npm run dev` is running
3. Try a different browser
4. Clear all browser cache and cookies
5. Restart the development server

For more help, see related documentation:
- [ACCOUNT_HIERARCHY.md](./ACCOUNT_HIERARCHY.md) - Role system
- [README.md](./README.md) - General setup
