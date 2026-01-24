import { 
  collection, 
  doc, 
  setDoc, 
  getDocs,
  Timestamp,
  query,
  where,
  onSnapshot,
  Unsubscribe,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from './firebaseConfig';
import { ExamAttempt, Exam } from '../types';

// Helper: Remove undefined fields (Firestore doesn't allow undefined)
// This recursively cleans all nested objects and arrays
const cleanData = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return undefined;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj
      .map(item => cleanData(item))
      .filter(item => item !== undefined);
  }

  // Handle objects
  if (typeof obj === 'object' && !(obj instanceof Date) && !(obj instanceof Timestamp)) {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const cleanedValue = cleanData(value);
      if (cleanedValue !== undefined) {
        cleaned[key] = cleanedValue;
      }
    }
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }

  // Return primitive values as-is
  return obj;
};

// Upload exam attempts to Firestore
export const uploadExamAttempt = async (attempt: ExamAttempt): Promise<void> => {
  if (!auth.currentUser) {
    console.warn('User not authenticated, skipping cloud sync');
    return;
  }

  try {
    const userId = auth.currentUser.uid;
    const attemptRef = doc(db, 'users', userId, 'examAttempts', attempt.id);
    
    // Clean undefined fields before saving
    const cleanedAttempt = cleanData(attempt);
    
    await setDoc(attemptRef, {
      ...cleanedAttempt,
      syncedAt: Timestamp.now(),
      userId: userId
    });
    
    console.log('✅ Exam attempt synced to cloud:', attempt.id);
  } catch (error) {
    console.error('❌ Error syncing exam attempt:', error);
    throw error;
  }
};

// Download all exam attempts from Firestore
export const downloadExamAttempts = async (): Promise<ExamAttempt[]> => {
  if (!auth.currentUser) {
    console.warn('User not authenticated, skipping cloud sync');
    return [];
  }

  try {
    const userId = auth.currentUser.uid;
    const attemptsRef = collection(db, 'users', userId, 'examAttempts');
    const snapshot = await getDocs(attemptsRef);
    
    const attempts: ExamAttempt[] = [];
    snapshot.forEach(doc => {
      attempts.push(doc.data() as ExamAttempt);
    });
    
    console.log('✅ Downloaded exam attempts from cloud:', attempts.length);
    return attempts;
  } catch (error) {
    console.error('❌ Error downloading exam attempts:', error);
    return [];
  }
};

// Helper: Normalize exam data to ensure all required fields exist
const normalizeExam = (exam: Exam): Exam => {
  return {
    ...exam,
    title: exam.title || 'Untitled',
    description: exam.description || '',
    type: exam.type || 'tsa',
    durationMinutes: exam.durationMinutes ?? 90,
    questionCount: exam.questionCount || 0,
    createdAt: exam.createdAt || Date.now(),
    questions: (exam.questions || []).map(q => ({
      ...q,
      id: q.id || generateId(),
      type: q.type || 'multiple_choice'
    }))
  };
};

// Upload saved exams to Firestore
export const uploadExam = async (exam: Exam): Promise<void> => {
  if (!auth.currentUser) {
    console.warn('User not authenticated, skipping cloud sync');
    return;
  }

  try {
    const userId = auth.currentUser.uid;
    
    // Save to globalExams collection (accessible to all users)
    const examRef = doc(db, 'globalExams', exam.id);
    
    // Normalize data to ensure all fields are valid
    const normalizedExam = normalizeExam(exam);
    
    // Clean undefined fields before saving
    const cleanedExam = cleanData(normalizedExam);
    
    await setDoc(examRef, {
      ...cleanedExam,
      syncedAt: Timestamp.now(),
      userId: userId,
      isGlobal: true,
      uploadedBy: userId
    });
    
    console.log('✅ Exam synced to global collection:', exam.id);
  } catch (error) {
    console.error('❌ Error syncing exam:', error);
  }
};

// Download all exams from Firestore (both personal and global)
export const downloadExams = async (): Promise<Exam[]> => {
  if (!auth.currentUser) {
    console.warn('User not authenticated, skipping cloud sync');
    return [];
  }

  try {
    const userId = auth.currentUser.uid;
    const allExams: Exam[] = [];
    
    // Download personal exams
    const personalExamsRef = collection(db, 'users', userId, 'exams');
    const personalSnapshot = await getDocs(personalExamsRef);
    
    personalSnapshot.forEach(doc => {
      allExams.push(doc.data() as Exam);
    });
    
    // Download global exams (from globalExams collection)
    const globalExamsRef = collection(db, 'globalExams');
    const globalSnapshot = await getDocs(globalExamsRef);
    
    globalSnapshot.forEach(doc => {
      const exam = doc.data() as Exam;
      // Check if we already have this exam (avoid duplicates)
      if (!allExams.find(e => e.id === exam.id)) {
        allExams.push(exam);
      }
    });
    
    console.log('✅ Downloaded exams from cloud:', {
      personal: personalSnapshot.size,
      global: globalSnapshot.size,
      total: allExams.length
    });
    return allExams;
  } catch (error) {
    console.error('❌ Error downloading exams:', error);
    return [];
  }
};

