import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { ExamType } from '../types';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../services/firebaseConfig';

interface AdminUser {
  uid: string;
  email: string;
  fullName: string;
  role: 'student' | 'teacher' | 'admin';
  allowedExamTypes: ExamType[];
  createdAt: number;
  createdBy: string;
}

interface UserManagementProps {
  onBack: () => void;
  adminEmail: string;
}

export const UserManagement: React.FC<UserManagementProps> = ({ onBack, adminEmail }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state for creating new user
  const [newUserForm, setNewUserForm] = useState({
    email: '',
    fullName: '',
    password: '',
    role: 'student' as 'student' | 'teacher' | 'admin',
    tsa: true,
    hsa: true
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      const usersList: AdminUser[] = [];
      snapshot.forEach(doc => {
        usersList.push({
          uid: doc.id,
          ...doc.data()
        } as AdminUser);
      });
      
      setUsers(usersList);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newUserForm.email || !newUserForm.password || !newUserForm.fullName) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (newUserForm.password.length < 6) {
      setError('Mật khẩu phải ít nhất 6 ký tự');
      return;
    }

    try {
      setLoading(true);

      // 1. Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newUserForm.email,
        newUserForm.password
      );

      // 2. Save user profile to Firestore
      const allowedTypes: ExamType[] = [];
      if (newUserForm.tsa) allowedTypes.push(ExamType.TSA);
      if (newUserForm.hsa) allowedTypes.push(ExamType.HSA);

      const newUser: AdminUser = {
        uid: userCredential.user.uid,
        email: newUserForm.email,
        fullName: newUserForm.fullName,
        role: newUserForm.role,
        allowedExamTypes: allowedTypes,
        createdAt: Date.now(),
        createdBy: adminEmail
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);

      // 3. Add to local state
      setUsers([...users, newUser]);

      // 4. Reset form
      setNewUserForm({
        email: '',
        fullName: '',
        password: '',
        role: 'student',
        tsa: true,
        hsa: true
      });

      setSuccess(`✅ Tạo tài khoản thành công: ${newUserForm.email}`);

    } catch (err: any) {
      console.error('Error creating user:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Email này đã được đăng ký');
      } else if (err.code === 'auth/invalid-email') {
        setError('Email không hợp lệ');
      } else {
        setError(err.message || 'Lỗi tạo tài khoản');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (uid: string, email: string) => {
    if (!confirm(`Bạn chắc chắn muốn xóa tài khoản ${email}?`)) {
      return;
    }

    try {
      setLoading(true);
      
      // Delete from Firestore
      await deleteDoc(doc(db, 'users', uid));
      
      // Remove from local state
      setUsers(users.filter(u => u.uid !== uid));
      
      setSuccess(`✅ Xóa tài khoản ${email} thành công`);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Lỗi xóa tài khoản');
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      student: '👨‍🎓 Học sinh',
      teacher: '👨‍🏫 Giáo viên',
      admin: '👨‍💼 Quản trị'
    };
    return labels[role] || role;
  };

  const getExamTypesLabel = (types: ExamType[]) => {
    return types.map(t => t === 'TSA' ? '🧠 TSA' : '📚 HSA').join(' + ');
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">👥 Quản Lý Tài Khoản</h1>
        <Button onClick={onBack} variant="secondary">Quay lại</Button>
      </div>

      {/* Create New User Form */}
      <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">➕ Tạo Tài Khoản Mới</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 font-medium">
            {success}
          </div>
        )}

        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">📧 Email</label>
              <input
                type="email"
                value={newUserForm.email}
                onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="user@example.com"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">📝 Họ Tên</label>
              <input
                type="text"
                value={newUserForm.fullName}
                onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Nguyễn Văn A"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">🔐 Mật Khẩu</label>
              <input
                type="password"
                value={newUserForm.password}
                onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Ít nhất 6 ký tự"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">👤 Vai Trò</label>
              <select
                value={newUserForm.role}
                onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as any })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                disabled={loading}
              >
                <option value="student">👨‍🎓 Học sinh</option>
                <option value="teacher">👨‍🏫 Giáo viên</option>
                <option value="admin">👨‍💼 Quản trị</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">📖 Quyền Truy Cập Đề Thi</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newUserForm.tsa}
                  onChange={(e) => setNewUserForm({ ...newUserForm, tsa: e.target.checked })}
                  className="w-4 h-4"
                  disabled={loading}
                />
                <span className="text-slate-700 font-medium">🧠 TSA (Tư duy)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newUserForm.hsa}
                  onChange={(e) => setNewUserForm({ ...newUserForm, hsa: e.target.checked })}
                  className="w-4 h-4"
                  disabled={loading}
                />
                <span className="text-slate-700 font-medium">📚 HSA (Đánh giá)</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              className="shadow-lg shadow-indigo-200"
            >
              {loading ? '⏳ Đang tạo...' : '✅ Tạo Tài Khoản'}
            </Button>
          </div>
        </form>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800">📋 Danh Sách Người Dùng ({users.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Email</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Họ Tên</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Vai Trò</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Quyền Đề Thi</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Ngày Tạo</th>
                <th className="px-6 py-3 text-center text-sm font-bold text-slate-700">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.uid} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-700">{user.email}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">{user.fullName}</td>
                  <td className="px-6 py-4 text-sm">{getRoleLabel(user.role)}</td>
                  <td className="px-6 py-4 text-sm">{getExamTypesLabel(user.allowedExamTypes)}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleDeleteUser(user.uid, user.email)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-700 font-bold text-sm px-3 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      🗑️ Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              <p className="text-lg font-medium">Chưa có người dùng nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
