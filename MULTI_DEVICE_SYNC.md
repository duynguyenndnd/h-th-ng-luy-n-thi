# Multi-Device Synchronization Guide

## Overview
The Multi-Device Sync feature enables seamless synchronization of exam data across multiple devices. When you log in on different devices, all changes are automatically synchronized in real-time using Firebase Firestore.

## How It Works

### 1. Device Registration
When a user logs in, the device is automatically registered with:
- **Device ID**: Unique identifier for the device (stored in localStorage)
- **Last Active**: Server timestamp of the last activity
- **User Agent**: Browser and OS information
- **Platform**: Device platform information

```typescript
await registerDevice(); // Called automatically on login
```

### 2. Real-Time Synchronization
Once logged in, the app enables real-time listeners that:
- Watch for changes to exams on other devices
- Watch for changes to exam attempts on other devices
- Automatically update local state with changes from other devices
- Prevent duplicate notifications from the same device

```typescript
const unsubscribe = enableMultiDeviceSync(
  (updatedExam) => { /* Update exam */ },
  (updatedAttempt) => { /* Update attempt */ }
);
```

### 3. Data Flow

```
Device A                          Firebase Firestore              Device B
┌─────────┐                      ┌──────────────┐               ┌─────────┐
│ Edit    │ Upload ─────────────→│   Exams      │ ←─── Listen  │ Real-   │
│ Exam    │ with serverTimestamp │   Collection │              │ time    │
└─────────┘                      └──────────────┘               │ Update  │
                                                                 └─────────┘
```

## API Reference

### registerDevice()
Registers the current device with the server.
```typescript
await registerDevice();
```

### enableMultiDeviceSync(onExamUpdate, onAttemptUpdate)
Enables real-time synchronization across devices.

**Parameters:**
- `onExamUpdate: (exam: Exam) => void` - Called when an exam is updated on another device
- `onAttemptUpdate: (attempt: ExamAttempt) => void` - Called when an attempt is updated on another device

**Returns:** `() => void` - Function to unsubscribe from updates

```typescript
const unsubscribe = enableMultiDeviceSync(
  (exam) => console.log('Exam updated:', exam),
  (attempt) => console.log('Attempt updated:', attempt)
);

// Later: unsubscribe();
```

### disableMultiDeviceSync()
Stops listening for real-time updates (called on logout).
```typescript
disableMultiDeviceSync();
```

### getActiveDevices()
Get list of devices currently logged in for the user.
```typescript
const devices = await getActiveDevices();
// Returns: [
//   { deviceId, lastActive, userAgent, platform, isCurrent: boolean },
//   ...
// ]
```

### forceSyncAllDevices(exams, attempts)
Manually force a complete sync across all devices.
```typescript
const { attempts, exams } = await forceSyncAllDevices(localExams, localAttempts);
```

### enablePeriodicSync(intervalMs, onSync)
Enable periodic synchronization (alternative to real-time).
```typescript
const unsubscribe = enablePeriodicSync(30000, ({ exams, attempts }) => {
  // Called every 30 seconds
  updateLocalData(exams, attempts);
});

// To disable: unsubscribe();
```

### getSyncStats()
Get synchronization statistics.
```typescript
const stats = await getSyncStats();
// Returns: {
//   totalDevices: number,
//   totalExams: number,
//   totalAttempts: number,
//   lastSyncTime: number
// }
```

### setLastSyncedItem(type, id)
Mark an item as synced to prevent duplicate notifications.
```typescript
setLastSyncedItem('exam', exam.id);
setLastSyncedItem('attempt', attempt.id);
```

## Features

### ✅ Real-Time Updates
Changes made on one device appear instantly on other devices logged in to the same account.

### ✅ Automatic Device Registration
Every device is automatically registered when the user logs in. Device information includes:
- Device ID (unique identifier)
- Last active timestamp
- Browser/OS information

### ✅ Conflict Resolution
Uses **Last-Write-Wins** strategy with server timestamps:
- Server timestamp determines which version is kept
- Latest change always wins
- Device ID recorded for traceability

### ✅ Offline Support
When offline:
- App continues to work with local data (IndexedDB)
- Changes are queued locally
- Automatic sync when connection is restored

### ✅ Device Detection
See which devices are currently logged in:
```typescript
const devices = await getActiveDevices();
// Includes: deviceId, lastActive, userAgent, platform, isCurrent flag
```

## Architecture

### Components

