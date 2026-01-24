# Cloud Sync & Firebase Authentication Guide

## Overview
The exam system now supports cross-device data synchronization via Firebase Firestore and email/password authentication.

## Live URLs
- **Firebase Hosting**: https://hethongluyenthi-e1386.web.app
- **Vercel**: https://tsa-master-pro.vercel.app

## How It Works

### 1. **Firebase Authentication** (Login/Register)
When you load the app:
- If not logged in, you see the Firebase Login component
- You can **register** a new account with email/password (password min 6 characters)
- Or **login** with existing Firebase credentials
- Demo account: `demo@test.com` / `demo123`

### 2. **Automatic Cloud Sync**
When you successfully log in:
- Firebase auth listener in `App.tsx` detects the login
- `syncFromCloud()` automatically runs to download your data
- Cloud data (exams & attempts) merges with local data
- Duplicates are prevented by checking document IDs
- Your dashboard loads with all synced data

### 3. **Real-time Synchronization**
When you:
- **Create a new exam**: Saves to IndexedDB (local) + uploads to Firestore
- **Take an exam**: Saves attempt to IndexedDB + uploads to Firestore
- **Login on another device**: Automatically downloads all your exams & attempts

### 4. **Firestore Data Structure**
```
firestore (Database)
└── users/{uid}/ (Collection per user)
    ├── exams/{examId}
    │   ├── id: string
    │   ├── title: string
    │   ├── type: "TSA" | "HSA"
    │   ├── questions: Question[]
    │   ├── syncedAt: Timestamp
    │   └── userId: string
    └── examAttempts/{attemptId}
        ├── id: string
        ├── examId: string
        ├── answers: object
        ├── score: number
        ├── totalScore: number
        ├── syncedAt: Timestamp
        └── userId: string
```

## Testing Cross-Device Sync

### Test Scenario 1: Single Device Register & Login
1. Go to https://hethongluyenthi-e1386.web.app
2. Click "Đăng ký" to register new account (e.g., `test@example.com` / `password123`)
3. App redirects to Dashboard with "🔄 Đang đồng bộ dữ liệu..." message
4. Create a new exam (e.g., "TSA Practice Test")
5. Verify exam appears in dashboard
6. Logout (button with user email in header)

### Test Scenario 2: Login on Another Device/Browser
1. Open a private/incognito window
2. Go to https://hethongluyenthi-e1386.web.app
3. Login with same email/password from Test Scenario 1
4. Dashboard shows "🔄 Đang đồng bộ dữ liệu..." 
5. **After sync completes**: Verify the exam you created on Device 1 is visible here
6. All exam attempts should also be synced

### Test Scenario 3: Demo Account
1. App displays demo account info in login form: `demo@test.com` / `demo123`
2. Click login to test with pre-populated demo data
3. Test exam taking and submission
4. Verify attempts are saved to Firestore

### Test Scenario 4: Offline Data
1. Create local exam while logged out
2. Logout, then login to Firebase account
3. Verify local exam merges with cloud exams (no duplicates)
4. Can now sync this exam across devices

## Technical Implementation

### New Files Created
1. **services/firebaseConfig.ts** - Firebase SDK initialization
2. **services/authService.ts** - Firebase Authentication methods
3. **services/cloudSync.ts** - Firestore sync operations
4. **components/Login.tsx** - Firebase login/register UI

### Modified Files
- **App.tsx** - Added Firebase auth listener, cloud sync logic, Dashboard header with logout button

### Key Features
✅ Email/password authentication with Firebase Auth
✅ Automatic cloud sync on login
✅ Duplicate prevention (checks by document ID)
✅ Error handling for auth failures
✅ Loading state indicator during sync
✅ Display current Firebase user email in dashboard header
✅ Logout button with Firebase session clear

## Troubleshooting

### Issue: "Invalid API key" Error
- Ensure `VITE_GEMINI_API_KEY` is set in `.env` file
- Current key: `AIzaSyBFCSw9TjS_CgvUBBEhcXa4AXuPePE5aKw`

### Issue: "Permission denied" when saving to Firestore
- Check Firestore Security Rules (should allow authenticated users)
- Verify Firebase Auth is enabled in Google Cloud Console

### Issue: Exams not syncing to another device
- Ensure you're logged in with same email on both devices
- Check browser console for error messages
- Try refreshing the page after login

### Issue: "🔄 Đang đồng bộ dữ liệu..." shows indefinitely
- Check network connection
- Open browser console (F12) and check for errors
- Try logging out and in again

## Environment Variables
```
VITE_GEMINI_API_KEY=AIzaSyBFCSw9TjS_CgvUBBEhcXa4AXuPePE5aKw
VITE_FIREBASE_API_KEY=AIzaSyDy2H1H3WP_NqFKdaeFdV_6Uw2k_VL2XQA
VITE_FIREBASE_AUTH_DOMAIN=hethongluyenthi-e1386.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=hethongluyenthi-e1386
VITE_FIREBASE_STORAGE_BUCKET=hethongluyenthi-e1386.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=923486172929
VITE_FIREBASE_APP_ID=1:923486172929:web:a0d5e123456789abc
```

## Next Steps (Optional Enhancements)

1. **Offline Mode** - Queue uploads when offline, sync when online
2. **Conflict Resolution** - Handle same doc edited on multiple devices
3. **Data Export** - Allow users to backup/export their data
4. **Sharing** - Allow teachers to share exams with students
5. **Timestamps** - Show last sync time in UI

## Support
For issues or questions, check:
- Firebase Console: https://console.firebase.google.com/project/hethongluyenthi-e1386
- GitHub: https://github.com/duynguyenndnd/h-th-ng-luy-n-thi
