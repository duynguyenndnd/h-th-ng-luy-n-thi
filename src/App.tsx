import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Button } from './components/Button';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { ExamRunner } from './components/ExamRunner';
import { ExamResult } from './components/ExamResult';
import { ExamEditor } from './components/ExamEditor';
import { AnswerKeyView } from './components/AnswerKey';
import { ImportExamView } from './components/ImportExam';
import { UserManagement } from './components/UserManagement';
import { UserHistory } from './components/UserHistory';
import { AdminDashboard } from './components/AdminDashboard';
import { Exam, ExamAttempt, UserRole, User, ExamType, UserPermission } from './types';
import { initDB, saveExam, getExams, deleteExam, saveAttempt, getAttempts } from './services/dbService';
import { onUserAuthStateChanged, logoutUser } from './services/authService';
import { 
  syncBidirectional,
  registerDevice,
  enableMultiDeviceSync,
  setLastSyncedItem,
  uploadExam,
  downloadExams
} from './services/cloudSync';
import { db } from './services/firebaseConfig';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';

enum AppView {
  LOGIN,
  DASHBOARD,
  EXAM,
  RESULT,
  EDITOR,
  USER_MANAGEMENT,
  ANSWER_KEY,
  IMPORT_EXAM,
  USER_HISTORY,
  ADMIN_DASHBOARD
}

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LOGIN);
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [examMode, setExamMode] = useState<'run' | 'edit'>('run');
  const [attemptsHistory, setAttemptsHistory] = useState<ExamAttempt[]>([]);
  const [lastAttempt, setLastAttempt] = useState<ExamAttempt| null>(null);
  const [editingExam, setEditingExam] = useState<Exam | undefined>(undefined);
  const [isSyncing, setIsSyncing] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        console.log("🚀 Initializing App...");
        await initDB();
        console.log("✅ DB Initialized");
      } catch (e) {
        console.error("❌ IndexedDB init failed", e);
      } finally {
        setInitLoading(false);
      }
    };
    init();
    
    const unsubscribe = onUserAuthStateChanged(async (user) => {
      setFirebaseUser(user);
      if (user) {
        console.log('✅ Firebase user logged in:', user.email);
        
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (userData?.role) {
              setUserRole(userData.role as UserRole);
            }
          } else {
            setUserRole('student');
          }
        } catch (error) {
          console.error('❌ Profile fetch failed:', error);
          setUserRole('student');
        }
        
        setIsSyncing(true);
        try {
          const localExams = await getExams();
          const localAttempts = await getAttempts();
          const { exams: syncedExams, attempts: syncedAttempts } = await syncBidirectional(localExams, localAttempts);
          setExams(syncedExams);
          setAttemptsHistory(syncedAttempts);
          
          await registerDevice();
          enableMultiDeviceSync(
            (updatedExam) => {
              setExams(prev => {
                const idx = prev.findIndex(e => e.id === updatedExam.id);
                if (idx >= 0) {
                    const next = [...prev];
                    next[idx] = updatedExam;
                    return next;
                }
                return [...prev, updatedExam];
              });
              setLastSyncedItem('exam', updatedExam.id);
            },
            (updatedAttempt) => {
              setAttemptsHistory(prev => {
                const idx = prev.findIndex(a => a.id === updatedAttempt.id);
                if (idx >= 0) {
                    const next = [...prev];
                    next[idx] = updatedAttempt;
                    return next;
                }
                return [...prev, updatedAttempt];
              });
              setLastSyncedItem('attempt', updatedAttempt.id);
            }
          );
          setView(AppView.DASHBOARD);
        } catch (error) {
          console.error('❌ Sync failed:', error);
          const localExams = await getExams();
          const localAttempts = await getAttempts();
          setExams(localExams);
          setAttemptsHistory(localAttempts);
          setView(AppView.DASHBOARD);
        } finally {
          setIsSyncing(false);
        }
      } else {
        setUserRole(null);
        setView(AppView.LOGIN);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setView(AppView.LOGIN);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSelectExam = (exam: Exam, mode: 'run' | 'edit') => {
    setCurrentExam(exam);
    if (mode === 'edit') {
      setEditingExam(exam);
      setView(AppView.EDITOR);
    } else {
      setExamMode('run');
      setView(AppView.EXAM);
    }
  };

  const handleCreateExam = () => {
    setEditingExam(undefined);
    setView(AppView.EDITOR);
  };

  const handleImportExam = () => {
    setView(AppView.IMPORT_EXAM);
  };

  const handleManageUsers = () => {
    setView(AppView.USER_MANAGEMENT);
  };

  const handleViewHistory = () => {
    setView(AppView.USER_HISTORY);
  };

  const handleViewAdminDashboard = () => {
    setView(AppView.ADMIN_DASHBOARD);
  };

  const handleViewResultFromHistory = (attempt: ExamAttempt) => {
    const exam = exams.find(e => e.id === attempt.examId);
    if (exam) {
      setCurrentExam(exam);
      setLastAttempt(attempt);
      setView(AppView.RESULT);
    }
  };

  const handleRefreshExams = async () => {
    try {
      // Download fresh exams from Firebase
      const freshExams = await downloadExams();
      setExams(freshExams);
    } catch (error) {
      console.error('Error refreshing exams:', error);
    }
  };

  const handlePublishExam = async (examId: string) => {
    try {
      const exam = exams.find(e => e.id === examId);
      if (!exam) {
        alert('Không tìm thấy đề thi');
        return;
      }

      console.log('📤 Publishing exam to system...', exam.title);
      if (firebaseUser) {
        await uploadExam(exam);
        console.log('✅ Exam published successfully!', exam.id);
        alert('✅ Đề thi đã được tải lên hệ thống!\nCác user khác sẽ có thể thấy đề này.');
      }
    } catch (error) {
      console.error('❌ Error publishing exam:', error);
      alert('Lỗi khi tải lên hệ thống: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleDeleteExam = async (id: string) => {
    await deleteExam(id);
    // Also delete from Firebase so it's removed for all users
    if (firebaseUser) {
      try {
        await deleteDoc(doc(db, 'globalExams', id));
      } catch (error) {
        console.warn('Could not delete from Firebase:', error);
      }
    }
    setExams(prev => prev.filter(e => e.id !== id));
  };

  const handleSaveEditor = async (exam: Exam) => {
    try {
      await saveExam(exam);
      // Upload to Firestore so all users can see it
      if (firebaseUser) {
        await uploadExam(exam);
      }
      const updatedExams = await getExams();
      setExams(updatedExams);
      setView(AppView.DASHBOARD);
    } catch (error) {
      console.error('Error saving exam:', error);
      alert('Lỗi khi lưu đề thi. Vui lòng thử lại.');
    }
  };

  const handleFinishExam = async (answers: Record<string, any>, timeSpent: number) => {
    if (!currentExam) return;
    
    // Calculate score
    let correctCount = 0;
    currentExam.questions.forEach(q => {
      const userAns = answers[q.id];
      if (userAns === q.correctIndex || userAns === q.correctAnswer) {
        correctCount++;
      }
    });
    
    const attempt: ExamAttempt = {
      id: Math.random().toString(36).substr(2, 9),
      examId: currentExam.id,
      examTitle: currentExam.title,
      examType: currentExam.type,
      startTime: Date.now() - timeSpent * 1000,
      endTime: Date.now(),
      answers: answers,
      score: correctCount
    };
    
    await saveAttempt(attempt);
    setLastAttempt(attempt);
    const updatedAttempts = await getAttempts();
    setAttemptsHistory(updatedAttempts);
    setView(AppView.RESULT);
  };

  return (
    <Layout userRole={userRole} onLogout={userRole ? handleLogout : undefined}>
      {initLoading && (
        <div className="fixed inset-0 bg-white z-[60] flex flex-col items-center justify-center">
          <div className="text-6xl animate-bounce mb-4 text-indigo-600">✦</div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">TSA Master</h1>
          <p className="text-slate-400 font-medium mt-2">Đang tải hệ thống...</p>
        </div>
      )}
      {isSyncing && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-white p-8 rounded-3xl shadow-2xl text-center space-y-4">
                  <div className="text-4xl animate-spin inline-block">⏳</div>
                  <h2 className="text-xl font-bold">Đang đồng bộ dữ liệu...</h2>
                  <p className="text-slate-500">Vui lòng đợi giây lát</p>
              </div>
          </div>
      )}
      
      {view === AppView.LOGIN && <Login onLoginSuccess={() => {}} />}
      
      {view === AppView.DASHBOARD && (
        <Dashboard 
          exams={exams} 
          userRole={userRole}
          onCreateExam={handleCreateExam}
          onImportExam={handleImportExam}
          onManageUsers={userRole === 'admin' ? handleManageUsers : undefined}
          onViewHistory={handleViewHistory}
          onViewAdminDashboard={userRole === 'admin' ? handleViewAdminDashboard : undefined}
          onRefresh={handleRefreshExams}
          onSelectExam={handleSelectExam}
          onDeleteExam={handleDeleteExam}
          onPublishExam={userRole === 'admin' ? handlePublishExam : undefined}
        />
      )}

      {view === AppView.IMPORT_EXAM && (
        <ImportExamView onBack={() => setView(AppView.DASHBOARD)} onImportSuccess={async (exam) => {
          try {
            // Save locally
            console.log('📝 Saving exam locally...', exam.title);
            await saveExam(exam);
            
            // Upload to Firebase immediately so all users can see it
            if (firebaseUser) {
              console.log('📤 Uploading exam to server...', exam.title);
              await uploadExam(exam);
              console.log('✅ Exam uploaded to server:', exam.id);
            } else {
              console.warn('⚠️  Not logged in - exam saved locally only');
            }
            
            setExams(prev => [...prev, exam]);
            setView(AppView.DASHBOARD);
          } catch (error) {
            console.error('❌ Error importing exam:', error);
            alert('Lỗi khi import đề thi. Vui lòng thử lại.\n' + (error instanceof Error ? error.message : String(error)));
          }
        }} />
      )}

      {view === AppView.EXAM && currentExam && (
        <ExamRunner 
          exam={currentExam} 
          mode={examMode} 
          onFinish={handleFinishExam} 
          onExit={() => setView(AppView.DASHBOARD)} 
        />
      )}

      {view === AppView.RESULT && lastAttempt && currentExam && (
        <ExamResult 
          attempt={lastAttempt} 
          exam={currentExam} 
          onHome={() => setView(AppView.DASHBOARD)} 
        />
      )}

      {view === AppView.EDITOR && (
        <ExamEditor 
          initialExam={editingExam} 
          onSave={handleSaveEditor} 
          onCancel={() => setView(AppView.DASHBOARD)}
        />
      )}

      {view === AppView.USER_MANAGEMENT && (
        <UserManagement onBack={() => setView(AppView.DASHBOARD)} />
      )}

      {view === AppView.USER_HISTORY && (
        <UserHistory 
          exams={exams}
          onViewResult={handleViewResultFromHistory}
          onHome={() => setView(AppView.DASHBOARD)}
        />
      )}

      {view === AppView.ADMIN_DASHBOARD && (
        <AdminDashboard 
          exams={exams}
          onHome={() => setView(AppView.DASHBOARD)}
        />
      )}
    </Layout>
  );
};

export default App;
