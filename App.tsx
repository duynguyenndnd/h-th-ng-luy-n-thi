import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Button } from './components/Button';
import { Exam, ExamAttempt, UserRole, User, ExamType } from './types';
import { initDB, saveExam, getExams, deleteExam, saveAttempt, getAttempts, authenticateUser, getAllUsers, createUser, deleteUser, exportAllData } from './services/dbService';
import { parseJSONExam, parseCSVExam, parseTextExam } from './services/fileParser';
import { generateExamFromTopic } from './services/geminiService';
import { ExamRunner } from './components/ExamRunner';
import { ExamResult } from './components/ExamResult';
import { ExamEditor } from './components/ExamEditor';

enum AppView {
  LOGIN,
  DASHBOARD,
  EXAM,
  RESULT,
  EDITOR,
  USER_MANAGEMENT
}

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LOGIN);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  
  // Login State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Dashboard State
  const [activeTab, setActiveTab] = useState<ExamType>(ExamType.TSA);
  
  const [exams, setExams] = useState<Exam[]>([]);
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [examMode, setExamMode] = useState<'exam' | 'practice'>('exam');
  const [lastAttempt, setLastAttempt] = useState<ExamAttempt | null>(null);
  const [attemptsHistory, setAttemptsHistory] = useState<ExamAttempt[]>([]);
  
  // User Management State
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState<{
    username: string;
    password: string;
    fullName: string;
    allowedExamTypes: ExamType[];
  }>({ 
    username: '', 
    password: '', 
    fullName: '', 
    allowedExamTypes: [ExamType.TSA, ExamType.HSA] // Default both
  });

  useEffect(() => {
    const init = async () => {
      await initDB();
    };
    init();
  }, []);

  const loadData = async () => {
    const loadedExams = await getExams();
    const loadedAttempts = await getAttempts();
    setExams(loadedExams);
    setAttemptsHistory(loadedAttempts);
  };

  const handleLogin = async () => {
    if (!loginUsername || !loginPassword) {
      setLoginError("Vui lòng nhập tên đăng nhập và mật khẩu");
      return;
    }
    
    try {
      const user = await authenticateUser(loginUsername, loginPassword);
      if (user) {
        setCurrentUser(user);
        setUserRole(user.role);
        setLoginError('');
        
        // Logic to redirect user based on allowed permissions
        if (user.role !== 'admin' && user.allowedExamTypes) {
           if (user.allowedExamTypes.includes(ExamType.TSA)) setActiveTab(ExamType.TSA);
           else if (user.allowedExamTypes.includes(ExamType.HSA)) setActiveTab(ExamType.HSA);
        }

        await loadData();
        setView(AppView.DASHBOARD);
      } else {
        setLoginError("Tên đăng nhập hoặc mật khẩu không đúng");
      }
    } catch (e) {
      setLoginError("Lỗi đăng nhập");
    }
  };

  const handleLogout = async () => {
    setCurrentUser(null);
    setUserRole(null);
    setView(AppView.LOGIN);
    setLoginUsername('');
    setLoginPassword('');
  };

  // --- User Management ---
  const loadUsers = async () => {
    const all = await getAllUsers();
    setUsers(all);
  };

  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.password || !newUser.fullName) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (newUser.allowedExamTypes.length === 0) {
      alert("Vui lòng chọn ít nhất một loại đề thi được phép.");
      return;
    }

    try {
      await createUser({
        ...newUser,
        role: 'user',
        registeredAt: Date.now()
      });
      alert("Tạo tài khoản thành công");
      setNewUser({ username: '', password: '', fullName: '', allowedExamTypes: [ExamType.TSA, ExamType.HSA] });
      loadUsers();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDeleteUser = async (username: string) => {
    if (username === 'admin') {
      alert("Không thể xóa tài khoản Admin mặc định");
      return;
    }
    if (confirm(`Xóa tài khoản ${username}?`)) {
      await deleteUser(username);
      loadUsers();
    }
  };

  const toggleNewUserPermission = (type: ExamType) => {
     setNewUser(prev => {
        const exists = prev.allowedExamTypes.includes(type);
        if (exists) {
           return { ...prev, allowedExamTypes: prev.allowedExamTypes.filter(t => t !== type) };
        } else {
           return { ...prev, allowedExamTypes: [...prev.allowedExamTypes, type] };
        }
     });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (userRole !== 'admin') return; 

    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      let newExam: Exam | null = null;

      try {
        if (file.name.endsWith('.json')) {
           try {
             const json = JSON.parse(content);
             if (json.type === 'tsa-hsa-backup' && Array.isArray(json.exams)) {
                if (confirm(`Tìm thấy file sao lưu chứa ${json.exams.length} đề thi. Bạn có muốn khôi phục không?`)) {
                   for (const ex of json.exams) {
                      await saveExam(ex);
                   }
                   await loadData();
                   alert("Đã khôi phục dữ liệu thành công!");
                   return;
                }
             }
           } catch {}
           newExam = parseJSONExam(content);
        } else if (file.name.endsWith('.csv')) {
          newExam = parseCSVExam(content, file.name);
        } else if (file.name.endsWith('.txt')) {
          newExam = parseTextExam(content, file.name);
        }

        if (newExam && newExam.questions.length > 0) {
          await saveExam(newExam);
          await loadData();
          alert(`Import đề thi thành công! (${newExam.type} - ${newExam.questions.length} câu hỏi)`);
        } else {
          alert('Lỗi: Không tìm thấy câu hỏi hợp lệ hoặc định dạng file không đúng.');
        }
      } catch (error) {
        console.error(error);
        alert('Đã xảy ra lỗi trong quá trình xử lý file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCreateManual = () => {
    if (userRole !== 'admin') return;
    setEditingExam(null); 
    setView(AppView.EDITOR);
  };

  const handleEditExam = (exam: Exam, e: React.MouseEvent) => {
    e.stopPropagation();
    if (userRole !== 'admin') return;
    setEditingExam(exam);
    setView(AppView.EDITOR);
  };

  const handleSaveEditor = async (exam: Exam) => {
    await saveExam(exam);
    await loadData();
    setView(AppView.DASHBOARD);
  };

  const handleFinishExam = async (answers: Record<string, number>, timeSpent: number) => {
    if (!currentExam) return;

    let score = 0;
    currentExam.questions.forEach(q => {
      // Basic scoring
      if (answers[q.id] === q.correctIndex) {
        score++;
      }
    });

    const attempt: ExamAttempt = {
      id: Math.random().toString(36).substr(2, 9),
      examId: currentExam.id,
      examTitle: currentExam.title,
      examType: currentExam.type,
      startTime: Date.now() - (timeSpent * 1000),
      endTime: Date.now(),
      answers,
      score
    };

    await saveAttempt(attempt);
    setLastAttempt(attempt);
    setView(AppView.RESULT);
    await loadData();
  };

  const renderLogin = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-fade-in px-4">
      <div className="text-center mb-8">
         <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-blue-200 mx-auto mb-4">T</div>
         <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Hệ Thống Luyện Thi</h1>
         <p className="text-slate-500">TSA (Tư duy) & HSA (Năng lực)</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 max-w-sm w-full">
         <div className="space-y-5">
           {loginError && <div className="text-red-500 text-sm font-medium text-center bg-red-50 p-2 rounded">{loginError}</div>}
           <div>
             <label className="block text-sm font-semibold text-slate-700 mb-1">Tên đăng nhập</label>
             <input 
               type="text" 
               className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
               value={loginUsername}
               onChange={e => setLoginUsername(e.target.value)}
               onKeyDown={e => e.key === 'Enter' && handleLogin()}
             />
           </div>

           <div>
             <label className="block text-sm font-semibold text-slate-700 mb-1">Mật khẩu</label>
             <input 
               type="password" 
               className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
               value={loginPassword}
               onChange={e => setLoginPassword(e.target.value)}
               onKeyDown={e => e.key === 'Enter' && handleLogin()}
             />
           </div>

           <Button 
             className="w-full shadow-lg shadow-blue-200 mt-2" 
             size="lg"
             onClick={handleLogin}
           >
             Đăng nhập
           </Button>
           
           <div className="text-center text-xs text-slate-400 mt-4">
             Liên hệ giáo viên để được cấp tài khoản.
           </div>
         </div>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">Quản lý người dùng</h2>
          <Button variant="secondary" onClick={() => setView(AppView.DASHBOARD)}>Quay lại</Button>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
             <h3 className="font-bold text-lg mb-4 text-slate-700">Cấp tài khoản mới</h3>
             <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Họ và tên</label>
                  <input 
                     className="w-full border p-2 rounded mt-1" 
                     placeholder="Nguyễn Văn A" 
                     value={newUser.fullName}
                     onChange={e => setNewUser({...newUser, fullName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">ID Đăng nhập</label>
                  <input 
                     className="w-full border p-2 rounded mt-1" 
                     placeholder="nguyenvana" 
                     value={newUser.username}
                     onChange={e => setNewUser({...newUser, username: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Mật khẩu</label>
                  <input 
                     className="w-full border p-2 rounded mt-1" 
                     placeholder="******" 
                     type="text"
                     value={newUser.password}
                     onChange={e => setNewUser({...newUser, password: e.target.value})}
                  />
                </div>
                
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-2">
                   <p className="text-sm font-bold text-blue-800 mb-2">Phân loại tài khoản (Bắt buộc):</p>
                   <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 text-sm cursor-pointer p-2 bg-white rounded border hover:border-blue-400 transition-colors">
                         <input 
                           type="checkbox" 
                           checked={newUser.allowedExamTypes.includes(ExamType.TSA)}
                           onChange={() => toggleNewUserPermission(ExamType.TSA)}
                           className="w-4 h-4 accent-blue-600"
                         />
                         <span className="font-medium text-slate-700">Hệ TSA (Tư duy)</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer p-2 bg-white rounded border hover:border-purple-400 transition-colors">
                         <input 
                           type="checkbox" 
                           checked={newUser.allowedExamTypes.includes(ExamType.HSA)}
                           onChange={() => toggleNewUserPermission(ExamType.HSA)}
                           className="w-4 h-4 accent-purple-600"
                         />
                         <span className="font-medium text-slate-700">Hệ HSA (Năng lực)</span>
                      </label>
                   </div>
                   <p className="text-xs text-blue-600 mt-2 italic">
                      * Người dùng chỉ có thể xem và thi các đề thuộc hệ được chọn.
                   </p>
                </div>

                <Button className="w-full mt-2" onClick={handleCreateUser}>Tạo tài khoản</Button>
             </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                   <tr>
                      <th className="p-4 font-semibold text-slate-600">Họ tên</th>
                      <th className="p-4 font-semibold text-slate-600">Username</th>
                      <th className="p-4 font-semibold text-slate-600">Phân loại (Quyền)</th>
                      <th className="p-4 font-semibold text-slate-600">Thao tác</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {users.map(u => (
                      <tr key={u.username} className="hover:bg-slate-50">
                         <td className="p-4 font-medium">{u.fullName}</td>
                         <td className="p-4 font-mono text-sm text-slate-500">{u.username}</td>
                         <td className="p-4">
                            {u.role === 'admin' ? (
                               <span className="text-xs px-2 py-1 rounded font-bold bg-slate-100 text-slate-700 border border-slate-300">Quản trị viên (Full)</span>
                            ) : (
                               <div className="flex gap-2">
                                  {(!u.allowedExamTypes || u.allowedExamTypes.length === 0) && <span className="text-xs text-red-500 font-bold">Chưa cấp quyền</span>}
                                  {u.allowedExamTypes?.includes(ExamType.TSA) && (
                                     <span className="text-xs px-2 py-1 rounded font-bold bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1">
                                        TSA
                                     </span>
                                  )}
                                  {u.allowedExamTypes?.includes(ExamType.HSA) && (
                                     <span className="text-xs px-2 py-1 rounded font-bold bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1">
                                        HSA
                                     </span>
                                  )}
                               </div>
                            )}
                         </td>
                         <td className="p-4">
                            {u.role !== 'admin' && (
                               <button onClick={() => handleDeleteUser(u.username)} className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                  Xóa
                               </button>
                            )}
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );

  const renderDashboard = () => {
    // Permission check for Tabs
    const canSeeTSA = userRole === 'admin' || currentUser?.allowedExamTypes?.includes(ExamType.TSA);
    const canSeeHSA = userRole === 'admin' || currentUser?.allowedExamTypes?.includes(ExamType.HSA);

    // Filter exams by tab AND permission
    const filteredExams = exams.filter(e => {
        const type = e.type || ExamType.TSA;
        
        // Security check: Don't show exam if user doesn't have permission for this type
        if (userRole !== 'admin') {
           if (type === ExamType.TSA && !canSeeTSA) return false;
           if (type === ExamType.HSA && !canSeeHSA) return false;
        }

        return type === activeTab;
    });

    return (
    <div className="space-y-10 animate-fade-in relative">
      {/* Header Panel */}
      <div className={`rounded-3xl p-8 text-white shadow-xl overflow-hidden relative ${userRole === 'admin' ? 'bg-gradient-to-r from-slate-800 to-slate-900' : 'bg-gradient-to-r from-blue-600 to-indigo-700'}`}>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-3xl font-extrabold mb-2">Xin chào, {currentUser?.fullName}</h2>
            <p className="opacity-90">Hệ thống luyện thi đánh giá năng lực & tư duy toàn diện.</p>
          </div>
          {userRole === 'admin' && (
             <div className="flex gap-3">
                <Button variant="secondary" size="sm" onClick={() => { loadUsers(); setView(AppView.USER_MANAGEMENT); }}>
                   Quản lý người dùng
                </Button>
                <label className="cursor-pointer bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                  <span>Import Đề</span>
                  <input type="file" accept=".json,.csv,.txt" className="hidden" onChange={handleFileUpload} />
                </label>
                <button onClick={handleCreateManual} className="bg-white text-blue-900 font-bold py-2 px-4 rounded-lg shadow-lg hover:bg-blue-50 transition-colors">
                   + Tạo đề mới
                </button>
             </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
         <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 inline-flex">
            {canSeeTSA && (
              <button 
                 onClick={() => setActiveTab(ExamType.TSA)}
                 className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === ExamType.TSA ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                 Luyện thi TSA (Tư duy)
              </button>
            )}
            {canSeeHSA && (
              <button 
                 onClick={() => setActiveTab(ExamType.HSA)}
                 className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === ExamType.HSA ? 'bg-purple-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                 Luyện thi HSA (Năng lực)
              </button>
            )}
         </div>
      </div>

      {/* Exam Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {filteredExams.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
               Chưa có đề thi nào trong danh mục này hoặc bạn chưa được cấp quyền.
            </div>
         ) : (
            filteredExams.map(exam => (
               <div key={exam.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col group">
                  <div className="flex justify-between items-start mb-3">
                     <span className={`text-[10px] font-bold uppercase tracking-wider py-1 px-2 rounded ${exam.type === ExamType.HSA ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {exam.type || 'TSA'}
                     </span>
                     {userRole === 'admin' && (
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={(e) => handleEditExam(exam, e)} className="text-slate-400 hover:text-blue-600"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                           <button onClick={(e) => { e.stopPropagation(); deleteExam(exam.id).then(loadData); }} className="text-slate-400 hover:text-red-600"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        </div>
                     )}
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 mb-2 line-clamp-2">{exam.title}</h3>
                  <div className="text-sm text-slate-500 mb-4 flex items-center gap-4">
                     <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> {exam.questionCount} câu</span>
                     <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> {exam.durationMinutes}'</span>
                  </div>
                  <div className="mt-auto grid grid-cols-2 gap-2">
                     <Button size="sm" variant="secondary" onClick={() => { setCurrentExam(exam); setExamMode('practice'); setView(AppView.EXAM); }}>Luyện tập</Button>
                     <Button size="sm" onClick={() => { setCurrentExam(exam); setExamMode('exam'); setView(AppView.EXAM); }}>Thi thử</Button>
                  </div>
               </div>
            ))
         )}
      </div>
    </div>
    );
  };

  return (
    <Layout userRole={userRole} onLogout={userRole ? handleLogout : undefined}>
      {view === AppView.LOGIN && renderLogin()}
      {view === AppView.DASHBOARD && renderDashboard()}
      {view === AppView.USER_MANAGEMENT && renderUserManagement()}
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
    </Layout>
  );
};

export default App;