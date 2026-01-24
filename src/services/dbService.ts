import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Exam, ExamAttempt, User, ExamType } from '../types';
import { INITIAL_EXAM } from './initialData';

interface TSADB extends DBSchema {
  exams: {
    key: string;
    value: Exam;
  };
  attempts: {
    key: string;
    value: ExamAttempt;
    indexes: { 'by-date': number };
  };
  users: {
    key: string;
    value: User;
  };
}

const DB_NAME = 'tsa-hsa-master-db';
const DB_VERSION = 3; 

let dbPromise: Promise<IDBPDatabase<TSADB>>;

export const initDB = async (): Promise<void> => {
  dbPromise = openDB<TSADB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      if (!db.objectStoreNames.contains('exams')) {
        db.createObjectStore('exams', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('attempts')) {
        const attemptStore = db.createObjectStore('attempts', { keyPath: 'id' });
        attemptStore.createIndex('by-date', 'endTime');
      }
      if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', { keyPath: 'username' });
      }
    },
  });

  const db = await dbPromise;

  // Seed Initial Exam if empty (admin account is now managed via Firebase)
  const examCount = await db.count('exams');
  if (examCount === 0) {
    await saveExam(INITIAL_EXAM);
  }
};

export const generateId = (): string => Math.random().toString(36).substr(2, 9);

const getDB = async (): Promise<IDBPDatabase<TSADB>> => {
  if (!dbPromise) {
    await initDB();
  }
  return dbPromise;
};

// --- User Management ---

export const authenticateUser = async (username: string, password: string): Promise<User | null> => {
  const db = await getDB();
  const user = await db.get('users', username);
  if (user && user.password === password) {
    return user;
  }
  return null;
};

export const getAllUsers = async (): Promise<User[]> => {
  const db = await getDB();
  return await db.getAll('users');
};

export const createUser = async (user: User): Promise<void> => {
  const db = await getDB();
  const existing = await db.get('users', user.username);
  if (existing) {
    throw new Error("Tên đăng nhập đã tồn tại!");
  }
  await db.put('users', user);
};

export const updateUser = async (user: User): Promise<void> => {
  const db = await getDB();
  await db.put('users', user);
};

export const deleteUser = async (username: string): Promise<void> => {
  const db = await getDB();
  await db.delete('users', username);
};

// --- Exam Management ---

export const saveExam = async (exam: Exam): Promise<void> => {
  if (!exam || !exam.id) {
    throw new Error('Exam must have an id field');
  }
  
  try {
    const db = await getDB();
    await db.put('exams', exam);
    console.log('✅ Exam saved to IndexedDB:', exam.id);
  } catch (error: any) {
    console.error('❌ Error saving exam to IndexedDB:', error);
    console.error('Exam object:', exam);
    throw new Error(`Failed to save exam: ${error?.message || String(error)}`);
  }
};

export const getExams = async (): Promise<Exam[]> => {
  const db = await getDB();
  return await db.getAll('exams');
};

export const getExamById = async (id: string): Promise<Exam | undefined> => {
  const db = await getDB();
  return await db.get('exams', id);
};

export const deleteExam = async (id: string): Promise<void> => {
  const db = await getDB();
  await db.delete('exams', id);
};

export const saveAttempt = async (attempt: ExamAttempt): Promise<void> => {
  const db = await getDB();
  await db.put('attempts', attempt);
};

export const getAttempts = async (): Promise<ExamAttempt[]> => {
  const db = await getDB();
  const attempts = await db.getAllFromIndex('attempts', 'by-date');
  return attempts.reverse();
};

// --- Export / Import ---

export const exportAllData = async (): Promise<string> => {
  const db = await getDB();
  const exams = await db.getAll('exams');
  return JSON.stringify({
    version: 2,
    type: 'tsa-hsa-backup',
    exportedAt: Date.now(),
    exams: exams
  }, null, 2);
};