1. **Device Management** (`registerDevice()`)
   - Tracks multiple devices per user
   - Stores device metadata
   - Marks current device

2. **Real-Time Listeners** (`enableMultiDeviceSync()`)
   - Firestore `onSnapshot` listeners
   - Watches for changes to exams and attempts
   - Automatic state updates in React

3. **Conflict Detection** (Uses serverTimestamp)
   - Compares server timestamps
   - Last-write-wins strategy
   - Prevents data loss

4. **Periodic Sync** (`enablePeriodicSync()`)
   - Alternative to real-time (useful for low bandwidth)
   - Configurable interval
   - Suitable for mobile apps

## Integration in App.tsx

The multi-device sync is automatically initialized on user login:

```typescript
// 1. Register device
await registerDevice();

// 2. Enable real-time updates
const unsubscribe = enableMultiDeviceSync(
  (updatedExam) => { /* Update exam in state */ },
  (updatedAttempt) => { /* Update attempt in state */ }
);

// 3. Load active devices
const devices = await getActiveDevices();
setActiveDevices(devices);

// On logout: cleanup
if (syncUnsubscribe) {
  syncUnsubscribe();
}
disableMultiDeviceSync();
```

## Database Structure

```
users/
  {userId}/
    devices/
      {deviceId}/
        - deviceId: string
        - lastActive: timestamp
        - userAgent: string
        - platform: string
        - syncEnabled: boolean
    exams/
      {examId}/
        - ... exam data
        - lastModified: timestamp (for conflict resolution)
    examAttempts/
      {attemptId}/
        - ... attempt data
        - lastModified: timestamp
```

## Usage Examples

### Basic Setup (Automatic)
Simply log in - sync is set up automatically:
```typescript
const firebaseUser = await signInWithEmail(email, password);
// Device registers and real-time sync starts automatically
```

### Manual Force Sync
Force immediate sync across all devices:
```typescript
const { exams, attempts } = await forceSyncAllDevices(
  currentExams,
  currentAttempts
);
setExams(exams);
setAttemptsHistory(attempts);
```

### Periodic Sync (Mobile App)
For better battery life on mobile:
```typescript
// Sync every 30 seconds instead of real-time
const unsubscribe = enablePeriodicSync(30000, ({ exams, attempts }) => {
  setExams(exams);
  setAttemptsHistory(attempts);
});
```

### Monitor Active Devices
Show user which devices are logged in:
```typescript
const devices = await getActiveDevices();
devices.forEach(device => {
  console.log(`Device: ${device.deviceId}`);
  console.log(`Last Active: ${new Date(device.lastActive)}`);
  console.log(`Current Device: ${device.isCurrent ? '✓' : '✗'}`);
});
```

## Performance Considerations

### Network Usage
- Real-time sync: Uses Firestore listeners (~1KB per update)
- Periodic sync: Configurable polling (~2-5KB per check)
- Bidirectional sync: Uploads changes + downloads new data

### Storage Usage
- Device metadata: ~500 bytes per device
- Index for fast queries: Minimal (serverTimestamp indexed)
- Total overhead: < 1MB per user

### Latency
- Real-time: 1-3 seconds (depends on network)
- Periodic: 30-60 seconds (configurable)
- Initial sync: 5-10 seconds for first data load

## Troubleshooting

### Sync Not Working
1. Check Firebase auth: `console.log(currentUser)`
2. Check internet connection
3. Check Firestore permissions in Firebase console
4. Look at browser console for errors

### Missing Data on Another Device
1. Force manual sync: `await forceSyncAllDevices(exams, attempts)`
2. Clear local cache and refresh
3. Check device is registered: `await getActiveDevices()`

### Slow Sync
1. Check network speed
2. Consider periodic sync instead of real-time (mobile)
3. Reduce number of exams/attempts
4. Check Firestore quota usage

## Security Notes

- Device registration requires Firebase authentication
- Only users' own devices can sync their data
- Firestore security rules enforce user-level isolation
- No cross-user data sharing
- Device information is user-scoped (not visible to other users)

## Future Enhancements

1. **Selective Sync**: Choose which exams to sync
2. **Sync History**: View sync activity logs
3. **Conflict Resolution UI**: Let user choose which version to keep
4. **Bandwidth Optimization**: Only sync changed fields
5. **Delta Sync**: Only upload/download changes, not full data
6. **Device Management UI**: Add device naming and remote logout

## References

- [Firebase Firestore Real-time Listeners](https://firebase.google.com/docs/firestore/query-data/listen)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/start)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