// Upload all local data (from IndexedDB) to Firestore
export const uploadLocalDataToCloud = async (
  localExams: Exam[],
  localAttempts: ExamAttempt[]
): Promise<void> => {
  if (!auth.currentUser) {
    console.warn('User not authenticated, skipping upload');
    return;
  }

  try {
    console.log('📤 Uploading local data to cloud...');
    
    // Upload all local exams
    for (const exam of localExams) {
      await uploadExam(exam);
    }
    
    // Upload all local attempts
    for (const attempt of localAttempts) {
      await uploadExamAttempt(attempt);
    }
    
    console.log('✅ Local data uploaded to cloud');
  } catch (error) {
    console.error('❌ Error uploading local data:', error);
  }
};

// Bidirectional sync: Upload local → Cloud → Download
export const syncBidirectional = async (
  localExams: Exam[],
  localAttempts: ExamAttempt[]
): Promise<{
  attempts: ExamAttempt[];
  exams: Exam[];
}> => {
  // Step 1: Upload local data to cloud first
  await uploadLocalDataToCloud(localExams, localAttempts);
  
  // Step 2: Download from cloud to get updates from other devices
  const attempts = await downloadExamAttempts();
  const exams = await downloadExams();
  
  return { attempts, exams };
};

// Sync all data from cloud on app start (old function kept for compatibility)
export const syncFromCloud = async (): Promise<{
  attempts: ExamAttempt[];
  exams: Exam[];
}> => {
  const attempts = await downloadExamAttempts();
  const exams = await downloadExams();
  return { attempts, exams };
};

// ============================================
// MULTI-DEVICE SYNCHRONIZATION
// ============================================

// Track device ID for multi-device sync
let deviceId: string = '';
let syncSubscriptions: Unsubscribe[] = [];

// Generate or retrieve device ID
const getDeviceId = (): string => {
  if (deviceId) return deviceId;
  
  let stored = localStorage.getItem('device_id');
  if (!stored) {
    stored = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('device_id', stored);
  }
  deviceId = stored;
  return deviceId;
};

// Register current device as active
export const registerDevice = async (): Promise<void> => {
  if (!auth.currentUser) return;
  
  try {
    const userId = auth.currentUser.uid;
    const currentDeviceId = getDeviceId();
    const deviceRef = doc(db, 'users', userId, 'devices', currentDeviceId);
    
    await setDoc(deviceRef, {
      deviceId: currentDeviceId,
      lastActive: serverTimestamp(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      syncEnabled: true
    }, { merge: true });
    
    console.log('✅ Device registered:', currentDeviceId);
  } catch (error) {
    console.error('❌ Error registering device:', error);
  }
};

// Sync across all user's devices - real-time listener
export const enableMultiDeviceSync = (
  onExamUpdate: (exam: Exam) => void,
  onAttemptUpdate: (attempt: ExamAttempt) => void
): (() => void) => {
  if (!auth.currentUser) {
    console.warn('User not authenticated, cannot enable multi-device sync');
    return () => {};
  }
  
  const userId = auth.currentUser.uid;
  const unsubscribers: Unsubscribe[] = [];
  
  try {
    // Listen to exam changes in real-time
    const examsRef = collection(db, 'users', userId, 'exams');
    const examsUnsubscriber = onSnapshot(examsRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const exam = change.doc.data() as Exam;
        // Only process if from different device
        if (localStorage.getItem('lastExamId') !== exam.id) {
          onExamUpdate(exam);
          console.log(`📱 Exam synced from another device: ${exam.title}`);
        }
      });
    });
    unsubscribers.push(examsUnsubscriber);
    
    // Listen to attempt changes in real-time
    const attemptsRef = collection(db, 'users', userId, 'examAttempts');
    const attemptsUnsubscriber = onSnapshot(attemptsRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const attempt = change.doc.data() as ExamAttempt;
        // Only process if from different device
        if (localStorage.getItem('lastAttemptId') !== attempt.id) {
          onAttemptUpdate(attempt);
          console.log(`📱 Attempt synced from another device: ${attempt.examTitle}`);
        }
      });
    });
    unsubscribers.push(attemptsUnsubscriber);
    
    syncSubscriptions = unsubscribers;
    console.log('✅ Multi-device sync enabled');
    
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
      syncSubscriptions = [];
      console.log('🛑 Multi-device sync disabled');
    };
  } catch (error) {
    console.error('❌ Error enabling multi-device sync:', error);
    return () => {};
  }
};

