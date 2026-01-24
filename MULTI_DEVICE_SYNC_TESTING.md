# Multi-Device Sync - Quick Start Guide

## How to Test Multi-Device Synchronization

### Prerequisites
- ✅ Project builds successfully
- ✅ Firebase configured with Firestore
- ✅ User logged in with Firebase Authentication

### Test Scenario 1: Real-Time Exam Sync

**Setup:**
1. Open the app in **Browser A** (Desktop)
2. Open the app in **Browser B** (Tablet or Incognito)
3. Log in to **both** with the same Firebase account

**Test Steps:**
1. In **Browser A**: Create a new exam (or edit existing one)
2. In **Browser A**: Click "Save" to upload to Firestore
3. Watch **Browser B**: The exam should appear automatically within 1-3 seconds
4. Verify the exam title, questions, and details match exactly

**Expected Result:**
- ✅ Exam appears on Browser B in real-time
- ✅ No need to refresh or manually sync
- ✅ Timestamps match

---

### Test Scenario 2: Real-Time Attempt Sync

**Setup:**
- Both browsers logged in to same account

**Test Steps:**
1. In **Browser A**: Take an exam and submit your answers
2. In **Browser A**: View the attempt in your results
3. Watch **Browser B**: The new attempt should appear in your attempts history
4. Check the score and answers match exactly

**Expected Result:**
- ✅ Attempt appears on Browser B automatically
- ✅ Score is correctly synced
- ✅ Answers are saved

---

### Test Scenario 3: Check Active Devices

**Setup:**
- Open developer console in both browsers

**Test Steps:**
1. In **Browser A**, check console logs:
   ```
   ✅ Device registered: device_XXXXXX_abc123
   ✅ Multi-device sync enabled with 2 active devices
   ```

2. Verify in code that `getActiveDevices()` returns both devices:
   ```typescript
   const devices = await getActiveDevices();
   console.log(devices); // Should show 2 devices
   ```

**Expected Result:**
- ✅ Both devices registered
- ✅ Device list shows 2 entries
- ✅ One marked as "current" device

---

### Test Scenario 4: Offline Behavior

**Setup:**
- Both browsers logged in
- Browser A has network connection

**Test Steps:**
1. In **Browser A**: Go offline (DevTools → Network → Offline)
2. In **Browser A**: Create/edit an exam
3. In **Browser A**: Click "Save" - should work (saved to IndexedDB)
4. Verify the data is still visible locally
5. Go back online - should auto-sync to Browser B

**Expected Result:**
- ✅ App still works offline
- ✅ Data saved to local IndexedDB
- ✅ Auto-syncs when online
- ✅ Browser B receives update after online

---

### Test Scenario 5: Multiple Users Don't Interfere

**Setup:**
- Browser A: User1 logged in
- Browser B: User2 logged in

**Test Steps:**
1. In **Browser A** (User1): Create exam "User1 Test"
2. In **Browser B** (User2): Create exam "User2 Test"
3. In **Browser A**: Should only see "User1 Test"
4. In **Browser B**: Should only see "User2 Test"

**Expected Result:**
- ✅ Users see only their own data
- ✅ No cross-user data leakage
- ✅ Each user's devices sync independently

---

### Test Scenario 6: Console Logs Verification

**Setup:**
- Open Developer Console (F12 → Console)

**During Login:**
```
✅ Firebase user logged in: user@example.com
📦 Local data loaded: { exams: 3, attempts: 5 }
✅ Bidirectional sync completed
✅ Device registered: device_1234567890_abc
✅ Multi-device sync enabled with 2 active devices
```

**When Exam Updates on Another Device:**
```
📱 Exam synced from another device: Physics Final Exam
```

**When Attempt Updates:**
```
📱 Attempt synced from another device: Biology Test
```

**On Logout:**
```
🛑 All sync listeners disabled
```

---

## Monitoring Tools

### Check Sync Status
Open browser console and run:
```javascript
// In Developer Console:

// 1. Get active devices
getActiveDevices().then(devices => {
  console.table(devices);
});

// 2. Get sync statistics
getSyncStats().then(stats => {
  console.log('📊 Sync Stats:', stats);
});

// 3. Check device ID
console.log('📱 Current Device:', localStorage.getItem('device_id'));
```

### Firebase Console Verification

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project → Firestore Database
3. Look for your user document: `users/{userId}/`
4. Should see:
   - `devices/` collection with device documents
   - `exams/` collection with exam data
   - `examAttempts/` collection with attempt data

---

## Troubleshooting

### Sync Not Working

**Check 1: Is user authenticated?**
```javascript
console.log(firebase.auth().currentUser);
// Should show user object, not null
```

**Check 2: Are listeners active?**
```javascript
console.log('📱 Active subscriptions:', syncSubscriptions.length);
// Should be > 0
```

**Check 3: Check Firestore rules**
- Go to Firebase Console → Firestore → Rules
- Verify user can read/write their own documents
- Rules should allow: `match /users/{userId}/** { allow read, write: if request.auth.uid == userId }`

### Data Not Syncing

**Solution 1: Force sync manually**
```javascript
forceSyncAllDevices(exams, attempts).then(({ exams, attempts }) => {
  console.log('✅ Manual sync completed');
});
```

**Solution 2: Check internet connection**
```javascript
console.log('Online:', navigator.onLine);
```

**Solution 3: Refresh page**
- Sometimes Firestore listeners need to be reestablished

### Different Data on Devices

**Solution: Resolve conflicts**
- Last-write-wins: Latest timestamp wins
- To see which device changed it:
  - Check `lastModified` timestamp
  - Device with latest timestamp made the change

---

## Performance Testing

### Measure Sync Speed
```javascript
// In Console:
const startTime = Date.now();

// Change data on another device...
// Wait for update to appear...

const syncTime = Date.now() - startTime;
console.log(`⏱️ Sync took: ${syncTime}ms`);
// Expected: 1000-3000ms
```

### Monitor Network Usage
1. Open DevTools → Network tab
2. Filter: `XHR/Fetch`
3. Look for Firestore API calls
4. Check request/response sizes

---

## Success Checklist

- [ ] Both browsers show same exam list
- [ ] Creating exam on Device A appears on Device B
- [ ] Taking exam on Device A syncs attempt to Device B
- [ ] Both devices appear in active devices list
- [ ] Console shows sync logs
- [ ] Offline mode doesn't break app
- [ ] Data syncs when coming back online
- [ ] Firestore shows device and data documents
- [ ] Multiple users don't see each other's data
- [ ] Force sync works when needed

---

## Common Issues & Fixes

| Issue | Check | Fix |
|-------|-------|-----|
| Sync shows 1 device only | Other browser not logged in | Log in on both browsers |
| Data not appearing | Check Firestore rules | Verify security rules allow user access |
| Slow sync (>10 seconds) | Check network speed | Normal is 1-3 seconds, may be network |
| Different data on devices | Last-write-wins conflict | Latest timestamp's version is kept |
| Errors in console | Read error messages | Usually Firebase auth or connection issue |
| Offline doesn't work | Check IndexedDB | Browser may not support IndexedDB |

---

## Next Steps

After successful testing:

1. **Deploy to production**
   - Run `npm run build`
   - Deploy to Vercel or Firebase Hosting

2. **Monitor in production**
   - Check Firebase analytics
   - Monitor Firestore read/write quota
   - Review error logs in Firebase Console

3. **Gather user feedback**
   - Is sync fast enough?
   - Do users need device management UI?
   - Any sync issues reported?

4. **Future enhancements**
   - Add device naming
   - Add sync history
   - Add selective sync per exam
   - Add bandwidth optimization

---

## Support

If you encounter issues:

1. Check console logs for error messages
2. Verify Firebase configuration in `firebaseConfig.ts`
3. Check Firestore security rules in Firebase Console
4. Verify user is authenticated
5. Check network connectivity
6. Try refreshing the page

See [MULTI_DEVICE_SYNC.md](./MULTI_DEVICE_SYNC.md) for detailed API documentation.