// Disable all active sync listeners
export const disableMultiDeviceSync = (): void => {
  syncSubscriptions.forEach(unsubscriber => unsubscriber());
  syncSubscriptions = [];
  console.log('🛑 All sync listeners disabled');
};

// Get list of active devices for current user
export const getActiveDevices = async (): Promise<any[]> => {
  if (!auth.currentUser) return [];
  
  try {
    const userId = auth.currentUser.uid;
    const devicesRef = collection(db, 'users', userId, 'devices');
    const snapshot = await getDocs(devicesRef);
    
    const devices: any[] = [];
    snapshot.forEach(doc => {
      const device = doc.data();
      devices.push({
        ...device,
        isCurrent: device.deviceId === getDeviceId()
      });
    });
    
    return devices.sort((a, b) => b.lastActive - a.lastActive);
  } catch (error) {
    console.error('❌ Error fetching devices:', error);
    return [];
  }
};

// Force sync across all devices
export const forceSyncAllDevices = async (
  localExams: Exam[],
  localAttempts: ExamAttempt[]
): Promise<{
  attempts: ExamAttempt[];
  exams: Exam[];
}> => {
  if (!auth.currentUser) {
    console.warn('User not authenticated, cannot sync');
    return { attempts: [], exams: [] };
  }
  
  try {
    console.log('🔄 Force syncing all devices...');
    
    // Register this device as active
    await registerDevice();
    
    // Upload local changes
    await uploadLocalDataToCloud(localExams, localAttempts);
    
    // Download latest from cloud
    const attempts = await downloadExamAttempts();
    const exams = await downloadExams();
    
    console.log('✅ All devices synced:', {
      exams: exams.length,
      attempts: attempts.length
    });
    
    return { attempts, exams };
  } catch (error) {
    console.error('❌ Error forcing sync:', error);
    return { attempts: [], exams: [] };
  }
};

// Periodic sync function (for periodic sync instead of real-time)
export const enablePeriodicSync = (
  intervalMs: number = 30000,
  onSync?: (data: { attempts: ExamAttempt[]; exams: Exam[] }) => void
): (() => void) => {
  let intervalId: NodeJS.Timeout | null = null;
  
  const performSync = async () => {
    if (!auth.currentUser) return;
    
    try {
      const attempts = await downloadExamAttempts();
      const exams = await downloadExams();
      
      if (onSync) {
        onSync({ attempts, exams });
      }
      
      console.log(`✅ Periodic sync completed (${new Date().toLocaleTimeString()})`);
    } catch (error) {
      console.error('❌ Periodic sync error:', error);
    }
  };
  
  // Initial sync
  performSync();
  
  // Schedule periodic syncs
  intervalId = setInterval(performSync, intervalMs);
  console.log(`✅ Periodic sync enabled (every ${intervalMs}ms)`);
  
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
      console.log('🛑 Periodic sync disabled');
    }
  };
};

// Track last synced item to avoid duplicate notifications
export const setLastSyncedItem = (type: 'exam' | 'attempt', id: string): void => {
  if (type === 'exam') {
    localStorage.setItem('lastExamId', id);
  } else {
    localStorage.setItem('lastAttemptId', id);
  }
};

// Get sync statistics
export const getSyncStats = async (): Promise<{
  totalDevices: number;
  totalExams: number;
  totalAttempts: number;
  lastSyncTime: number;
}> => {
  if (!auth.currentUser) {
    return { totalDevices: 0, totalExams: 0, totalAttempts: 0, lastSyncTime: 0 };
  }
  
  try {
    const userId = auth.currentUser.uid;
    
    // Get device count
    const devicesRef = collection(db, 'users', userId, 'devices');
    const devicesSnapshot = await getDocs(devicesRef);
    
    // Get exam count
    const examsRef = collection(db, 'users', userId, 'exams');
    const examsSnapshot = await getDocs(examsRef);
    
    // Get attempt count
    const attemptsRef = collection(db, 'users', userId, 'examAttempts');
    const attemptsSnapshot = await getDocs(attemptsRef);
    
    return {
      totalDevices: devicesSnapshot.size,
      totalExams: examsSnapshot.size,
      totalAttempts: attemptsSnapshot.size,
      lastSyncTime: Date.now()
    };
  } catch (error) {
    console.error('❌ Error getting sync stats:', error);
    return { totalDevices: 0, totalExams: 0, totalAttempts: 0, lastSyncTime: 0 };
  }
};
